("use strict");
var express = require("express");
var router = express.Router();
const db = require('../../models/');
const Sequelize = require('sequelize');
const axios = require("axios").default;
const { generateTimeSlots, timeSlots, validatePhoneNumber, sendListAppointmentMessage, sendMessage, getTextMessageInput, sendWelcomeMessage, sendListDoctorMessage, sendReplyButton, handleMessage, sendRegistrationMessage, sendGenderSelectionMessage, sendAppointmentDateReplyButton } = require("../../utils/messageHelper");

router.post("/", async (req, res) => {
    try {
        const { body } = req;
        console.log(JSON.stringify(body, null, 2));

        if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0] && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            const { metadata, messages } = body.entry[0].changes[0].value;
            const wa_id = body.entry[0].changes[0].value.contacts[0].wa_id
            const phone_number_id = metadata.phone_number_id;
            const from = messages[0].from;
            const message = messages[0];
            const messageType = message.type;

            const user = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });
            // console.log(user.userStat,"+++++++++++++++++++++++++++++++++++");

            if (!user) {
                const name = body['entry'][0]['changes'][0]['value']['contacts'][0].profile.name;
                const insertedUser = await db.WhatsappUser.create({
                    profileName: name,
                    wa_id: wa_id,
                    phone: from,
                    userStat: 'START'
                });
                sendWelcomeMessage(from);
                console.log(insertedUser);
            }

            if (messageType === "text") {
                const user = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });
                const textMessage = message.text.body
                console.log(user, "++++++++++++++++++++++++++++++++++++++++++++++++++++");
                if (message.text.body === "Removed") {

                    async function sendPostRequest() {
                        const user = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });
                        const url = 'https://40018dd7c14a-6958608321302419644.ngrok-free.app/whatsapp-payment/create-payment';
                        try {
                            const response = await axios(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: user
                            });
                            console.log(response.data);
                            sendRegistrationMessage(from, response.data);
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                    sendPostRequest();
                    const deleteResult = await db.WhatsappUser.destroy({
                        where: {
                            wa_id: wa_id,
                        },
                    });
                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  User Removed  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                    sendRegistrationMessage(from, "USER SESSION DESTROYED")
                }
                else if (user.userStat === 'PHONE_NUMBER') {
                    if (validatePhoneNumber(textMessage)) {
                        const updateResult = await db.WhatsappUser.update(
                            {
                                userStat: 'GENDER',
                                USerEnterNumber: textMessage,
                            },
                            {
                                where: {
                                    phone: from,
                                },
                            }
                        );
                        sendGenderSelectionMessage(from);
                    } else {
                        sendRegistrationMessage(from, "Please Enter valid Phone number ❌")
                    }
                }
                else if (user.userStat === 'SCHEDULING-APPOINTMENT') {
                    const updateResult = await db.WhatsappUser.update(
                        {
                            userStat: 'GENDER',
                        },
                        {
                            where: {
                                phone: from,
                            },
                        }
                    );
                    sendGenderSelectionMessage(from);
                }
                else if (!(user.userStat === "START")) {
                    const textMessage = message.text.body.toLowerCase();
                    const replyMessage = await handleMessage(textMessage, from);
                    console.log(replyMessage);
                    sendRegistrationMessage(from, replyMessage);
                }
            }
            else if (messageType === "interactive") {
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
                                phone: from,
                            },
                        }
                    );
                    sendRegistrationMessage(from, "What is Your Child Name/Patient Full-Name ?");
                }
                if (interactiveType === "button_reply" && user.userStat === "GENDER") {
                    await db.WhatsappUser.update(
                        { userStat: 'CATEGORY', gender: reply.id },
                        { where: { phone: from } }
                    );
                    const listOfDoctor = await db.User.findAll({
                        attributes: [
                            ['user_id', 'id'],
                            [
                                Sequelize.literal("CONCAT(first_name,' ', last_name)"),
                                'title'
                            ],
                            [
                                Sequelize.literal("CONCAT(qualifications, ' - ', specializations, ' - Price ', price)"),
                                'description'
                            ],
                        ],
                        raw: true,
                        tableName: "user"
                    });
                    console.log(listOfDoctor);
                    sendListDoctorMessage(from, listOfDoctor);
                }
                if (interactiveType === "list_reply" && user.userStat === "CATEGORY") {
                    await db.WhatsappUser.update(
                        { userStat: 'DOCTOR-CONFIRMATION', selectedDoctor: listReply.id, price: listReply.description.split('Price ')[1] },
                        { where: { phone: from } }
                    );
                    sendReplyButton(listReply, from);
                }
                if (interactiveType === "list_reply" && user.userStat === "SCHEDULING-APPOINTMENT") {
                    await db.WhatsappUser.update(
                        { userStat: 'TIME-CONFIRMATION', appointmentTime: listReply.title },
                        { where: { phone: from } }
                    );
                    sendReplyButton(listReply, from);
                }
                if (interactiveType === "button_reply" && user.userStat === "TIME-CONFIRMATION" && reply.id === "confirmDoctor") {
                    await db.WhatsappUser.update(
                        { userStat: 'PAYMENT-GATEWAY' },
                        { where: { phone: from } }
                    );
                    async function sendPostRequest() {
                        const user = await db.WhatsappUser.findOne({ where: { wa_id: wa_id } });
                        const url = 'https://40018dd7c14a-6958608321302419644.ngrok-free.app/whatsapp-payment/create-payment';
                        try {
                            const response = await axios(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: user
                            });
                            console.log(response.data);
                            sendRegistrationMessage(from, response.data);
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                    sendPostRequest();
                }
                else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMATION" && reply.id === "confirmDoctor") {
                    await db.WhatsappUser.update(
                        { userStat: 'DOCTOR-CONFIRMED' },
                        { where: { phone: from } }
                    );
                    sendAppointmentDateReplyButton(from)
                    sendRegistrationMessage(from,
                        `ON SPECIFIC DAY 📅 BOOK APPOINTMENT 
TYPE ➡️  *1* `);
                }
                else if (interactiveType === "button_reply" && user.userStat === "TIME-CONFIRMED" && reply.id === "confirmDoctor") {
                    await db.WhatsappUser.update(
                        { userStat: 'DOCTOR-CONFIRMED', },
                        { where: { phone: from } }
                    );
                    sendAppointmentDateReplyButton(from)
                    sendRegistrationMessage(from,
                        `ON SPECIFIC DAY 📅 BOOK APPOINTMENT 
TYPE ➡️  *1* `);
                }
                else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMATION" && reply.id === "cancelDoctor") {
                    const listOfDoctor = await db.User.findAll({
                        attributes: [
                            ['user_id', 'id'],
                            [
                                Sequelize.literal("CONCAT(first_name,' ', last_name)"),
                                'title'
                            ],
                            [
                                Sequelize.literal("CONCAT(qualifications, ' - ', specializations, ' - Price ', price)"),
                                'description'
                            ],
                        ],
                        raw: true,
                        tableName: "user"
                    });
                    console.log(listOfDoctor);
                    sendListDoctorMessage(from, listOfDoctor);
                }
                else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "todayButton") {
                    const today = new Date();
                    const date = today.toLocaleDateString('en-GB');
                    console.log(date);
                    await db.WhatsappUser.update(
                        { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                        { where: { phone: from } }
                    );
                    sendListAppointmentMessage(from, timeSlots)
                }
                else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "tomorrowButton") {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    const date = tomorrow.toLocaleDateString('en-GB');
                    await db.WhatsappUser.update(
                        { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                        { where: { phone: from } }
                    );
                    sendListAppointmentMessage(from, timeSlots)
                }
                else if (interactiveType === "button_reply" && user.userStat === "DOCTOR-CONFIRMED" && reply.id === "dayAfterTomorrowButton") {
                    const today = new Date();
                    const dayAfterTomorrowButton = new Date(today);
                    dayAfterTomorrowButton.setDate(today.getDate() + 2);
                    const date = dayAfterTomorrowButton.toLocaleDateString('en-GB');
                    await db.WhatsappUser.update(
                        { userStat: 'SCHEDULING-APPOINTMENT', appointmentDate: date },
                        { where: { phone: from } }
                    );
                    sendListAppointmentMessage(from, timeSlots)
                }
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
