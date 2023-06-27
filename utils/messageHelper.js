let axios = require('axios');
const db = require('../models/');
const accessToken = process.env.ACCESS_TOKEN;
const appSecret = process.env.APP_SECRET;
const apiVersion = process.env.VERSION;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER;
const myNumberId = process.env.PHONE_NUMBER_ID;

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
const generateTimeSlots = (endTime, timeSlotDuration) => {
    const slots = [];

    // Convert start and end times to Date objects for easier manipulation
    const startDate = new Date();
    const formattedDate = startDate.toISOString().split("T")[0];
    const endDate = new Date(`${formattedDate}T${endTime}`);

    let slotIndex = 0;
    // Loop through the time range and generate time slots
    let currentTime = startDate;
    while (currentTime < endDate) {
        const startTime = currentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
        // Calculate end time by adding the duration to the current time
        const endTime = new Date(currentTime.getTime() + timeSlotDuration * 60000)
            .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: false,
            });

        // Create the time slot object and push it to the slots array
        const timeSlot = {
            id: `${slotIndex}`,
            title: `StartTime: ${startTime}`,
            description: `${timeSlotDuration} MINUTE DURATION SLOTS`,
        };
        slots.push(timeSlot);

        // Increment the current time by the duration for the next slot
        currentTime = new Date(currentTime.getTime() + timeSlotDuration * 60000);
        slotIndex++;
    }

    return slots;
};



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

const sendMessage = (data) => {
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
        text: "SHC 🏥",
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
            },
            {
                type: "reply",
                reply: {
                    id: "other",
                    title: "Other",
                },
            },
        ],
    },
};
const welcomeMessage = {
    type: "button",
    header: {
        type: "text",
        text: "Welcome to ChildDr",
    },
    body: {
        text: "Do you want to consult our Pediatrician online?",
    },
    footer: {
        text: "Please select an option.",
    },
    action: {
        buttons: [
            {
                type: "reply",
                reply: {
                    id: "welcomeYes",
                    title: "Yes",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "welcomeNo",
                    title: "No",
                },
            },
            {
                type: "reply",
                reply: {
                    id: "welcomeIgnore",
                    title: "Ignore",
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
        case 'START':
            await db.WhatsappUser.update(
                { userStat: 'FULLNAME' },
                { where: { phone: recipientNumber } }
            );
            return "What's your full name?";

        case 'FULLNAME':
            if (validateName(message)) {
                await db.WhatsappUser.update(
                    { userStat: 'EMAIL', fullName: message },
                    { where: { phone: recipientNumber } }
                );
                return "What's your email?";
            } else {
                return "Enter Proper Patient Name ❌";
            }

        case 'EMAIL':
            var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (mailFormat.test(message)) {
                await db.WhatsappUser.update(
                    { userStat: 'AGE', email: message },
                    { where: { phone: recipientNumber } }
                );
                return "What is your age?";
            } else {
                return "Enter Proper Email Address ❌";
            }

        case 'AGE':
            if (!isNaN(message) && message > 0 && message <= 100) {
                await db.WhatsappUser.update(
                    { userStat: 'PHONE_NUMBER', age: message },
                    { where: { phone: recipientNumber } }
                );
                return "What's your phone number?";
            } else {
                return "Please Enter valid age ❌";
            }

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
        text: "SHC 🏥",
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
                    id: "dayAfterTomorrowButton",
                    title: "Day After Tomorrow",
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

const sendListAppointmentMessage = (recipient, listOfAppointment) => {
    try {
        let newMessageObject = messageObject(recipient)

        let newAppointmentListInteractiveObject = appointmentListInteractiveObject(listOfAppointment)
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

const drListInteractiveObject = (listOfDoctor) => {
    return ({
        type: "list",
        header: {
            type: "text",
            text: "Select the Doctor you would like for Appointment",
        },
        body: {
            text: "You will be presented with a list of options to choose from",
        },
        footer: {
            text: "All of them are Available for you treatment",
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
const appointmentListInteractiveObject = (listOfAppointment) => {
    return ({
        type: "list",
        header: {
            type: "text",
            text: "Select Appointment Time",
        },
        body: {
            text: "You will be presented with a list of options to choose from",
        },
        footer: {
            text: "Select time",
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

module.exports = {
    generateTimeSlots,
    sendMessage,
    getTextMessageInput,
    sendListDoctorMessage,
    sendWelcomeMessage,
    handleMessage,
    sendRegistrationMessage,
    sendReplyButton,
    sendGenderSelectionMessage,
    sendAppointmentDateReplyButton,
    sendListAppointmentMessage,
    validateName,
    timeSlots,
    validatePhoneNumber
};


