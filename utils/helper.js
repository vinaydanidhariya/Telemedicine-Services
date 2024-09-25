const crypto = require("crypto");
const db = require("../models/");
const nodemailer = require("nodemailer");

const path = require("path");
const fs = require("fs/promises");
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

async function sendOTPEmail(email, otp, userName) {
	try {
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.NODEMAILER_USER,
				pass: process.env.NODEMAILER_PASS,
			},
		});

		const emailTemplatePath = path.join(__dirname, "../email-templates", "otpTemplate.html");
		const template = await fs.readFile(emailTemplatePath, "utf-8"); // Use fs.readFile

		const filledTemplate = template.replace(/\[DoctorName\]/g, userName).replace(/\[OTPSTRING\]/g, otp);

		const mailOptions = {
			from: `KidsDoc Dr <${process.env.NODEMAILER_USER}>`,
			to: email,
			subject: "OTP",
			html: filledTemplate,
		};

		await transporter.sendMail(mailOptions);
		return {
			success: true,
			message: "Email sent successfully",
		};
	} catch (error) {
		console.error("Error sending email:", error);
		return {
			success: false,
			message: "Email sending failed",
			error: error.message, // Include error message for debugging
		};
	}
}

module.exports = {
	verifyOTP,
	sendOTPEmail,
	sendApiResponse,
	convertToMd5,
	generateOTP,
};
