/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(src);
    const writeStream = fs.createWriteStream(dest);

    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);

    readStream.pipe(writeStream);
  });
}

async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function copyRecursive(src, dest) {
  const srcStats = await fs.promises.stat(src);

  if (srcStats.isDirectory()) {
    await copyDirectory(src, dest);
  } else {
    await copyFile(src, dest);
  }
}

const ensureDirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports = {
  copyFile,
  copyDirectory,
  copyRecursive,
  ensureDirSync,
};
