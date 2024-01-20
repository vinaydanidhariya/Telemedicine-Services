var express = require("express");
var router = express.Router();
let Razorpay = require("razorpay");
var crypto = require("crypto");
const moment = require("moment");
const Config = require("../../config/config.json")[process.env.NODE_ENV];
const db = require("../../models");
const { uuid } = require('uuidv4');
const {
	sendRegistrationMessage,
	getPaymentTemplatedMessageInput,
	sendMessage,
	transactionMessage,
} = require("../../utils/messageHelper");
const { appointmentMessage } = require("../../utils/messages");
const nodeMailer = require("nodemailer");
const { google } = require("googleapis");
var fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, 'data.json');
const transporter = nodeMailer.createTransport({
	service: "Gmail",
	auth: {
		user: Config.nodemailer.auth.user,
		pass: Config.nodemailer.auth.pass,
	},
});
router.post("/create-payment", async function (req, res, next) {
	try {
		let { userId, fullName, price, email, phone, selectedDoctor } = req.body;

		var instance = new Razorpay({
			key_id: Config.Razorpay.key_id,
			key_secret: Config.Razorpay.key_secret,
		});

		let newPrice = Number(price) * 100;
		const settings = await db.Setting.findOne();
		if (price == "500" || price === 500) {
			const data = require("./data.json");
			const firstElement = data.find(item => item.cost === 500);
			
			let short_url = firstElement.url;
			let id = firstElement.id;
			return res.send(
				{
					url:short_url,
					orderId:id
				}
			);
		} else if (price == "1000" || price === 1000) {
			const data = require("./data.json");
			const firstElement = data.find(item => item.cost === 1000);
			let short_url = firstElement.url;
			let id = firstElement.id;
			return res.send(
				{
					url:short_url,
					orderId:id
				}
			);
		}
		
		
		// const { short_url, id } = await instance.paymentLink.create({
		//  upi_link: false,
		//  amount: Math.floor(newPrice),
		//  currency: "INR",
		//  "notify": {
		//      "sms": true,
		//      "email": true
		//  },
		//   "customer": {
		//      "name": fullName,
		//      "email": email,
		//      "contact": phone
		//  },
		//  notes: {
		//      id: userId,
		//      name: fullName,
		//      email: email,
		//      mobile: phone,
		//      selectedDoctor: selectedDoctor,
		//  },
		// });
		const newNumber = settings.reachNumber + 1;
		await db.Setting.update(
			{ reachNumber: newNumber },
			{ where: { settingId: 1 } }
		);
		let short_url = urls[settings.reachNumber].url;
		let id = urls[settings.reachNumber].id;
		res.send(
			{
				url:short_url,
				orderId:id
			}
		);
	} catch (error) {
		console.log(error);
	}
});

