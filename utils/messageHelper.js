let axios = require('axios');
const db = require('../models/');
const accessToken = process.env.ACCESS_TOKEN;
const appSecret = process.env.APP_SECRET;
const apiVersion = process.env.VERSION;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER;
const myNumberId = process.env.PHONE_NUMBER_ID;
const Config = require('../config/config.json')[process.env.NODE_ENV];
const Sequelize = require('sequelize');
const { Op } = require('sequelize');


function validatePhoneNumber(phoneNumber) {
    var phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
}
function validateName(name) {
    var nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
}

const getTextMessageInput = (recipient, text) => {
    return ({
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {
            "body": text
        }
    });
}

async function findAvailableTimeSlots(from, to, doctorId) {
    function generateTimeSlots(from, to) {
        const currentDate = new Date();
        if (
            from.getDate() === currentDate.getDate() &&
            from.getMonth() === currentDate.getMonth() &&
            from.getFullYear() === currentDate.getFullYear()
        ) {
            console.log("today");
            const scheduleStart = new Date();
            const currentHour = scheduleStart.getHours();
            const currentMinutes = scheduleStart.getMinutes();

            // Round up the current minutes to the nearest multiple of 15
            const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

            scheduleStart.setHours(currentHour, roundedMinutes, 0, 0); // Set schedule start time to 8 am

            const scheduleEnd = new Date(to);
            scheduleEnd.setHours(20, 0, 0, 0); // Set schedule end time to 8 pm

            const timeSlots = [];
            let currentTime = new Date(scheduleStart);

            while (currentTime <= scheduleEnd) {
                // Format the time in AM/PM format (e.g., "8:00 AM")
                const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                timeSlots.push(timeString);
                currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
            }
            return timeSlots;
        } else {
            console.log("not today");
            const scheduleStart = new Date(from);
            const currentHour = scheduleStart.getHours();
            const currentMinutes = scheduleStart.getMinutes();

            // Round up the current minutes to the nearest multiple of 15
            const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

            scheduleStart.setHours(currentHour, roundedMinutes, 0, 0); // Set schedule start time to 8 am

            const scheduleEnd = new Date(to);
            scheduleEnd.setHours(20, 0, 0, 0); // Set schedule end time to 8 pm

            const timeSlots = [];
            let currentTime = new Date(scheduleStart);

            while (currentTime <= scheduleEnd) {
                // Format the time in AM/PM format (e.g., "8:00 AM")
                const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                timeSlots.push(timeString);
                currentTime.setMinutes(currentTime.getMinutes() + 15); // Increment by 15 minutes
            }
            console.log(timeSlots);
            return timeSlots;
        }
    }

    // Function to exclude time slots falling between 1 pm and 3 pm
    function excludeTimeRange(timeSlots, startTime, endTime) {
        let date = startTime.toISOString().substring(0, 10)
        return timeSlots.filter(slot => {
            const slotTime = new Date(`${date} ${slot}`);
            return !(slotTime >= startTime && slotTime < endTime);
        });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    // Find available 15-minute time slots
    const allTimeSlots = generateTimeSlots(startDate, endDate);

    // Get events from the database for the specified date range
    const removeTime = await db.Schedule.findAll({
        where: {
            doctorId,
            // Apply filtering based on start_date and end_date
            start_date: {
                [Op.between]: [startDate, endDate],
            },
            end_date: {
                [Op.between]: [startDate, endDate],
            },
        },
        attributes: [['event_id', 'id'], ['title', 'text'], 'start_date', 'end_date'],
        raw: true,
    });

    let excludedTimeSlots = [...allTimeSlots]; // Make a copy of allTimeSlots
    for (const event of removeTime) {
        const eventStart = new Date(event.start_date);
        const eventEnd = new Date(event.end_date);
        excludedTimeSlots = await excludeTimeRange(excludedTimeSlots, eventStart, eventEnd);
    }
    console.log(excludedTimeSlots);
    return excludedTimeSlots;
}



let messageObject = (recipient) => {
    return ({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": `${recipient}`,
        "type": "interactive",
        "interactive": {},
    }
    )
};
function getPaymentTemplatedMessageInput(recipient, name, amount, orderId) {
    return {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": "transaction_payment_confirmation",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": name
                        },
                        // {
                        //     "type": "currency",
                        //     "currency": {
                        //         "fallback_value": "122.14",
                        //         "code": "INR",
                        //         "amount_1000": amount
                        //     }
                        // },
                        {
                            "type": "text",
                            "text": amount
                        },
                        {
                            "type": "text",
                            "text": orderId
                        }
                    ]
                }
            ]
        }
    }
}
function sendMessage(data) {
    var config = {
        method: 'post',
        url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    return axios(config)
}

const timeSlots = [
    {
        id: '1',
        title: 'START TIME: 1:00 PM',
        description: '15 Minute Duration'
    },
    {
        id: '2',
        title: 'START TIME: 1:15 PM',
        description: '15 Minute Duration'
    },
    {
        id: '3',
        title: 'START TIME: 1:30 PM',
        description: '15 Minute Duration'
    },
    {
        id: '4',
        title: 'START TIME: 1:45 PM',
        description: '15 Minute Duration'
    },
    {
        id: '5',
        title: 'START TIME: 2:00 PM',
        description: '15 Minute Duration'
    },
    {
        id: '6',
        title: 'START TIME: 2:15 PM',
        description: '15 Minute Duration'
    },
    {
        id: '7',
        title: 'START TIME: 2:30 PM',
        description: '15 Minute Duration'
    },
    {
        id: '8',
        title: 'START TIME: 2:45 PM',
        description: '15 Minute Duration'
    },
    {
        id: '9',
        title: 'START TIME: 3:00 PM',
        description: '15 Minute Duration'
    },
    {
        id: '10',
        title: 'START TIME: 3:15 PM',
        description: '15 minute duration slots'
    }
]

const genderMessage = {
    type: "button",
    header: {
        type: "text",
        text: "ChildDR 🏥",
    },
    body: {
        text: "Choose Your Gender",
    },
    footer: {
        text: "Please select an option.",
    },
    action: {
        buttons: [
            {
                type: "reply",
                reply: {
                    id: "male",
                    title: "Male",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "female",
                    title: "Female",
                },
            }
        ],
    },
};
const welcomeMessage = {
    type: "button",
    header: {
        type: "text",
        text: "Welcome to ChildDr! 🏥",
    },
    body: {
        text: "Do you want to consult our Pediatrician online?",
    },
    footer: {
        text: "We are here to provide the best care for your child",
    },
    action: {
        buttons: [
            {
                type: "reply",
                reply: {
                    id: "welcomeYes",
                    title: "Proceed",
                },
            },
        ],
    },
};

const sendWelcomeMessage = (recipient) => {
    try {
        let newMessageObject = messageObject(recipient)
        newMessageObject.interactive = welcomeMessage

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,

                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}
const sendGenderSelectionMessage = (recipient) => {
    try {
        let newMessageObject = messageObject(recipient)
        newMessageObject.interactive = genderMessage

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,

                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

// Function to handle different chatbot states
const handleMessage = async (message, recipientNumber) => {
    const user = await db.WhatsappUser.findOne({ where: { phone: recipientNumber } });
    console.log(user, "+++++++++++++++++++++++++++++++++++++++++++++++++++=");
    switch (user.userStat) {
        case 'PAYMENT_DONE':
            await db.WhatsappUser.update(
                { userStat: 'END', paymentDone: message },
                { where: { phone: recipientNumber } }
            );
            return "Kindly note that it's an online consultation. If your symptoms worsen or in an emergency, please visit a nearby doctor. Thank you!";

        case 'END':
            await db.WhatsappUser.update(
                { userStat: 'COMPLETE', paymentDone: message },
                { where: { phone: recipientNumber } }
            );
            return "Your Appointment Booked!!!!!!!";

        default:
            await db.WhatsappUser.update(
                { userStat: 'START' },
                { where: { phone: recipientNumber } }
            );
            // Handle additional userStats or conditions
            return 'Something went Wrong';
    }
};


const sendRegistrationMessage = async (recipient, message) => {
    try {
        let newMessageObject = getTextMessageInput(recipient, message)
        let response = await axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const buttonInteractiveObject = {
    type: "button",
    header: {
        type: "text",
        text: "Please Confirm Appointment Details ?",
    },
    body: {
        text: "",
    },
    footer: {
        text: "Please select an option.",
    },
    action: {
        buttons: [
            {
                type: "reply",
                reply: {
                    id: "confirmDoctor",
                    title: "Yes",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "cancelDoctor",
                    title: "No",
                },
            },
        ],
    },
};

const sendReplyButton = (reply, recipient) => {
    try {
        console.log(reply);
        buttonInteractiveObject.body.text =
            reply.title +
            " (" +
            reply.description +
            ")";
        let newMessageObject = messageObject(recipient)
        newMessageObject.interactive = buttonInteractiveObject

        console.log("button", newMessageObject);
        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

const appointmentDateButtonInteractiveObject = {
    type: "button",
    header: {
        type: "text",
        text: "ChildDR 🏥",
    },
    body: {
        text: `On Which Day You Want to Book Appointment`,
    },
    footer: {
        text: "Please select an option.",
    },
    action: {
        buttons: [
            {
                type: "reply",
                reply: {
                    id: "todayButton",
                    title: "Today",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "tomorrowButton",
                    title: "Tomorrow",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "onSpecificDayButton",
                    title: "ON SPECIFIC DAY 📅",
                },
            },
        ],
    },
};

const sendAppointmentDateReplyButton = (recipient) => {
    try {

        let newMessageObject = messageObject(recipient)
        newMessageObject.interactive = appointmentDateButtonInteractiveObject

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,

                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

const sendDoctorDepartmentList = (recipient, listOfDoctorDepartment) => {
    try {
        let newMessageObject = messageObject(recipient)
        console.log("before list", newMessageObject);

        let newDrListInteractiveObject = DoctorDepartmentListInteractiveObject(listOfDoctorDepartment)
        newMessageObject.interactive = newDrListInteractiveObject;

        console.log("list", JSON.stringify(newMessageObject, null, 2));

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}
const sendListDoctorMessage = (recipient, listOfDoctor) => {
    try {
        let newMessageObject = messageObject(recipient)
        console.log("before list", newMessageObject);

        let newDrListInteractiveObject = drListInteractiveObject(listOfDoctor)
        newMessageObject.interactive = newDrListInteractiveObject;

        console.log("list", JSON.stringify(newMessageObject, null, 2));

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

const sendTimeListAppointmentMessage = (recipient, listOfAppointment) => {
    try {
        let newMessageObject = messageObject(recipient)

        let newAppointmentListInteractiveObject = appointmentTimeListInteractiveObject(listOfAppointment)
        newMessageObject.interactive = newAppointmentListInteractiveObject;

        console.log("list", JSON.stringify(newMessageObject, null, 2));

        axios.post(
            `https://graph.facebook.com/${apiVersion}/${myNumberId}/messages`,
            newMessageObject,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

const DoctorDepartmentListInteractiveObject = (listOfDepartment) => {
    return ({
        type: "list",
        header: {
            type: "text",
            text: "Select the Department 🏥",
        },
        body: {
            text: "Please select the department or category with which you would like to consult.",
        },
        footer: {
            text: "ChildDr",
        },
        action: {
            button: "Choose Department",
            sections: [
                {
                    title: "Departments",
                    rows:
                        listOfDepartment
                    ,
                }
            ],
        },
    }
    );
}

const drListInteractiveObject = (listOfDoctor) => {
    return ({
        type: "list",
        header: {
            type: "text",
            text: "Please choose a doctor for your appointment. 🏥",
        },
        body: {
            text: "Here are the available doctors 👨‍⚕️",
        },
        footer: {
            text: "ChildDR",
        },
        action: {
            button: "Choose Doctor",
            sections: [
                {
                    title: "Doctors",
                    rows:
                        listOfDoctor
                    ,
                }
            ],
        },
    }
    );
}
const appointmentTimeListInteractiveObject = (listOfAppointment) => {
    return ({
        type: "list",
        header: {
            type: "text",
            text: "Appointment Time",
        },
        body: {
            text: "Please select the appointment time that suits you best. ⏰",
        },
        footer: {
            text: "ChildDR",
        },
        action: {
            button: "Select Time",
            sections: [
                {
                    title: "Doctors",
                    rows:
                        listOfAppointment
                }
            ]
        },
    }
    );
}
const findDrList = async (department) => {
    const listOfDoctor = await db.User.findAll(
        {
            where: { department },
            attributes: [
                ['user_id', 'id'],
                [
                    Sequelize.literal("CONCAT(first_name,' ', last_name)"),
                    'title'
                ],
                [
                    Sequelize.literal("CONCAT(qualifications, ' - ', department, ' - Price ', price)"),
                    'description'
                ],
            ],
            raw: true,
            limit: 10,
            tableName: "user"
        });
    return listOfDoctor
}

const findDoctorDepartmentList = async () => {
    const listOfDepartment = await db.Department.findAll({
        // order: [
        //   ['department_name', 'ASC'],
        // ],
        attributes: [
            ['department_id', 'id'],
            [
                'department_name',
                'title'
            ],
            [
                'description',
                'description'
            ],
        ],
        raw: true,
        limit: 10,
        tableName: "department"
    });
    return listOfDepartment
}

const GetPaymentUrl = async (wa_id) => {
    try {
        const user = await db.WhatsappUser.findOne({ where: { wa_id } });
        const url = Config.Razorpay.paymentCreateUrl;
        const response = await axios(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: user
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
}

const transactionMessage = async (name, amount, orderId) => {
    try {
        const response = `*Payment Confirmation ✅*
Hello *${name}*, we have successfully received your payment of Rs ₹ *${amount}*.
An email has been sent to your registered email address with the following details:
Payment ID: *${orderId}*
`
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}
module.exports = {
    findDrList,
    GetPaymentUrl,
    findAvailableTimeSlots,
    sendMessage,
    getTextMessageInput,
    findDoctorDepartmentList,
    sendListDoctorMessage,
    sendWelcomeMessage,
    sendDoctorDepartmentList,
    handleMessage,
    sendRegistrationMessage,
    sendReplyButton,
    sendGenderSelectionMessage,
    sendAppointmentDateReplyButton,
    sendTimeListAppointmentMessage,
    validateName,
    timeSlots,
    validatePhoneNumber,
    transactionMessage,
    getPaymentTemplatedMessageInput
};


