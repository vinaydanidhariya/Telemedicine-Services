const jwt = require('jsonwebtoken');
const Message = require('../helpers/message');
const { deepClone } = require('../helpers/utils');
import Logger from '../helpers/logger';
import ServerResponse from '../helpers/server-response';

import db from '../models';
const Config = require('../config/config.json')[process.env.NODE_ENV];

function authorize(req, res, next) {
    let token = req.headers.authorization;
    if (!token || token == null) return res.status(401).json({ message: Message.UNAUTHORIZED_USER });
    token = token.split(' ')[1];
    jwt.verify(token, Config.secret, (err, user) => {
        console.log(err);
        if (err) return res.status(401).json({ message: Message.UNAUTHORIZED_USER });
        if (!user || !user.userId) return res.status(403).json({ message: Message.UNAUTHORIZED_USER });
        // checking for valid accountId here
        db.User.findOne({
            attributes: ['status', 'isEmailVerified'],
            where: { userId: user.userId }
        }).then(response => {
            response = deepClone(response);
            if (response) {
                if (!response.status) {
                    Logger.error({ message: Message.ACCOUNT_LOCKED });
                    return res.status(401).json({ message: Message.ACCOUNT_LOCKED });
                }
                // if (!response.isEmailVerified) {
                //   Logger.error({ message: Message.VERIFICATION_PENDING })
                //   return res.status(401).json({ message: Message.VERIFICATION_PENDING });
                // }
                req.user = user;
                next();
            } else {
                Logger.error({ message: Message.NO_RECORD_FOUND });
                return res.status(401).json({ message: Message.UNAUTHORIZED_USER });
            }
        }, error => {
            console.log(error);
            return res.status(401).json({ message: Message.UNAUTHORIZED_USER });
        });
    });
}

function parseBrowserId(req, res, next) {
    next();
}

function validateApiKey(req, res, next) {
    const api_key = req.headers['x-api-key'];
    if (api_key === Config['x-api-key']) {
        next();
    } else {
        Logger.error({ message: Message.INVALID_KEY });
        ServerResponse.sendInvalidRequest(res, { message: Message.INVALID_KEY });
    }
}

export default { parseBrowserId, authorize, validateApiKey };
