const jwt = require("jsonwebtoken");
module.exports = {
	/**
	 * Following is a middleware which executes and check the access token and it should be passed
	 * in headers under authorization key
	 * @param {*} req
	 * @param {*} res
	 * @param {*} next
	 * @returns None
	 */
	APIValidate: async function (req, res, next) {
		try {
			const { token } = req.headers;
			if (!token) {
				return res.send({
					status: 500,
					message: "Authorization token not found",
					type: "error",
				});
			} else {
				const decoded = await jwt.verify(token, global.config.JWTMaster);
				if (decoded._id) {
					let users_count = await db.models.users.countDocuments({
						_id: decoded._id,
					});
					if (users_count) next();
					else
						return res.send({
							status: 500,
							message: "Authorization is invalid",
							type: "error",
						});
				} else {
					return res.send({
						status: 500,
						message: "Authorization is invalid",
						type: "error",
					});
				}
			}
		} catch (error) {
			return res.send({
				status: 500,
				message: "Authorization is invalid",
				type: "error",
			});
		}
	},
	validateApiKey: function (req, res, next) {
		const api_key = req.headers['x-api-key'];
		if (api_key === Config['x-api-key']) {
			next();
		} else {
			Logger.error({ message: Message.INVALID_KEY });
			ServerResponse.sendInvalidRequest(res, { message: Message.INVALID_KEY });
		}
	}
};