router.post("/payment-callback1", async function (req, res, next) {
	try {
		console.log(JSON.stringify(req.body,null,2));
		const requestedBody = JSON.stringify(req.body);
		const receivedSignature = req.headers["x-razorpay-signature"];
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
			.update(requestedBody)
			.digest("hex");
		if (receivedSignature === expectedSignature) {
			const event = req.body.event;
			if (event === "payment_link.paid") {
				/**
				 * CODE GOES HERE
				 */
				fs.readFile(filePath, 'utf8', (err, data) => {
					if (err) {
						console.error(err);
						return;
					}

					const jsonData = JSON.parse(data);
					const filteredData = jsonData.filter(obj => obj.id !== req.body.payload.payment_link.entity.id);

					fs.writeFile(filePath, JSON.stringify(filteredData), 'utf8', err => {
						if (err) {
							console.error(err);
							return;
						}
						console.log('Object removed successfully!');
					});
				});

				/***
				 * -------------------------
				 */

				const status = req.body.payload.order.entity.status;
				if (status === "paid") {
					const userinfo = req.body.payload.payment.notes;
					const data = req.body.payload.payment;
					let cellNumber = data.entity.contact;
					cellNumber = cellNumber.replace("+", "");
					const newDetails = await db.WhatsappUser.findOne({
						where: { wa_id: cellNumber },
					});
					const userId = newDetails.userId;
					const name = newDetails.fullName;
					const email = newDetails.email;
					const mobile = newDetails.phone;
					const selectedDoctor = newDetails.selectedDoctor;
					const orderId = data.entity.order_id;
					const status = data.entity.status;
					const amount = data.entity.amount;
					const date = data.entity.created_at;
					const PaymentTransactionId = data.entity.id;
					const checkExists = await db.PaymentTransaction.findOne({ where: { orderId } });
					if (checkExists) {
						return res.status(200).send("Payment already received");
					}
					await db.PaymentTransaction.create({
						payerUserId: userId,
						PaymentTransactionId,
						paymentDate: moment.utc(),
						payerName: name,
						payerEmail: email,
						payerMobile: mobile,
						paymentAmount: amount / 100,
						receiverUserId: selectedDoctor,
						orderId,
						paymentStatus: status,
					});

					await db.WhatsappUser.update(
						{ useStat: "PAYMENT-DONE", paymentId: orderId },
						{ where: { phone: mobile, appointmentConfirmed: false } }
					);

					const message = await transactionMessage(name, amount / 100, orderId);
					await sendRegistrationMessage(mobile, `${message}`);

					const userInfo = await db.WhatsappUser.findOne({
						where: { phone: mobile, appointmentConfirmed: false },
					});

					const prescription = await db.Prescription.create({
						patientId: userInfo.userId,
						doctorId: userInfo.selectedDoctor,
					});
					const doctorInfo = await db.User.findOne({
						where: { userId: userInfo.selectedDoctor },
					});

					const appointment = await db.Appointment.create({
						patientId: userInfo.userId,
						doctorId: userInfo.selectedDoctor,
						prescriptionId: prescription.prescriptionId,
						status: "RECEIVED",
					});
					await db.WhatsappUser.update(
						{
							userStat: "SEND-APPOINTMENT",
							appointmentConfirmed: true,
						},
						{
							where: {
								phone: mobile,
								appointmentConfirmed: false,
							},
						}
					);
					const formattedDate = moment(userInfo.appointmentDate).format("DD-MM-YYYY");
					const meetFormattedDate = moment(userInfo.appointmentDate).format("YYYY-MM-DD");
					let data1;

					const time12Hour = userInfo.appointmentTime;
					const slotsStart = moment(time12Hour, "h:mm a").format("HH:mm");

					const slotsEnd = moment(slotsStart, "HH:mm").add(15, "minutes").format("HH:mm");
					const settings = await db.Setting.findOne();
					try {
						const meetOptions = {
							clientId: Config.GoogleCred.clientId,
							refreshToken: settings.refreshToken,
							date: meetFormattedDate,
							startTime: slotsStart,
							endTime: slotsEnd,
							clientSecret: Config.GoogleCred.googleClientSecret,
							summary: "KidsDoc-Online doctor consultation!",
							location: "Virtual venue",
							description: "Online consultation with your doctor",
							attendees: [{ email: doctorInfo.email }, { email: userInfo.email }],
							reminders: {
								useDefault: false,
								overrides: [
									{
										method: "email",
										minutes: 15,
									},
									{
										method: "email",
										minutes: 60,
									},
									{
										method: "popup",
										minutes: 10,
									},
								],
							},
							colorId: 4,
							sendUpdates: "all",
							status: "confirmed",
						};
						const result = await meet(meetOptions);
						console.log("🎉 Appointment scheduled successfully!");
						console.log(
							"💼 A virtual appointment has been scheduled with your doctor."
						);
						console.log("🕒 Date:", meetFormattedDate);
						console.log("⏰ Time:", slotsStart, "-", slotsEnd);
						console.log("📌 Location: Virtual venue");
						console.log("📅 You will receive email reminders before the appointment.");

						if (
							result.status == "success" ||
							result.status == "confirmed" ||
							result.status == "Confirmed"
						) {
							data1 = appointmentMessage(
								userInfo.fullName,
								formattedDate,
								userInfo.appointmentTime,
								result.link,
								doctorInfo.firstName + " " + doctorInfo.lastName
							);
						} else {
							data1 = appointmentMessage(
								userInfo.fullName,
								formattedDate,
								userInfo.appointmentTime,
								"FAILED CASE LINK"
							);
						}
						await sendRegistrationMessage(mobile, data1);
						await sendRegistrationMessage(
							`91` + doctorInfo.phone,
							`Hello Doctor, You have new appointment at ${meetFormattedDate} from ${userInfo.appointmentTime} with ${userInfo.fullName}, Link to join ${result.link}`
						);
						const mailOptions = {
							from: Config.nodemailer.auth.user,
							to: [userInfo.email, doctorInfo.email],
							subject: "Online Consultation Booked",
							text: `Hello, You have appointment at ${meetFormattedDate} Time: ${userInfo.appointmentTime} with ${userInfo.fullName}. Link to join ${result.link}`,
							html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
							<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
							<head>
							<!--[if gte mso 9]>
							<xml>
							  <o:OfficeDocumentSettings>
								<o:AllowPNG/>
								<o:PixelsPerInch>96</o:PixelsPerInch>
							  </o:OfficeDocumentSettings>
							</xml>
							<![endif]-->
							  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
							  <meta name="viewport" content="width=device-width, initial-scale=1.0">
							  <meta name="x-apple-disable-message-reformatting">
							  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
							  <title></title>
							  
								<style type="text/css">
								  @media only screen and (min-width: 570px) {
							  .u-row {
								width: 550px !important;
							  }
							  .u-row .u-col {
								vertical-align: top;
							  }
							
							  .u-row .u-col-100 {
								width: 550px !important;
							  }
							
							}
							
							@media (max-width: 570px) {
							  .u-row-container {
								max-width: 100% !important;
								padding-left: 0px !important;
								padding-right: 0px !important;
							  }
							  .u-row .u-col {
								min-width: 320px !important;
								max-width: 100% !important;
								display: block !important;
							  }
							  .u-row {
								width: 100% !important;
							  }
							  .u-col {
								width: 100% !important;
							  }
							  .u-col > div {
								margin: 0 auto;
							  }
							}
							body {
							  margin: 0;
							  padding: 0;
							}
							
							table,
							tr,
							td {
							  vertical-align: top;
							  border-collapse: collapse;
							}
							
							p {
							  margin: 0;
							}
							
							.ie-container table,
							.mso-container table {
							  table-layout: fixed;
							}
							
							* {
							  line-height: inherit;
							}
							
							a[x-apple-data-detectors='true'] {
							  color: inherit !important;
							  text-decoration: none !important;
							}
							
							@media (min-width: 481px) and (max-width: 768px) {
							}
							
							table, td { color: #000000; } #u_body a { color: #3598db; text-decoration: underline; }
								</style>
							  
							  
							
							<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
							
							</head>
							
							<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #293c4b;color: #000000">
							  <!--[if IE]><div class="ie-container"><![endif]-->
							  <!--[if mso]><div class="mso-container"><![endif]-->
							  <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #293c4b;width:100%" cellpadding="0" cellspacing="0">
							  <tbody>
							  <tr style="vertical-align: top">
								<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
								<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #293c4b;"><![endif]-->
								
							  
							  
							<div class="u-row-container" style="padding: 0px;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: transparent;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:20px 10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							<table width="100%" cellpadding="0" cellspacing="0" border="0">
							  <tr>
								<td style="padding-right: 0px;padding-left: 0px;" align="center">
								  
								  <img align="center" border="0" src="https://kidsdocindia.com/wp-content/uploads/2021/09/sndp.png" alt="Logo" title="Logo" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 58%;max-width: 307.4px;" width="307.4"/>
								  </a>
								</td>
							  </tr>
							</table>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
							
							
							  
							  
							<div class="u-row-container" style="padding: 0px;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #3598db;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #3598db;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 0px 15px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <!--[if mso]><table width="100%"><tr><td><![endif]-->
								<h3 style="margin: 0px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word; font-family: 'Montserrat',sans-serif; font-size: 23px; font-weight: 400;"><span>Appointment Booked</span></h3>
							  <!--[if mso]></td></tr></table><![endif]-->
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
							
							
							  
							  
								<!--[if gte mso 9]>
								  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;min-width: 320px;max-width: 550px;">
									<tr>
									  <td background="%20" valign="top" width="100%">
								  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width: 550px;">
									<v:fill type="frame" src="%20" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
								  <![endif]-->
							  
							<div class="u-row-container" style="padding: 0px;background-image: url('%20');background-repeat: no-repeat;background-position: center top;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #3598db;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-image: url('%20');background-repeat: no-repeat;background-position: center top;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #3598db;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
									
							<table width="100%" cellpadding="0" cellspacing="0" border="0">
							  <tr>
								<td style="padding-right: 0px;padding-left: 0px;" align="center">
								  
								  <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1623155757689-gfgg.png" alt="Calendar" title="Calendar" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 550px;" width="550"/>
								  
								</td>
							  </tr>
							</table>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
								<!--[if gte mso 9]>
								  </v:textbox></v:rect>
								</td>
								</tr>
								</table>
								<![endif]-->
								
							
							
							  
							  
							<div class="u-row-container" style="padding: 0px;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px 20px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px 20px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px 15px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <!--[if mso]><table width="100%"><tr><td><![endif]-->
								<h3 style="margin: 0px; color: #293c4b; line-height: 140%; text-align: left; word-wrap: break-word; font-family: 'Montserrat',sans-serif; font-size: 18px; font-weight: 400;"><span><strong>Hello There,</strong></span></h3>
							  <!--[if mso]></td></tr></table><![endif]-->
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #656e72; line-height: 140%; text-align: left; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px; font-family: Lato, sans-serif;">Just a friendly reminder that we have an upcoming appointment. Please check the details below also keep an eye out for google invite and acknowledge as Yes. </span></p>
							<p style="font-size: 14px; line-height: 140%;"> </p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #293c4b; line-height: 140%; text-align: center; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%; text-align: left;"><span style="font-family: Montserrat, sans-serif; font-size: 16px; line-height: 22.4px; color: #7db00e;"><strong>Date                    : </strong>${meetFormattedDate}</span></p>
							<p style="font-size: 14px; line-height: 140%; text-align: left;"><span style="font-family: Montserrat, sans-serif; font-size: 16px; line-height: 22.4px; color: #7db00e;"><strong>Time                    : </strong> from ${userInfo.appointmentTime} </span></p>
							<p style="font-size: 14px; line-height: 140%; text-align: left;"><span style="font-family: Montserrat, sans-serif; font-size: 16px; line-height: 22.4px; color: #7db00e;"><strong>Link                     : </strong> ${result.link}</span></p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #656e72; line-height: 140%; text-align: left; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px; font-family: Lato, sans-serif;">If you have any questions or concerns please don't hesitate to get in touch with us<a rel="noopener" href="https://unlayer.com" target="_blank"> <strong>info@kidsdocindia.com</strong> </a></span></p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
							
							
							  
							  
							<div class="u-row-container" style="padding: 0px;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ecf0f1;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ecf0f1;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:25px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #7db00e; line-height: 140%; text-align: center; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;"><strong><span style="line-height: 22.4px; font-family: Lato, sans-serif; font-size: 16px;">You appointment is booked ! Hurray</span></strong></span></p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
							
							
							  
							  
							<div class="u-row-container" style="padding: 0px;background-color: transparent">
							  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
								<div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
								  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: transparent;"><![endif]-->
								  
							<!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
							  <div style="height: 100%;width: 100% !important;">
							  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
							  
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 0px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #ecf0f1; line-height: 140%; text-align: center; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%;">If you have any questions, feel free message us at info@kidsdocindia.com.</p>
							<p style="font-size: 14px; line-height: 140%;">All right reserved.<br />+91-7265999108<br />B1101, Decora Utsav, Sadhu Vasvani road, Rajkot, Gujarat ,India. 360002 </p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 0px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #5c5a5a;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
								<tbody>
								  <tr style="vertical-align: top">
									<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
									  <span>&#160;</span>
									</td>
								  </tr>
								</tbody>
							  </table>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
							  <tbody>
								<tr>
								  <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
									
							  <div style="font-size: 14px; color: #7e8c8d; line-height: 140%; text-align: center; word-wrap: break-word;">
								<p style="font-size: 14px; line-height: 140%;">© 2024 Tiny wings healthcare private limited. All Rights Reserved.</p>
							  </div>
							
								  </td>
								</tr>
							  </tbody>
							</table>
							
							  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
							  </div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
								  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
								</div>
							  </div>
							  </div>
							  
							
							
								<!--[if (mso)|(IE)]></td></tr></table><![endif]-->
								</td>
							  </tr>
							  </tbody>
							  </table>
							  <!--[if mso]></div><![endif]-->
							  <!--[if IE]></div><![endif]-->
							</body>
							
							</html>
							`,
						};

						await transporter.sendMail(mailOptions);
						/**
						 * SEND A MESSAGE TO DOCTOR AS WELL
						 */
						res.status(200).send("RECEIVED");
					} catch (error) {
						await sendRegistrationMessage(`916354010189`, `Appointment booking failed for ${userInfo.userId}`);
						console.error("❌ Appointment scheduling failed:", error);
						res.status(501).send("received but unverified resp");
					}
				}
			} else if (event === "payment.captured") {
				res.status(200).send("received");
			}
		} else {
			console.log("❌ Event not processed");
			res.status(200).send("Unverified");
		}
	} catch (error) {
		console.log(error);
		await sendRegistrationMessage(`916354010189`, 'Something went wrong');
		res.status(200).send("received but unverified resp");
	}
});

router.get("/", async function (req, res, next) {
	const { id } = req.query;
	if (id) {
		res.render("payment", { orderId: id });
	} else {
		res.render("payment-error");
	}
});

// Set up OAuth 2.0 client
const oauth2Client = new google.auth.OAuth2(
	Config.GoogleCred.clientId,
	Config.GoogleCred.googleClientSecret,
	Config.GoogleCred.callBackURL
);

router.get("/oauth2callback", async (req, res) => {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: "https://www.googleapis.com/auth/calendar.events",
	});
	res.redirect(authUrl);
});

router.get("/google-redirect", async (req, res) => {
	const { tokens } = await oauth2Client.getToken(req.query.code);
	console.log(
		"---------------------------------GOOGLE TOKEN------------------------------------------"
	);
	console.log(tokens);
	if (tokens && tokens.refresh_token) {
		await db.Setting.update(
			{ refreshToken: tokens.refresh_token },
			{ where: { settingId: 1 } }
		);
	}
	await sendRegistrationMessage("916354010189", JSON.stringify(tokens, null, 2));
	oauth2Client.setCredentials(tokens);
	return res.send();
});

async function meet(options) {
	const { google } = require("googleapis");
	const { OAuth2 } = google.auth;

	let oAuth2Client = new OAuth2(options.clientId, options.clientSecret);

	oAuth2Client.setCredentials({
		refresh_token: options.refreshToken,
	});

	// Create a new calender instance.
	let calendar = google.calendar({ version: "v3", auth: oAuth2Client });

	const event = {
		summary: options.summary,
		location: options.location,
		description: options.description,
		colorId: 1,
		conferenceData: {
			createRequest: {
				requestId: "zzz",
				conferenceSolutionKey: {
					type: "hangoutsMeet",
				},
			},
		},
		start: {
			dateTime: `${options.date}T${options.startTime}:00`,
			timeZone: "Asia/Kolkata",
		},
		end: {
			dateTime: `${options.date}T${options.endTime}:00`,
			timeZone: "Asia/Kolkata",
		},
		attendees: options.attendees,
	};

	let link = await calendar.events.insert({
		calendarId: "primary",
		conferenceDataVersion: "1",
		resource: event,
	});

	if (link && link.data && link.data.status && link.data.status == "confirmed") {
		return {
			link: link.data.hangoutLink,
			status: "success",
		};
	} else {
		return {
			link: "NA",
			status: "failed",
		};
	}
}
module.exports = router;
