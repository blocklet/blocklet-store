const path = require('path');
const fs = require('fs-extra');
const { slice } = require('lodash');
const toMarkdown = require('mdast-util-to-markdown');
const fromMarkdown = require('mdast-util-from-markdown');
const semver = require('semver');

const md = require('markdown-it')({ html: false });

/**
 * 从 H2 标题文本中提取版本号
 * 支持多种格式：
 * - [1.2.3](url) (2024-01-01)
 * - 1.2.3 (2024-01-01)
 * - v1.2.3
 * - 1.2.3
 */
const extractVersionFromHeading = (headingElement) => {
  let headingText = '';

  // 递归提取所有文本内容
  const extractText = (node) => {
    if (node.type === 'text') {
      return node.value;
    }
    if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  };

  headingText = headingElement.children.map(extractText).join('');

  // 多种版本号提取规则，按优先级尝试
  const versionPatterns = [
    // [1.2.3](url) 格式
    /\[([^\]]+)\]/,
    // v1.2.3 格式
    /v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)/,
    // 纯数字版本号
    /(\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9.-]+)?)/,
  ];

  for (const pattern of versionPatterns) {
    const match = headingText.match(pattern);
    if (match) {
      const version = match[1];
      const coercedVersion = semver.coerce(version);
      if (coercedVersion) {
        return coercedVersion.version;
      }
    }
  }

  return null;
};

const getFormattedChangelog = (changeLogFilePath) => {
  if (!changeLogFilePath) {
    throw new Error('changeLogFilePath argument is required');
  }
  const result = [];
  if (!fs.existsSync(changeLogFilePath)) {
    return result;
  }
  if (path.basename(changeLogFilePath) !== 'CHANGELOG.md') {
    throw new Error('incorrect file name, The desired file name is CHANGELOG.md');
  }

  try {
    const mdAST = fromMarkdown(fs.readFileSync(changeLogFilePath));
    const mdASTChildren = mdAST?.children || [];
    const h2IndexList = [];

    mdASTChildren.forEach((element, index) => {
      if (element.type === 'heading' && element.depth === 2) {
        h2IndexList.push(index);
      }
    });

    h2IndexList.forEach((h2Index, index) => {
      const mdASTChildrenLength = mdASTChildren.length - 1;
      let body = null;
      const startIndex = h2Index + 1;
      const endIndex = h2IndexList[index + 1];

      // 如果起点大于数组的最后一项 body=''
      if (startIndex > mdASTChildrenLength) {
        body = '';
      } else {
        body = slice(mdASTChildren, startIndex, endIndex);
      }

      // 使用改进的版本号提取函数
      const title = extractVersionFromHeading(mdASTChildren[h2Index]);
      result.push({ title, body });
    });

    result.forEach((item) => {
      const bodyMD = toMarkdown({ type: 'root', children: item.body });
      item.body = md.render(bodyMD);
      // title 已经是标准化的版本号，不需要再次处理
    });
  } catch (error) {
    throw new Error(`CHANGELOG.md parse failed ${error.message}`);
  }
  if (result.length === 0) {
    throw new Error('CHANGELOG.md file is empty');
  }

  return result.filter((x) => !!x.title);
};

// changeLogs are sorted by version, desc
// versions are sorted by createdAt desc (aka. version)
const getChangeLogUpdates = (changeLogs, versions) => {
  const updates = [];
  let buffer = '';
  for (let index = changeLogs.length - 1; index >= 0; index--) {
    const { title, body = '' } = changeLogs[index];
    if (versions.find((x) => semver.eq(x.version, title))) {
      updates.unshift({
        version: title,
        changeLog: body + buffer,
      });
      buffer = '';
    } else if (versions.find((x) => semver.gt(x.version, title))) {
      buffer += body;
    }
  }

  return updates.filter((x) => !!x.changeLog);
};

module.exports = {
  getFormattedChangelog,
  getChangeLogUpdates,
};
