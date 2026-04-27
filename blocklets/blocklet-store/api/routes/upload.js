const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const ssri = require('ssri');
const semver = require('semver');
const { get, cloneDeep } = require('lodash-es');
const { verifyMultiSig } = require('@blocklet/meta/lib/verify-multi-sig');
const { validateMeta: validateBlockletMeta } = require('@blocklet/meta/lib/validate');
const { validateLogo, validateScreenshots } = require('@blocklet/images');
const { isFreeBlocklet } = require('@blocklet/meta/lib/util');

const { createNftFactoryItx } = require('@blocklet/meta/lib/payment/v2');
const xbytes = require('xbytes');
const AdmZip = require('adm-zip');
const env = require('../libs/env');
const { getTokenStateList, prettyPrice, getAddressList } = require('../libs/blocklet');
const logger = require('../libs/logger');
const { wallet, client } = require('../libs/auth');
const {
  generateStaticFiles,
  extractTarball,
  getDraftAssetsDir,
  getBlockletDir,
  getPayloadFromToken,
  doBlockletPublish,
  getDraftTempAssetsDir,
} = require('../libs/utils');
const Blocklet = require('../db/blocklet');
const BlockletVersion = require('../db/blocklet-version');
const AccessToken = require('../db/access-token');
const { attachDelegationSignature, attachStoreSignature } = require('../libs/attach-signature');
const { event, Events } = require('../events');
const { maxBundleSize } = require('../libs/env');
const { getBlockletName } = require('../libs/blocklet-utils');
const { ensureUser } = require('../middlewares');
const { checkDeveloperPassport } = require('../libs/auth-utils');
const { VERSION_STATUS, REVIEW_TYPE } = require('../db/constant');
const { systemComment } = require('../libs/comment');
const { LOCALE_NAME } = require('../libs/constant');
const sequelize = require('../db/migration-utils/sequelize');
const { SCHEMA } = require('../libs/schema');
const { service } = require('../libs/auth');
const { getTargetOrg, getUserOrgs } = require('../hooks/tools/utils');

const router = express.Router();

