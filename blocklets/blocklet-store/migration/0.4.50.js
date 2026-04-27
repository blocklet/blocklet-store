/* eslint-disable no-await-in-loop */
const Blocklet = require('../api/db/blocklet');
const BlockletVersion = require('../api/db/blocklet-version');
const { getBlockletMeta } = require('../api/libs/blocklet');

async function migrateBlocklet(blockletItem) {
  const updateData = {
    $unset: {
      title: true,
      name: true,
    },
  };
  // 获取当前发布的版本号ID，如果没有，则获取最新草稿版本号ID
  let versionId;
  if (blockletItem.currentVersion) {
    versionId = blockletItem.currentVersion;
  } else if (blockletItem.draftVersion) {
    versionId = blockletItem.draftVersion;
  }

  if (versionId) {
    const tmpVersion = await BlockletVersion.findOne({ _id: versionId });
    if (tmpVersion?.version) {
      const meta = await getBlockletMeta(blockletItem.did, tmpVersion.version);
      // 如果查出的结果是已发布的版本，则将完整的 meta 写入
      // 如果查出的结果是草稿版本，则只存入 meta 中的 title 和 name
      updateData.$set = blockletItem.currentVersion
        ? { meta }
        : {
            meta: {
              title: meta.title,
              name: meta.name,
            },
          };
    }
  }
  // 如果找不到任何版本，则将 blocklet.name 和 blocklet.title 写入 blocklet.meta
  updateData.$set = updateData.$set || {
    meta: {
      title: blockletItem.title,
      name: blockletItem.name,
    },
  };

  await Blocklet.update({ did: blockletItem.did }, updateData);
}

async function migration() {
  const blockletList = await Blocklet.find();

  for (const blockletItem of blockletList) {
    await migrateBlocklet(blockletItem);
  }
}

migration();
