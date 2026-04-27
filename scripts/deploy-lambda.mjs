#!/usr/bin/env zx

import { join } from 'path';
import { cwd } from 'process';

const { writeJsonSync } = require('fs-extra'); // 确保安装了 fs-extra
const fs = require('fs');

require('dotenv').config({ path: join(cwd(), '.env.local') });

class LambdaCloudFrontDeployer {
  constructor(distributionIds, functionName) {
    this.distributionIds = distributionIds.split(',').map(id => id.trim()).filter(Boolean);
    this.functionName = functionName;
    this.functionZip = join(cwd(), 'blocklets/cloudfront-shield/dist/function.zip')
  }

  async getLatestVersion() {
    const latestVersion = await $`aws lambda list-versions-by-function --function-name ${this.functionName} --query 'Versions[-1].Version' --output text`;
    return latestVersion;
  }

  async shouldDeploy() {
    // @note: 注意，目前比对的是文件的 size 来决定是否需要发布新版本，遇到的问题概率会比较小。为什么不用文件 hash 来对比，是因为文件 hash 在 S3 中是会一直变化，这使得我基本不可能对它进行准确的判断。
    const localFunctionCodeHash = await this.getLocalFunctionCodeHash();
    const remoteFunctionCodeHash = await this.getRemoteFunctionCodeHash();

    console.log({
      remoteFunctionCodeHash,
      localFunctionCodeHash
    })

    return remoteFunctionCodeHash !== localFunctionCodeHash; 
  }

  async getRemoteFunctionCodeHash() {
    const codeSha256 = await $`aws lambda list-versions-by-function --function-name ${this.functionName} --query 'Versions[-1].CodeSize' --output text`;

    const remoteHash = parseInt(codeSha256.stdout.trim());

    return remoteHash; 
  }

  async getLocalFunctionCodeHash() {
    const stat =  fs.statSync(this.functionZip);
    const localHash = stat.size; // 返回新代码的哈希值

    return localHash;
  }

  async deploy() {
    if (!(await this.shouldDeploy())) {
      console.log("No changes detected in the function code. Skipping function deploy.");
      return; // 代码没有变化，直接返回
    }
    
    await this.publish();
    await this.updateDistributions();
  }

  async publish() {

    console.log("Publish...");

    // 更新 Lambda 函数代码
    await $`aws lambda update-function-code --function-name ${this.functionName} --zip-file fileb://${this.functionZip} `;

    await new Promise(resolve => setTimeout(resolve, 30000)); // 等待 30 秒

    console.log("Get latest version...");
    // 发布新版本并获取版本号
    const { stdout: latestVersion } = await $`aws lambda publish-version --function-name ${this.functionName}`;
    const latestFunctionVersion = JSON.parse(latestVersion).Version;
    console.log(`Latest version: ${latestFunctionVersion}`);

    // 更新别名
    await $`aws lambda update-alias --function-name ${this.functionName} --name "production" --function-version ${latestFunctionVersion}`;

    console.log("Deployment complete!");
  }


  async updateDistributions() {
    await Promise.all(this.distributionIds.map(id => this.updateDistribution(id)));
  }

  async updateDistribution(distributionId) {

    const latestVersion = await this.getLatestVersion();

    const output = await $`aws cloudfront get-distribution-config --id ${distributionId}`;
    console.log('updateDistribution',distributionId, output.exitCode);

    const data = JSON.parse(output.stdout);
    const etag = data.ETag;
    const config = data.DistributionConfig;
    config.CacheBehaviors.Items.forEach((item) => {
      item.LambdaFunctionAssociations.Items?.forEach((item) => {
        if (item.LambdaFunctionARN && item.LambdaFunctionARN.includes(this.functionName)) {
          console.log(item.LambdaFunctionARN);
          item.LambdaFunctionARN = `${this.functionName}:${latestVersion}`.trim();
        }
      });
    });

    const configPath = join(cwd(), `${distributionId}.config.json`);
    writeJsonSync(configPath, config);

    await $`
    aws cloudfront update-distribution --id ${distributionId} --if-match ${etag} --distribution-config file://${configPath}`;

    console.log(`updateDistribution(${distributionId}) successfully`);
  }

}

const distributionIds = process.env.AWS_LAMBDA_DISTRIBUTION_IDS;
const functionName =
  process.env.AWS_LAMBDA_FUNCTION_NAME;

const deployer = new LambdaCloudFrontDeployer(distributionIds, functionName);
await deployer.deploy();

console.log('done');