const storage = multer.diskStorage({
  destination: env.tempUploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const getExtractDir = (file) => path.join(path.dirname(file), path.basename(file, path.extname(file)));

const upload = multer({ storage });

const cleanUploadFiles = (req) => {
  if (req.files) {
    const blockletMetaFile = (req.files['blocklet-meta'] || [])[0]?.path;
    const blockletTarballFile = (req.files['blocklet-tarball'] || [])[0]?.path;
    const blockletReleaseFile = (req.files['blocklet-release'] || [])[0]?.path;

    if (blockletReleaseFile) {
      const extractDir = getExtractDir(blockletReleaseFile);
      if (fs.existsSync(extractDir)) {
        fs.removeSync(extractDir);
      }
      if (fs.existsSync(blockletReleaseFile)) {
        fs.removeSync(blockletReleaseFile);
      }
    }

    if (fs.existsSync(blockletMetaFile)) {
      fs.removeSync(blockletMetaFile);
    }

    if (fs.existsSync(blockletTarballFile)) {
      fs.removeSync(blockletTarballFile);
    }
  }
  if (fs.existsSync(req.tempDir)) {
    fs.removeSync(req.tempDir);
  }
};

const responseError = (status, message) => (req, res) => {
  cleanUploadFiles(req);
  logger.error('upload error', { status, message, url: req.originalUrl, ip: req.headers['x-real-ip'] });
  res.status(status).json({ error: message });
};

const parseUpload = (req) => {
  if (req.files['blocklet-release']) {
    const source = Blocklet.SOURCE.WEBSITE;
    const filePath = req.files['blocklet-release'][0].path;

    if (fs.existsSync(filePath)) {
      const extractDir = getExtractDir(filePath);
      const zip = new AdmZip(filePath);
      zip.extractAllTo(extractDir, true);

      let releaseDir = extractDir;
      if (fs.existsSync(path.join(extractDir, 'release'))) {
        releaseDir = path.join(extractDir, 'release');
      }

      const blockletMetafile = path.join(releaseDir, 'blocklet.json');
      if (fs.existsSync(blockletMetafile)) {
        const blockletMeta = JSON.parse(fs.readFileSync(blockletMetafile).toString());
        const blockletTarballFile = path.join(releaseDir, blockletMeta.dist.tarball);
        return { source, blockletMetafile, blockletTarballFile };
      }
    }

    return { source, blockletMetafile: null, blockletTarballFile: null };
  }

  const blockletMetafile = req.files['blocklet-meta'][0].path;
  const blockletTarballFile = req.files['blocklet-tarball'][0].path;
  return { source: req.body.source || Blocklet.SOURCE.CLI, blockletMetafile, blockletTarballFile };
};

const getUserDid = async (req) => {
  const { signer, user } = req;
  if (signer) {
    const accessToken = await AccessToken.findOne({ id: signer });

    if (!accessToken) {
      return {
        error: {
          code: 401,
          message: `AccessToken does not exist, make sure you have set a right AccessToken: ${env.appUrl}`,
        },
      };
    }

    return { userDid: accessToken.userDid };
  }

  if (!user) {
    return {
      error: { code: 401, message: `Login required: ${env.appUrl}` },
    };
  }

  return { userDid: user.did };
};

const validateBody = async (req, res, next) => {
  try {
    const { blockletMetafile, blockletTarballFile, source } = await parseUpload(req);
    req.blockletMetafile = blockletMetafile;
    req.blockletTarballFile = blockletTarballFile;
    req.source = source;

    if (!blockletMetafile) {
      return responseError(400, 'Invalid blocklet meta file, found empty')(req, res);
    }

    if (!blockletTarballFile) {
      return responseError(400, 'Invalid blocklet tarball file, found empty')(req, res);
    }

    const { size: tarballFileBytes } = fs.statSync(blockletTarballFile);
    // @see: https://physics.nist.gov/cuu/Units/binary.html
    const maxBundleBytes = xbytes.parseSize(maxBundleSize);

    if (tarballFileBytes > maxBundleBytes) {
      const blockletMeta = JSON.parse(fs.readFileSync(blockletMetafile).toString());
      const blockletName = getBlockletName({ meta: blockletMeta });

      return responseError(
        500,
        `blocklet bundle size(${xbytes(tarballFileBytes)}) for ${blockletName} exceeded max bundle size(${xbytes(
          maxBundleBytes
        )}) of store`
      )(req, res);
    }
  } catch (error) {
    logger.error('upload failed on validateBody step:', { error });
    return responseError(500, 'upload failed on validateBody step')(req, res);
  }

  return next();
};

// Do not trust, verify!!!
const validateMeta = (req, res, next) => {
  let blockletMeta;
  try {
    blockletMeta = JSON.parse(fs.readFileSync(req.blockletMetafile).toString());
  } catch (error) {
    logger.error('upload failed on validateMeta step:', { error });
    return responseError(500, 'upload failed on validateMeta step')(req, res);
  }
  try {
    validateBlockletMeta(blockletMeta);
    req.meta = blockletMeta;
  } catch (err) {
    return responseError(400, err.message)(req, res);
  }
  return next();
};

// Do not trust, verify!!
const validateStaticFiles = async (req, res, next) => {
  const { meta, blockletTarballFile } = req;

  const responseErrMsg = (message) => {
    cleanUploadFiles(req);
    logger.error('validateStaticFiles', { status: 400, message });
    res.status(400).json({ error: message });
  };

  try {
    // 解压前，检测一下screenshots 数量是否符合要求
    const { minImageCount, maxImageCount } = env.preferences;
    const { screenshots } = meta;
    let errorMessages = [];

    // 解压 blocklet 的 tarball 文件, 开始校验物料是否符合要求
    const tempDir = path.join(env.dataDir, Date.now().toString());
    const extractedTarballFilepath = await extractTarball(blockletTarballFile, tempDir);
    req.tempDir = tempDir;
    req.extractedTarballFilepath = extractedTarballFilepath;

    // 校验 logo 文件
    const { logoImageType, maxLogoSize } = env.preferences;

    errorMessages = await validateLogo(meta.logo, {
      extractedFilepath: extractedTarballFilepath,
      maxSize: maxLogoSize * 1024,
      width: 256,
      logoType: logoImageType,
    });

    if (errorMessages.length) {
      return responseErrMsg(errorMessages.join('\n'));
    }

    // 校验 screenshots 文件
    const { maxImageSize, imageMinHeight, imageMinWidth } = env.preferences;

    errorMessages = await validateScreenshots(screenshots, {
      extractedFilepath: extractedTarballFilepath,
      maxSize: maxImageSize * 1024 * 1024,
      minHeight: imageMinHeight,
      minWidth: imageMinWidth,
      minCount: minImageCount,
      maxCount: maxImageCount,
    });

    if (errorMessages.length) {
      return responseErrMsg(`\n${errorMessages.join('\n')}`);
    }
    logger.info('Validate static files success', { did: meta.did });
  } catch (error) {
    logger.error('Validate static files failed', { error, did: meta.did });
    return responseErrMsg(error.message);
  }

  return next();
};

// Do not trust, verify!!!
const verifySig = async (req, res, next) => {
  if (!req.meta.signatures?.length && req.user) {
    return next();
  }

  try {
    const verifyRes = await verifyMultiSig(req.meta);
    if (verifyRes !== true) {
      logger.error('invalid signature', { blockletDid: req.meta.did });
      return responseError(401, 'invalid signature')(req, res);
    }

    req.signer = req.meta.signatures[0].signer;
  } catch (error) {
    logger.error('upload failed on verifySig step:', { error });
    return responseError(500, 'upload failed on verifySig step')(req, res);
  }

  return next();
};

// Do not trust, verify!!!
const verifyNftFactory = async (req, res, next) => {
  try {
    const { meta } = req;
    if (isFreeBlocklet(req.meta)) {
      return next();
    }
    // FIXME: 如果不是免费的, 需要创建一个 nftFactory
    // if (!meta.nftFactory) {
    //   return responseError(400, 'Missing NFT factory for paid blocklet')(req, res);
    // }

    // ensure minimum share requirement
    const share = get(meta, 'payment.share', []);
    const storeShare = share.find((x) => x.address === wallet.address);
    if (!storeShare) {
      return responseError(400, 'Blocklet share config does not contain store part')(req, res);
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(storeShare.value)) || Number(storeShare.value) < Number(env.shareRequirement)) {
      return responseError(400, `Blocklet share config does not satisfy requirement, expected ${env.shareRequirement}`)(
        req,
        res
      );
    }

    const { itx, stores, shares } = await createNftFactoryItx({
      blockletMeta: meta,
      ocapClient: client,
      issuers: [wallet.address],
      storeUrl: env.appUrl,
    });
    // 1. 用 meta 生成的 address 去检验 用户传进来 nftFactory address
    // 2. 判断定价分成策略是否变化
    if (meta.nftFactory !== itx.address) {
      return responseError(400, 'NFT factory address is illegal ')(req, res);
    }

    req.dependentStores = stores;
    req.paymentShares = shares;
  } catch (error) {
    logger.error('upload failed on verifyNftFactory step:', { error });
    return responseError(500, 'upload failed on verifyNftFactory step')(req, res);
  }

  return next();
};

const validatePermissions = async (req, res, next) => {
  try {
    let did;
    let version;
    const isPreValidate = !req.meta;
    if (isPreValidate) {
      did = req.headers['blocklet-did'];
      version = req.headers['blocklet-version'];
      // if no meta, skip check permissions if no did or version in headers
      if (!did || !version) {
        return next();
      }
    } else {
      did = req.meta.did;
      version = req.meta.version;
    }

    logger.info('validatePermissions', { did, version, isPreValidate });

    if (!isPreValidate) {
      // Get developer user did
      const { error, userDid } = await getUserDid(req);

      if (error) {
        return responseError(error.code, error.message)(req, res);
      }

      // Check developer user did
      try {
        await checkDeveloperPassport(userDid);
      } catch (err) {
        return responseError(
          403,
          `No permission to update this blocklet: ${err.message}, please contact store admin: ${env.appUrl}`
        )(req, res);
      }

      req.userDid = userDid;
    }

    const blocklet = await Blocklet.findOne({ did });
    if (!blocklet) {
      return next();
    }
    req.blocklet = blocklet;

    // Check blocklet status
    if (blocklet.status === Blocklet.STATUS.BLOCKED) {
      return responseError(400, `Blocklet ${blocklet.did} has been blocked, please contact store admin: ${env.appUrl}`)(
        req,
        res
      );
    }

    if (
      env.preferences.needReview &&
      [VERSION_STATUS.PENDING_REVIEW, VERSION_STATUS.IN_REVIEW, VERSION_STATUS.APPROVED].includes(
        blocklet.reviewVersion?.status
      )
    ) {
      return responseError(400, `Blocklet ${blocklet.did} is in review, please wait for review to complete`)(req, res);
    }

    if (!isPreValidate) {
      // Check blocklet owner
      const blockletOwnerDid = blocklet.owner.did;
      if (req.userDid !== blockletOwnerDid) {
        return responseError(
          403,
          `Blocklet owner does't have this AccessToken, login to store to check you are the owner of this blocklet or make sure you have set a right AccessToken: ${env.appUrl}`
        )(req, res);
      }
    }

    // Check blocklet version
    const { latestVersion: latestBlocklet } = blocklet;
    const newVersion = version;
    if (latestBlocklet) {
      const { version: latestVersion } = latestBlocklet;
      if (latestVersion && semver.lte(newVersion, latestVersion)) {
        return responseError(400, `Can't upload blocklet version less than ${latestVersion}`)(req, res);
      }
    }
  } catch (error) {
    logger.error('upload failed on validatePermissions step:', { error });
    return responseError(500, 'upload failed on validatePermissions step')(req, res);
  }

  return next();
};

const verifyTarballIntegrity = async (req, res, next) => {
  try {
    const temp = await ssri.fromStream(fs.createReadStream(req.blockletTarballFile), { algorithms: ['sha512'] });
    const tarballIntegrity = temp.toString();
    const { integrity: tarballIntegrityInMetafile } = req.meta.dist;

    if (tarballIntegrity !== tarballIntegrityInMetafile) {
      return responseError(400, 'invalid tarball')(req, res);
    }
  } catch (error) {
    logger.error('upload failed on verifyTarballIntegrity step:', { error });
    return responseError(500, 'upload failed on verifyTarballIntegrity step')(req, res);
  }

  return next();
};

const addExtraFields = (req, res, next) => {
  req.now = new Date().toISOString();
  next();
};

const saveRelease = async (req, res, next) => {
  const locale = req.cookies[LOCALE_NAME];
  const { blocklet, meta, dependentStores = [], paymentShares = [] } = req;
  const tmpMeta = cloneDeep(meta);
  const blockletDid = meta.did;
  const { error: blockletDidError } = SCHEMA.did(true).validate(blockletDid);
  if (blockletDidError) {
    return responseError(400, `Blocklet did is invalid: ${blockletDidError.message}`)(req, res);
  }

  logger.info('is update', !!blocklet, { did: blockletDid });

  // 准备 blocklet 的目录
  const blockletDestDir = getBlockletDir(blockletDid, meta.version);
  const draftStatic = getDraftAssetsDir(blockletDid);
  const draftTempAssetsDir = getDraftTempAssetsDir(blockletDid);

  // 开始事务
  const transaction = await sequelize.transaction();
  const transactionTimeout = setTimeout(() => {
    transaction.rollback();
    return responseError(408, 'transaction timeout')(req, res);
  }, 300000);
  try {
    // 1. 将 meta 和 tarball 文件写入到 blocklet 的目录下
    const targetBlockletTarballFile = path.join(blockletDestDir, meta.dist.tarball);
    fs.ensureDirSync(blockletDestDir);
    fs.writeFileSync(path.join(blockletDestDir, 'blocklet.json'), JSON.stringify(meta));
    fs.copyFileSync(req.blockletTarballFile, targetBlockletTarballFile);

    // 2. 生成草稿版本的 静态资源文件
    fs.ensureDirSync(draftTempAssetsDir);
    try {
      await generateStaticFiles({
        extractedTarballFilepath: req.extractedTarballFilepath,
        targetDir: draftTempAssetsDir,
        blockletMeta: meta,
      });
      logger.info('generated blocklet static files', { did: blockletDid });
    } catch (error) {
      clearTimeout(transactionTimeout);
      fs.removeSync(draftTempAssetsDir);
      logger.error('generate blocklet static files failed', { error, did: blockletDid });
      return responseError(500, error.message)(req, res);
    }

    // 3. 更新 access token 的 latestUsedAt
    if (req.signer) {
      await AccessToken.update({ id: req.signer }, { $set: { latestUsedAt: req.now } });
    }

    // 4. 如果 blocklet 是付费的, 需要更新 meta 的价格
    if (isFreeBlocklet(meta) === false) {
      const addressList = getAddressList(meta);
      const tokens = await getTokenStateList(addressList);
      await prettyPrice(tmpMeta, tokens);
    }

    // 5. 如果 blocklet 是付费的, 需要更新 meta 的价格
    if (paymentShares.length > 0) {
      const addressList = paymentShares.map((paymentShare) => paymentShare.tokenAddress);
      const tokens = await getTokenStateList(addressList);
      paymentShares.forEach((share) => {
        const token = tokens.find((row) => row.address === share.tokenAddress);
        if (token) {
          share.symbol = token.symbol;
        }
      });
    }

    const { source = Blocklet.SOURCE.CLI } = req;

    const saveVersionResult = await BlockletVersion.insert(
      {
        did: blockletDid,
        version: meta.version,
        status: VERSION_STATUS.DRAFT,
      },
      {
        transaction,
      }
    );
    logger.info('has insert new version', { did: blockletDid, version: meta.version, saveVersionResult });

    if (blocklet) {
      const updateResult = await Blocklet.update(
        { did: blockletDid },
        {
          $set: {
            draftVersion: saveVersionResult,
            latestVersion: saveVersionResult,
            draftMeta: tmpMeta,
            draftPaymentShares: paymentShares,
            dependentStores,
            source,
          },
        },
        {
          transaction,
        }
      );

      logger.info('update blocklet success', { result: updateResult });
    } else {
      const { userDid } = req;
      const saveResult = await Blocklet.insert(
        {
          did: blockletDid,
          // 在首次添加 meta.name 和 meta.title，确保能在管理端显示 name 和 title
          meta,
          draftMeta: tmpMeta,
          owner: { did: userDid },
          ownerDid: userDid,
          draftVersion: saveVersionResult,
          currentVersion: null,
          latestVersion: saveVersionResult,
          status: Blocklet.STATUS.NORMAL,
          source,
          dependentStores,
          draftPaymentShares: paymentShares,
        },
        {
          transaction,
        }
      );

      // 检测登录用户是否是 org 用户, 自动将 blocklet 添加到 org 中
      let { org: orgId = '' } = req.user || {};
      if (!req.user && req.userDid) {
        try {
          const orgs = await getUserOrgs({ did: req.userDid });
          const targetOrg = getTargetOrg(orgs);
          orgId = targetOrg?.id;
        } catch (error) {
          // 这里不要影响上传流程
          logger.error('get user orgs failed', error);
        }
      }

      if (orgId && saveResult.id) {
        await service.addOrgResource({ orgId, resourceIds: [saveResult.id], type: 'blocklet' });
      }
      logger.info('insert blocklet success', { result: saveResult });
    }
    event.emit(Events.BLOCKLET_UPLOADED, { blockletDid, locale });
    cleanUploadFiles(req);
    fs.removeSync(draftStatic);
    fs.renameSync(draftTempAssetsDir, draftStatic);
    await transaction.commit();
    clearTimeout(transactionTimeout);
    return next();
  } catch (error) {
    logger.error('upload failed on saveRelease step:', error);
    clearTimeout(transactionTimeout);
    try {
      fs.removeSync(blockletDestDir);
      fs.removeSync(draftTempAssetsDir);
    } catch (e) {
      logger.error('upload failed on saveRelease step:', e);
    }
    await transaction.rollback();
    return responseError(500, 'upload failed on saveRelease step')(req, res);
  }
};

async function autoPublish(req, res, status = 'uploaded') {
  const { meta, blocklet } = req;
  const locale = req.cookies[LOCALE_NAME];

  if (!blocklet) {
    logger.info('the blocklet is first time uploaded', { did: meta.did });
    return res.json({ status });
  }

  const { id, did } = blocklet;

  /** @type {Blocklet.Blocklet} */
  const currentBlocklet = await Blocklet.findOne({ id });
  const { reviewType, reviewVersion, currentVersion } = currentBlocklet;

  const runAutoPublish =
    !env.preferences.needReview ||
    reviewVersion?.status === VERSION_STATUS.APPROVED ||
    (currentVersion && reviewType === REVIEW_TYPE.FIRST);

  if (!runAutoPublish) {
    logger.info('the blocklet is need review', { did });
    return res.json({ status });
  }

  const token = currentBlocklet?.delegationToken?.autoPublish;

  // 如果没有配置过自动发布,直接返回upload成功
  if (!token) {
    logger.info('the blocklet is not open auto publish', { did });
    return res.json({ status });
  }

  // 当nft-factory发生变化了 && 开启了自动发布,此时应该关闭自动发布,让blocklet上传成功即可 @see: https://github.com/blocklet/blocklet-store/issues/712#issuecomment-1190166145
  // 应该先判断cli 返回的 meta 中是否存在 nft-factory ,如果存在代表是付费 blocklet ，才需要去校验两个版本的 nft-factory 是否一致。
  if (meta.nftFactory && meta.nftFactory !== currentBlocklet.meta.nftFactory) {
    // 关闭自动发布
    const { delegationToken } = currentBlocklet;
    delete delegationToken.autoPublish;
    await Blocklet.update(
      { id },
      {
        $set: { delegationToken: Object.keys(delegationToken).length > 0 ? delegationToken : null },
      }
    );
    event.emit(Events.BLOCKLET_NFT_FACTORY_CHANGED, {
      blockletDid: did,
      locale,
    });
    // 正常退出
    logger.info('the blocklet is nft-factory-changed', { did });
    return res.json({ status });
  }

  const { userPk } = getPayloadFromToken(token);

  const blockletMeta = fs.readJSONSync(path.join(getBlockletDir(did, meta.version), 'blocklet.json'));

  await attachDelegationSignature(blockletMeta, userPk, token);
  await attachStoreSignature(blockletMeta);

  await doBlockletPublish(blockletMeta, id);

  if (reviewVersion?.pendingAt) {
    systemComment({ reviewId: reviewVersion.id, text: '🚀 Auto Published !', color: '#9C27B0' });
  }

  event.emit(Events.BLOCKLET_AUTO_PUBLISHED, {
    blockletDid: did,
    blockletId: id,
    locale,
  });
  logger.info('the blocklet is auto published', { did });
  return res.json({ status: 'published' });
}

router.post(
  '',
  upload.fields([
    { name: 'blocklet-meta', maxCount: 1 },
    { name: 'blocklet-tarball', maxCount: 1 },
    { name: 'blocklet-release', maxCount: 1 },
  ]),
  // pre validate before upload to improve ux
  validatePermissions,
  ensureUser,
  validateBody,
  validateMeta,
  validateStaticFiles,
  verifySig,
  verifyNftFactory,
  // validate if pre validate is skipped
  validatePermissions,
  verifyTarballIntegrity,
  addExtraFields,
  saveRelease,
  (req, res) => autoPublish(req, res, 'uploaded')
);

module.exports = { router, autoPublish };
