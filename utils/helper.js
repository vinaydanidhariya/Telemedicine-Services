const crypto = require('crypto')
function convertToMd5(password) {
    const hash = crypto.createHash("md5").update(password).digest("hex");
    return hash;
  };

  module.exports = {
    convertToMd5
  }