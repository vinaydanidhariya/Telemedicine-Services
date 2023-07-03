const Constants = require('./constants');
const _ = require('underscore');
const requestIp = require('request-ip');
const Moment = require('moment');
// import db  from"models";

class Logger {
  async writeRequestLogs(loggerUDID, request) {
    if (!_.contains(Constants.UNWANTED_LOGGING_URLS, request.path)) {
      const ip = requestIp.getClientIp(request);
      const payload = (!_.isEmpty(request.body)) ? request.body : ((!_.isEmpty(request.params))) ? request.params : ((!_.isEmpty(request.query))) ? request.query : {};
      const requestObj = {
        loggerUDID,
        path: request.path,
        ip,
        authorization: (request.headers && request.headers.authorization) ? request.headers.authorization : '',
        payload: JSON.stringify(payload),
        isAuthorized: !!(request.account),
        account: request.account ? JSON.stringify(request.account) : null,
        statusCode: null,
        requestHeaders: JSON.stringify(request.headers),
        responseHeaders: null,
        createdDate: Moment().format(),
        modifiedDate: Moment().format()
      };
      // return db.ApiLogger.create(requestObj).then(response => {
      //   console.info({ message: "API Logs create success", /* response: response.dataValues */ });
      //   return null;
      // }, error => {
      //   console.error(error)
      //   return null;
      // });
      return null;
    }
  }

  async writeResponseLogs(loggerUDID, response) {
    if (response) {
      const responseObj = {
        statusCode: response.statusCode,
        response: JSON.stringify(response),
        modifiedDate: Moment().format()
      };

      // return db.ApiLogger.update(responseObj, { where: { loggerUDID: loggerUDID } }).then(updated => {
      //   console.info({ message: "API Logs updated success", response: updated });
      //   return null;
      // }, error => {
      //   console.error(error);
      //   return null;
      // });
      return null;
    } else {
      console.error('No Response logged');
    }
  }

  info(msg, UDID = null, methodName = null) {
    console.log('\x1b[36m', '-' + Moment().format(), 'INFO : ', msg);
    // Async Insert db entry for generated UDID
    this.writeInfoToDb(msg, UDID, methodName, Constants.LOGS.INFO);
  }

  error(msg, UDID = null, methodName = null) {
    console.error('\x1b[31m', '-' + Moment().format(), 'ERROR : ', msg);
    // Async Insert db entry for generated UDID
    this.writeInfoToDb(msg, UDID, methodName, Constants.LOGS.ERROR);
  }

  warn(msg, UDID = null, methodName = null) {
    console.log('\x1b[33m', '-' + Moment().format(), 'WARN : ', msg);
    // Async Insert db entry for generated UDID
    this.writeInfoToDb(msg, UDID, methodName, Constants.LOGS.WARN);
  }

  criticalError(msg, UDID = null, methodName = null) {
    console.log('\x1b[33m', '-' + Moment().format(), 'ERROR : ', msg);
    // Async Insert db entry for generated UDID
    this.writeInfoToDb(msg, UDID, methodName, Constants.LOGS.CRITICAL_ERROR);
  }

  writeInfoToDb(msg, UDID, methodName, type) {
    const errorObj = {
      message: msg && msg.message ? msg.message : null,
      loggerUDID: UDID,
      methodName,
      type
    };
    // db.Logs.create(errorObj).catch(error => {
    //   console.error(`Error while updating error ${error}`)
    // })
    return null;
  }
}

module.exports = new Logger();
