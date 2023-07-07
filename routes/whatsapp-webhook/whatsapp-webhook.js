("use strict");
var express = require("express");
var router = express.Router();
const db = require('../../models/');
const { GetPaymentUrl, findDrList, timeSlots, validatePhoneNumber, transactionMessage, getPaymentTemplatedMessageInput, sendListAppointmentMessage, sendMessage, getTextMessageInput, sendWelcomeMessage, sendListDoctorMessage, sendReplyButton, handleMessage, sendRegistrationMessage, sendGenderSelectionMessage, sendAppointmentDateReplyButton } = require("../../utils/messageHelper");
const { onSpecificDayMessage, appointmentMessage } = require('../../utils/messages')

router.post("/", async (req, res) => {
    try {
        const { body } = req;
        console.log(JSON.stringify(body, null, 2));

        if (body.object
            && body.entry
            && body.entry[0].changes && body.entry[0].changes[0]
            && body.entry[0].changes[0].value.messages
            && body.entry[0].changes[0].value.messages[0]
        ) {
            const { metadata, messages } = body.entry[0].changes[0].value;
            const wa_id = body.entry[0].changes[0].value.contacts[0].wa_id
            const phone_number_id = metadata.phone_number_id;
            const recipientNumber = messages[0].from;
            const message = messages[0];
            const messageType = message.type;

            const ExitsUser = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });
            if (!ExitsUser) {
                const name = body['entry'][0]['changes'][0]['value']['contacts'][0].profile.name;
                await db.WhatsappUser.create({
                    profileName: name,
                    wa_id: wa_id,
                    phone: recipientNumber,
                    userStat: 'START'
                });
                sendWelcomeMessage(recipientNumber);
            }
            const user = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });

            switch (messageType) {
                case "text":
                    const textMessage = message.text.body
                    console.log(user, "++++++++++++++++++++++++++++++++++++++++++++++++++++");
                    if (message.text.body === "Removed") {
                        const deleteResult = await db.WhatsappUser.update(
                            {
                                userStat: "START"
                            }, {
                            where: {
                                wa_id: wa_id,
                            },
                        });
                        await sendRegistrationMessage(recipientNumber, "USER SESSION DESTROYED")
                        return sendWelcomeMessage(recipientNumber);
                    }
                    if (message.text.body === "Tester") {
                        const RespondUrl = await GetPaymentUrl(wa_id);
                        console.log(RespondUrl);
                        sendRegistrationMessage(recipientNumber,
                            `Plaese Payment at this link and confirm your appointment 
${RespondUrl}`);
                    }

                    switch (user.userStat) {
                        case 'FULLNAME':
                            var nameRegex = /^[A-Za-z\s]+$/;
                            if (nameRegex.test(textMessage)) {
                                await db.WhatsappUser.update(
                                    { userStat: 'EMAIL', fullName: textMessage },
                                    { where: { phone: recipientNumber } }
                                );
                                return sendRegistrationMessage(recipientNumber, "What's your email?");
                            } else {
                                return sendRegistrationMessage(recipientNumber, "Enter Proper Patient Name ❌");
                            }

                        case 'EMAIL':
                            var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                            if (mailFormat.test(textMessage)) {
                                await db.WhatsappUser.update(
                                    { userStat: 'AGE', email: textMessage },
                                    { where: { phone: recipientNumber } }
                                );
                                return sendRegistrationMessage(recipientNumber, "What is your age?");
                            } else {
                                return sendRegistrationMessage(recipientNumber, "Enter Proper Email Address ❌");
                            }

                        case 'AGE':
                            if (!isNaN(textMessage) && textMessage > 0 && textMessage <= 100) {
                                await db.WhatsappUser.update(
                                    { userStat: 'PHONE_NUMBER', age: textMessage },
                                    { where: { phone: recipientNumber } }
                                );
                                return sendRegistrationMessage(recipientNumber, "What's your phone number?");
                            } else {
                                return sendRegistrationMessage(recipientNumber, "Please Enter valid age ❌");
                            }

                        case "PHONE_NUMBER":
                            if (validatePhoneNumber(textMessage)) {
                                await db.WhatsappUser.update(
                                    {
                                        userStat: "GENDER",
                                        USerEnterNumber: textMessage,
                                    },
                                    {
                                        where: {
                                            phone: recipientNumber,
                                        },
                                    }
                                );
                                sendGenderSelectionMessage(recipientNumber);
                            } else {
                                sendRegistrationMessage(recipientNumber, "Please Enter valid Phone number ❌");
                            }
                            break;

                        case "SCHEDULING-APPOINTMENT":
                            await db.WhatsappUser.update(
                                {
                                    userStat: "GENDER",
                                },
                                {
                                    where: {
                                        phone: recipientNumber,
                                    },
                                }
                            );
                            sendGenderSelectionMessage(recipientNumber);
                            break;
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
                            const userinfo = await db.WhatsappUser.findOne(
                                {
                                    where: { phone: recipientNumber }
                                })
                            const data = appointmentMessage(userinfo.fullName, userinfo.appointmentDate, userinfo.appointmentTime)
                            await sendRegistrationMessage(recipientNumber, data);
                            break;
                        default:
                    }
                    break;
                case "interactive":
                    const interactiveType = message.interactive.type;
                    const reply = message.interactive.button_reply;
                    const listReply = message.interactive.list_reply;
                    if (interactiveType === "button_reply" && user.userStat === "START" && reply.id === "welcomeYes") {
                        const updateResult = await db.WhatsappUser.update(
                            {
                                userStat: 'FULLNAME',
                            },
                            {
                                where: {
                                    phone: recipientNumber,
                                },
                            }
                        );
                        sendRegistrationMessage(recipientNumber, "What is Your Child Name/Patient Full-Name ?");
                    }
                    if (interactiveType === "button_reply" && user.userStat === "GENDER") {
                        await db.WhatsappUser.update(
                            { userStat: 'CATEGORY', gender: reply.id },
                            { where: { phone: recipientNumber } }
                        );
                        const listOfDoctor = await findDrList()
                        console.log(listOfDoctor);
                        sendListDoctorMessage(recipientNumber, listOfDoctor);
                    }
                    if (interactiveType === "list_reply" && user.userStat === "CATEGORY") {
                        await db.WhatsappUser.update(
                            { userStat: 'DOCTOR-CONFIRMATION', selectedDoctor: listReply.id, price: listReply.description.split('Price ')[1] },
                            { where: { phone: recipientNumber } }
                        );
                        sendReplyButton(listReply, recipientNumber);
                    }
                    if (interactiveType === "list_reply" && user.userStat === "SCHEDULING-APPOINTMENT") {
                        await db.WhatsappUser.update(
                            { userStat: 'TIME-CONFIRMATION', appointmentTime: listReply.title },
                            { where: { phone: recipientNumber } }
                        );
                        sendReplyButton(listReply, recipientNumber);
                    }
                    if (interactiveType === "button_reply" && user.userStat === "TIME-CONFIRMATION" && reply.id === "confirmDoctor") {
                        await db.WhatsappUser.update(
                            { userStat: 'PAYMENT-GATEWAY' },
                            { where: { phone: recipientNumber } }
                        );
                        const RespondUrl = await GetPaymentUrl(wa_id);
                        console.log(RespondUrl);
                        sendRegistrationMessage(recipientNumber,
                            `Plaese Payment at this link and confirm your appointment 
${RespondUrl}`);
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMATION" && reply.id === "confirmDoctor") {
                        await db.WhatsappUser.update(
                            { userStat: 'DOCTOR-CONFIRMED' },
                            { where: { phone: recipientNumber } }
                        );
                        sendAppointmentDateReplyButton(recipientNumber)
                        sendRegistrationMessage(recipientNumber, onSpecificDayMessage);
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "TIME-CONFIRMED" && reply.id === "confirmDoctor") {
                        await db.WhatsappUser.update(
                            { userStat: 'DOCTOR-CONFIRMED', },
                            { where: { phone: recipientNumber } }
                        );
                        sendAppointmentDateReplyButton(recipientNumber)
                        sendRegistrationMessage(recipientNumber, onSpecificDayMessage);
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMATION" && reply.id === "cancelDoctor") {
                        const listOfDoctor = await findDrList()
                        sendListDoctorMessage(recipientNumber, listOfDoctor);
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "todayButton") {
                        const today = new Date();
                        const date = today.toLocaleDateString('en-GB');
                        console.log(date);
                        await db.WhatsappUser.update(
                            { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                            { where: { phone: recipientNumber } }
                        );
                        sendListAppointmentMessage(recipientNumber, timeSlots)
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "tomorrowButton") {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        const date = tomorrow.toLocaleDateString('en-GB');
                        await db.WhatsappUser.update(
                            { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                            { where: { phone: recipientNumber } }
                        );
                        sendListAppointmentMessage(recipientNumber, timeSlots)
                    }
                    else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "dayAfterTomorrowButton") {
                        const today = new Date();
                        const dayAfterTomorrowButton = new Date(today);
                        dayAfterTomorrowButton.setDate(today.getDate() + 2);
                        const date = dayAfterTomorrowButton.toLocaleDateString('en-GB');
                        await db.WhatsappUser.update(
                            { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                            { where: { phone: recipientNumber } }
                        );
                        sendListAppointmentMessage(recipientNumber, timeSlots)
                    }
                    break;
                default:
                    break;
            }
            res.sendStatus(200);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
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
                console.log("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
