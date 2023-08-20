const crypto = require('crypto')
function convertToMd5(password) {
  const hash = crypto.createHash("md5").update(password).digest("hex");
  return hash;
};
function sendApiResponse(res, status, type = 'success', message, data = null) {
  return res.status(status).json({
    status,
    type,
    message,
    data
  });
}

module.exports = {
  sendApiResponse,
  convertToMd5
}