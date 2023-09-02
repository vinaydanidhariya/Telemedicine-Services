const crypto = require("crypto");
const db = require("../models/");
function convertToMd5(password) {
	const hash = crypto.createHash("md5").update(password).digest("hex");
	return hash;
}

function sendApiResponse(res, status, type = "success", message, data = null) {
	return res.status(status).json({
		status,
		type,
		message,
		data,
	});
}

const generateOTP = (otp_length) => {
	// Declare a digits variable
	// which stores all digits
	var digits = "0123456789";
	let OTP = "";
	for (let i = 0; i < otp_length; i++) {
		OTP += digits[Math.floor(Math.random() * 10)];
	}
	return OTP;
};

const verifyOTP = async (phone_number, otp) => {
	const user = await db.User.findOne({
		where: { phone: phone_number },
	});
	console.log(user);
	if (otp === user.otpString) {
		console.log("otp verified");
		await db.User.update(
			{
				isOTP: true,
			},
			{
				where: { userId: user.userId },
			}
		);
		return true;
	} else {
		return false;
	}
};

module.exports = {
	verifyOTP,
	sendApiResponse,
	convertToMd5,
	generateOTP,
};
