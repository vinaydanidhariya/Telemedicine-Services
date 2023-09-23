("use strict");
var express = require("express");
var router = express.Router();
const moment = require("moment");
const db = require("../../models/");
const {
	GetPaymentUrl,
	findDrList,
	findDoctorDepartmentList,
	sendDoctorDepartmentList,
	SendSlotMessages,
	sendListDoctorMessage,
	sendRegistrationMessage,
	sendGenderSelectionMessage,
	sendAppointmentDateReplyButton,
	sendTOCBlock,
	sendDoctorDepartmentList2
} = require("../../utils/messageHelper");
const { appointmentMessage } = require("../../utils/messages");

router.post("/", async (req, res) => {
	try {
		const { body } = req;
		if (
			body.object &&
			body.entry &&
			body.entry[0].changes &&
			body.entry[0].changes[0] &&
			body.entry[0].changes[0].value.messages &&
			body.entry[0].changes[0].value.messages[0]
		) {
			const { metadata, messages } = body.entry[0].changes[0].value;
			const wa_id = body.entry[0].changes[0].value.contacts[0].wa_id;
			const phone_number_id = metadata.phone_number_id;
			const recipientNumber = messages[0].from;
			const message = messages[0];
			const messageType = message.type;
			const ExitsUser = await db.WhatsappUser.findOne({
				where: { wa_id: wa_id },
			});
			if (!ExitsUser) {
				const name =
					body["entry"][0]["changes"][0]["value"]["contacts"][0]
						.profile.name;
				await db.WhatsappUser.create({
					profileName: name,
					wa_id: wa_id,
					phone: recipientNumber,
					userStat: "TERM-CONDITIONS",
				});

				sendTOCBlock(recipientNumber);
				return res.sendStatus(200);
			}

			const user = await db.WhatsappUser.findOne({
				where: { wa_id: wa_id },
			});

			switch (messageType) {
				case "text":
					let textMessage = message.text.body;
					if (message.text.body === "Hello") {
						await db.WhatsappUser.update(
							{
								userStat: "TERM-CONDITIONS",
							},
							{
								where: {
									wa_id: wa_id,
								},
							}
						);
						sendTOCBlock(recipientNumber);
						return res.sendStatus(200);
					} else if (message.text.body === "Tester") {
						await sendDoctorDepartmentList2(recipientNumber, [
							{
								id: "morning",
								title: "Morning",
								description: "Morning of the day",
							},
							{
								id: "afternoon",
								title: "Afternoon",
								description: "Afternoon of the day",
							},
							{
								id: "evening",
								title: "Evening",
								description: "Evening of the day",
							},
							{
								id: "night",
								title: "Night",
								description: "Night of the day",
							},
							{
								id: "midnight",
								title: "Midnight",
								description: "Midnight of the day",
							},
						]);
						return res.sendStatus(200);
					} else {
						switch (user.userStat) {
							case "TERM-CONDITIONS-AGREE": {
								await db.WhatsappUser.update(
									{
										userStat: "DEPARTMENT-SELECTION",
									},
									{
										where: {
											wa_id: wa_id,
										},
									}
								);
								const listOfDepartment =
									await findDoctorDepartmentList();
								if (listOfDepartment.length > 0) {
									sendDoctorDepartmentList(
										recipientNumber,
										listOfDepartment
									);
								} else {
									sendRegistrationMessage(
										recipientNumber,
										"AT THIS TIME NO DEPARTMENT AVAILABLE"
									);
								}
								return res.sendStatus(200);
							}
							case "FULL-NAME": {
								const nameRegex = /^[A-Za-z\s]+$/;
								if (nameRegex.test(textMessage)) {
									await db.WhatsappUser.update(
										{
											userStat: "DATE-OF-BIRTH",
											fullName: textMessage,
										},
										{ where: { phone: recipientNumber } }
									);
									sendRegistrationMessage(
										recipientNumber,
										"Please enter the Birth-date of your Child/Patient. 📅 \nPlease enter it in the format DD/MM/YYYY (e.g., 01/01/2000)"
									);
									return res.sendStatus(200);
								} else {
									sendRegistrationMessage(
										recipientNumber,
										"Enter Proper Patient Name ❌"
									);
									return res.sendStatus(200);
								}
							}

							case "DATE-OF-BIRTH":
								var DOBFormat =
									/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d{2})$/;
								if (DOBFormat.test(textMessage)) {
									let dateOfBirth = moment(
										textMessage,
										"DD/MM/YYYY"
									).toDate();
									await db.WhatsappUser.update(
										{ userStat: "GENDER", dateOfBirth },
										{ where: { phone: recipientNumber } }
									);
									sendGenderSelectionMessage(recipientNumber);
									return res.sendStatus(200);
								} else {

									await sendRegistrationMessage(
										recipientNumber,
										"Enter Proper Date Of Birth ❌"
									);
									return res.sendStatus(200);
								}

							case "EMAIL":
								var mailFormat =
									/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
								if (mailFormat.test(textMessage)) {
									await db.WhatsappUser.update(
										{
											userStat: "PHONE-NUMBER",
											email: textMessage,
										},
										{ where: { phone: recipientNumber } }
									);
									sendRegistrationMessage(
										recipientNumber,
										"Please Enter your Phone Number ☎️?"
									);
									return res.sendStatus(200);
								} else {

									await sendRegistrationMessage(
										recipientNumber,
										"Enter Proper Email Address ❌"
									);
									return res.sendStatus(200);
								}

							case "PHONE-NUMBER":
								var NumberFormat =
									/^(\+\d{1,3}\s?)?(\()?\d{3}(\))?[-\s]?\d{3}[-\s]?\d{4}$/;
								if (NumberFormat.test(textMessage)) {
									await db.WhatsappUser.update(
										{
											userStat: "PAYMENT-GATEWAY",
											userEnterNumber: textMessage,
										},
										{ where: { phone: recipientNumber } }
									);
									const RespondUrl = await GetPaymentUrl(
										wa_id
									);
									sendRegistrationMessage(
										recipientNumber,
										`Please Payment at this link and confirm your appointment 💳🔗\n${RespondUrl} \nOnce the payment is completed, your appointment will be confirmed.`
									);
									return res.sendStatus(200);
								} else {

									await sendRegistrationMessage(
										recipientNumber,
										"Enter Proper Phone Number ❌"
									);
									return res.sendStatus(200);
								}

							case "ON-SPECIFIC-DAY":
								function validateDateWithinNext7Days(
									dateString
								) {
									const inputDate = moment(
										dateString,
										"DD/MM/YYYY"
									);
									const currentDate = moment();
									const next7Days = moment().add(7, "days");

									// Check if the input date is within the next 7 days
									return (
										inputDate.isSameOrAfter(
											currentDate,
											"day"
										) &&
										inputDate.isSameOrBefore(
											next7Days,
											"day"
										)
									);
								}

								if (validateDateWithinNext7Days(textMessage)) {
									const inputDate = moment(
										textMessage,
										"DD/MM/YYYY"
									);
									await db.WhatsappUser.update(
										{
											userStat: "TIME-SELECTION",
											appointmentDate: inputDate,
										},
										{ where: { phone: recipientNumber } }
									);
									await SendSlotMessages(
										recipientNumber,
										res,
										null
									);
									return res.sendStatus(200);
								} else {
									sendRegistrationMessage(
										recipientNumber,
										"The date is not within the next 7 days. ❌"
									);
									sendRegistrationMessage(
										recipientNumber,
										"TYPE DATE 📅 \nPlease enter it in the format DD/MM/YYYY (e.g., 01/01/2000) \nAppointment Available only for next 7 Day's Only"
									);
									return res.sendStatus(200);
								}

							case "PAYMENT-DONE":
								await db.WhatsappUser.update(
									{
										userStat: "SEND-APPOINTMENT",
									},
									{
										where: {
											phone: recipientNumber,
										},
									}
								);
								const userinfo = await db.WhatsappUser.findOne({
									where: { phone: recipientNumber },
								});
								const data = appointmentMessage(
									userinfo.fullName,
									userinfo.appointmentDate,
									userinfo.appointmentTime
								);
								await sendRegistrationMessage(
									recipientNumber,
									data
								);
								return res.sendStatus(200);
						}
						break;
					}
				case "interactive":
					const interactiveType = message.interactive.type;
					const reply = message.interactive.button_reply;
					const listReply = message.interactive.list_reply;

					// if (interactiveType === "button_reply" && user.userStat === "START" && reply.id === "welcomeYes") {
					//     const updateResult = await db.WhatsappUser.update(
					//         {
					//             userStat: 'DEPARTMENT-SELECTION',
					//         },
					//         {
					//             where: {
					//                 phone: recipientNumber,
					//             },
					//         }
					//     );
					//     const listOfDepartment = await findDoctorDepartmentList()
					//     if (listOfDepartment.length > 0) {
					//         sendDoctorDepartmentList(recipientNumber, listOfDepartment);
					//     } else {
					//         sendRegistrationMessage(recipientNumber, "AT THIS TIME NO DEPARTMENT AVAILABLE");
					//     }
					//     return res.sendStatus(200);
					// }

					if (interactiveType === "list_reply" && user.userStat === "DEPARTMENT-SELECTION") {
						await db.WhatsappUser.update({
							userStat: "DOCTOR-SELECTION",
							department: listReply.title,
						}, {
							where: { phone: recipientNumber }
						}
						);
						//find doctor categories wise user selected
						const listOfDoctor = await findDrList(listReply.title);

						if (listOfDoctor.length > 10) {
							const chunkSize = 10;
							for (let i = 0; i < listOfDoctor.length; i += chunkSize) {
								const chunk = listOfDoctor.slice(i, i + chunkSize);
								await sendListDoctorMessage(recipientNumber, chunk);
							}
						} else if (listOfDoctor.length > 0) {
							sendListDoctorMessage(recipientNumber, listOfDoctor);
						} else {
							await db.WhatsappUser.update(
								{ userStat: "DEPARTMENT-SELECTION" },
								{ where: { phone: recipientNumber } }
							);
							sendRegistrationMessage(recipientNumber, "AT THIS TIME NO DOCTOR AVAILABLE FOR THIS DEPARTMENT");
							const listOfDepartment = await findDoctorDepartmentList();

							if (listOfDepartment.length > 0) {
								sendDoctorDepartmentList(recipientNumber, listOfDepartment);
							} else {
								sendRegistrationMessage(recipientNumber, "AT THIS TIME NO DEPARTMENT AVAILABLE");
							}
						}

					}

					if (interactiveType === "list_reply" && user.userStat === "DOCTOR-SELECTION") {
						await db.WhatsappUser.update(
							{
								userStat: "DATE-SELECTION",
								selectedDoctor: listReply.id,
								price: listReply.description.split("Price ")[1],
							},
							{ where: { phone: recipientNumber } }
						);
						sendAppointmentDateReplyButton(recipientNumber);
					} else if (interactiveType === "button_reply" && user.userStat === "DATE-SELECTION" && reply.id === "todayButton") {
						const today = moment.utc();

						await db.WhatsappUser.update(
							{
								userStat: "DAY-PART-SELECTION",
								appointmentDate: today,
							},
							{ where: { phone: recipientNumber } }
						);
						await SendSlotMessages(recipientNumber, res, null);
					} else if (interactiveType === "button_reply" && user.userStat === "DATE-SELECTION" && reply.id === "tomorrowButton") {
						const today = moment.utc();
						const tomorrow = moment.utc(today).add(1, "day");
						await db.WhatsappUser.update(
							{
								userStat: "DAY-PART-SELECTION",
								appointmentDate: tomorrow,
							},
							{ where: { phone: recipientNumber } }
						);
						await SendSlotMessages(recipientNumber, res, null);
					} else if (interactiveType === "button_reply" && user.userStat === "DATE-SELECTION" && reply.id === "onSpecificDayButton") {
						await db.WhatsappUser.update(
							{ userStat: "ON-SPECIFIC-DAY" },
							{ where: { phone: recipientNumber } }
						);
						sendRegistrationMessage(recipientNumber, "TYPE DATE 📅 \n Formate (DD/MM/YYYY) \nAppointment Available only for next 7 Day's Only");
					} else if (interactiveType === "list_reply" && user.userStat === "DAY-PART-SELECTION") {
						console.log(listReply)
						if (listReply.id == 'morning' || listReply.id == 'afternoon' || listReply.id == 'evening' || listReply.id == 'night' || listReply.id == 'midnight') {
							await SendSlotMessages(recipientNumber, res, listReply.id);
							await db.WhatsappUser.update(
								{ userStat: "TIME-SELECTION" },
								{ where: { phone: recipientNumber } }
							);
						} else {
							console.log('some issue is there');
						}
					}

					if (interactiveType === "list_reply" && user.userStat === "TIME-SELECTION") {
						const time = listReply.title.split(": ")[1];
						await db.WhatsappUser.update(
							{ userStat: "FULL-NAME", appointmentTime: time },
							{ where: { phone: recipientNumber } }
						);
						// await db.Schedule.update(
						// 	{ userStat: "FULL-NAME", appointmentTime: time },
						// 	{ where: { phone: recipientNumber } }
						// );
						sendRegistrationMessage(recipientNumber, "What's your child's/patient's Full Name?");
					}

					if (interactiveType === "button_reply" && user.userStat === "GENDER") {
						await db.WhatsappUser.update(
							{ userStat: "EMAIL", gender: reply.id },
							{ where: { phone: recipientNumber } }
						);
						await sendRegistrationMessage(
							recipientNumber,
							"Please Enter Your Email Address 📧?"
						);
					}

					if (interactiveType === "button_reply" && user.userStat === "TERM-CONDITIONS") {
						if (reply.id === "AGREE") {
							// await db.WhatsappUser.update(
							//     { userStat: 'TERM-CONDITIONS-AGREE' },
							//     { where: { phone: recipientNumber } }
							// );
							await db.WhatsappUser.update(
								{ userStat: "DEPARTMENT-SELECTION" },
								{ where: { phone: recipientNumber } }
							);
							const listOfDepartment =
								await findDoctorDepartmentList();
							if (listOfDepartment.length > 0) {
								sendDoctorDepartmentList(
									recipientNumber,
									listOfDepartment
								);
							} else {
								sendRegistrationMessage(
									recipientNumber,
									"AT THIS TIME NO DEPARTMENT AVAILABLE"
								);
							}
							return res.sendStatus(200);
						} else {
							sendRegistrationMessage(
								recipientNumber,
								"Apologies to inconvinience but we cannot proceed futher until you agreed with terms & condition"
							);
						}
					}

					break;
			}
			res.sendStatus(200);
		} else {
			res.sendStatus(200);
		}
	} catch (error) {
		console.log("-------------");
		console.log(error);
		res.send(500);
	}
});

router.get("/", (req, res) => {
	try {
		const verify_token = process.env.APP_SECRET;

		// Parse params from the webhook verification request
		let mode = req.query["hub.mode"];
		let token = req.query["hub.verify_token"];
		let challenge = req.query["hub.challenge"];

		// Check if a token and mode were sent
		if (mode && token) {
			// Check the mode and token sent are correct
			if (mode === "subscribe" && token === verify_token) {
				// Respond with 200 OK and challenge token from the request
				res.status(200).send(challenge);
			} else {
				// Responds with '403 Forbidden' if verify tokens do not match
				res.send(403);
			}
		}
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
