function ensureVersion(req, res, next) {
  const { headers } = req;
  const serverVersion = headers['x-blocklet-server-version'];
  const storeVersion = headers['x-blocklet-store-version'];
  req.serverVersion = serverVersion;
  req.storeVersion = storeVersion;
  next();
}

module.exports = ensureVersion;
