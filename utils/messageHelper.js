let axios = require("axios");
const db = require("../models/");
const accessToken = process.env.ACCESS_TOKEN;
const appSecret = process.env.APP_SECRET;
const apiVersion = process.env.VERSION;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER;
const myNumberId = process.env.PHONE_NUMBER_ID;
const Config = require("../config/config.json")[process.env.NODE_ENV];
const Sequelize = require("sequelize");
const moment = require("moment");
const { Op } = require("sequelize");

function validatePhoneNumber(phoneNumber) {
	var phoneRegex = /^\d{10}$/;
	return phoneRegex.test(phoneNumber);
}
function validateName(name) {
	var nameRegex = /^[A-Za-z\s]+$/;
	return nameRegex.test(name);
}

const getTextMessageInput = (recipient, text) => {
	return {
		messaging_product: "whatsapp",
		preview_url: false,
		recipient_type: "individual",
		to: recipient,
		type: "text",
		text: {
			body: text,
		},
	};
};

async function findAvailableTimeSlots(from, to, doctorId, user) {

	const events = await db.Schedule.findAll({
		where: {
			doctorId: parseInt(doctorId),
			// Apply filtering based on start_date and end_date in UTC
			start_date: {
				[Op.gte]: from,
			},
			end_date: {
				[Op.lte]: to,
			},
		},
		attributes: ["start_date", "end_date"],
		raw: true,
	});

	// Extract start and end times from events
	const eventTimeRanges = events.map((event) => {
		return {
			start: moment(event.start_date).utcOffset("+05:30").format(),
			end: moment(event.end_date).utcOffset("+05:30").format(),
		};
	});
	console.log("==================+>eventTimeRanges");
	console.log(eventTimeRanges);
	function generateTimeSlotsFromEventRanges(eventTimeRanges) {
		const timeSlots = [];
		const now = moment().utc(); // Get the current date and time in UTC

		for (const eventRange of eventTimeRanges) {
			let currentTime = moment(eventRange.start).utc(); // Convert eventRange.start to a Moment.js object in UTC

			// If the eventRange.start is in the past, set currentTime to now
			if (currentTime.isBefore(now)) {
				currentTime = now.clone(); // Use clone to avoid modifying the original moment object
			}

			// Round up the start time minutes to the nearest multiple of 15
			const startRoundedMinutes =
				Math.ceil(currentTime.minutes() / 15) * 15;
			currentTime.minutes(startRoundedMinutes);

			while (currentTime.isBefore(eventRange.end)) {
				// Format the time in AM/PM format (e.g., "8:00 AM") in UTC
				const timeString = currentTime
					.utcOffset("+05:30")
					.format("h:mm A");

				// Only add time slots that are greater than or equal to now
				if (currentTime.isSameOrAfter(now)) {
					timeSlots.push(timeString);
				}

				currentTime.add(15, "minutes"); // Increment by 15 minutes
			}
		}

		return timeSlots;
	}

	// Generate time slots from eventTimeRanges
	//date
	//time
	//did
	let initialDate = user.appointmentDate;
	let startDay = initialDate.setHours(0, 0, 0, 1);
	let endDay = initialDate.setHours(23, 59, 59, 99);
	console.log(startDay);
	console.log(endDay);
	const searchObject = {
		appointmentDate: {
			[Op.between]: [startDay, endDay],
		},
		selectedDoctor: user.selectedDoctor,
	};
	console.log(searchObject);
	const chosenSlots = await db.WhatsappUser.findAll({
		where: searchObject,
		raw: true,
	});
	let timeSlots = generateTimeSlotsFromEventRanges(eventTimeRanges);
	console.log(
		"--------------------------------------------------------------"
	);
	console.log(chosenSlots);
	if (chosenSlots && chosenSlots.length) {
		let slotsToBeRemoved = [];
		for (const slot of chosenSlots) {
			if (slot && slot.appointmentTime) {
				slotsToBeRemoved.push(slot.appointmentTime);
			}
		}
		timeSlots = timeSlots.filter(function (el) {
			return !slotsToBeRemoved.includes(el);
		});
	}
	console.log(timeSlots);
	const morningSlots = [];
	const afternoonSlots = [];
	const eveningSlots = [];
	const nightSlots = [];
	const midnight = [];
	timeSlots.forEach((slot) => {
		const time = moment(slot, "h:mm A"); // Parse the time slot using Moment.js
		if (time.isBetween(moment("6:00 AM", "h:mm A"), moment("11:59 AM", "h:mm A"))) {
			morningSlots.push(slot);
		} else if (time.isBetween(moment("12:00 PM", "h:mm A"), moment("4:59 PM", "h:mm A"))) {
			afternoonSlots.push(slot);
		} else if (time.isBetween(moment("5:00 PM", "h:mm A"), moment("7:59 PM", "h:mm A"))) {
			eveningSlots.push(slot);
		} else if (time.isBetween(moment("8:00 PM", "h:mm A"), moment("11:59 PM", "h:mm A"))) {
			nightSlots.push(slot);
		} else if (time.isBetween(moment("12:00 AM", "h:mm A"), moment("5:59 AM", "h:mm A"))) {
			midnight.push(slot);
		}
	});
	console.log("morningSlots", morningSlots);
	console.log("afternoonSlots", afternoonSlots);
	console.log("eveningSlots", eveningSlots);
	console.log("nightSlots", nightSlots);
	console.log("midnight", midnight);
	return {
		morningSlots: morningSlots,
		afternoonSlots: afternoonSlots,
		eveningSlots: eveningSlots,
		nightSlots: nightSlots,
		midnight: midnight,
		// totalLength: numberOf,
	};
}

async function SendSlotMessages(recipientNumber, res) {

	const user = await db.WhatsappUser.findOne({
		where: { phone: recipientNumber },
		attributes: ["selectedDoctor", "appointmentDate", "appointmentTime"],
		raw: true,
	});

	const user_selected_doctor = user.selectedDoctor;

	const doctor = await db.User.findOne({
		where: { userId: user_selected_doctor },
		attributes: [
			"onlineConsultationTimeFrom",
			"onlineConsultationTimeTo",
			"userId",
		],
		raw: true,
	});

	const userAppointmentDate = new Date(user.appointmentDate);
	const { onlineConsultationTimeFrom, onlineConsultationTimeTo, userId } =
		doctor;

	const [fromHours, fromMinutes] = onlineConsultationTimeFrom.split(":");
	const [toHours, toMinutes] = onlineConsultationTimeTo.split(":");

	// Convert onlineConsultationTimeFrom from IST to UTC
	let fromUtc = moment(userAppointmentDate).set({ hour: parseInt(fromHours), minute: parseInt(fromMinutes), second: '00', milliseconds: '000' });

	// Convert onlineConsultationTimeTo from IST to UTC
	let toUtc = moment(userAppointmentDate).set({ hour: parseInt(toHours), minute: parseInt(toMinutes), second: '00', milliseconds: '000' });

	fromUtc = fromUtc.subtract(5, 'hours').subtract(30, "minutes");
	toUtc = toUtc.subtract(5, 'hours').subtract(30, "minutes");

	const timeSlots = await findAvailableTimeSlots(fromUtc, toUtc, userId, user);
	// if (true) {
	// 	await sendDoctorDepartmentList2(recipientNumber, [
	// 		{
	// 			id: "morning",
	// 			title: "Morning",
	// 			description: "Morning of the day",
	// 		},
	// 		{
	// 			id: "afternoon",
	// 			title: "Afternoon",
	// 			description: "Afternoon of the day",
	// 		},
	// 		{
	// 			id: "evening",
	// 			title: "Evening",
	// 			description: "Evening of the day",
	// 		},
	// 		{
	// 			id: "night",
	// 			title: "Night",
	// 			description: "Night of the day",
	// 		},
	// 		{
	// 			id: "midnight",
	// 			title: "Midnight",
	// 			description: "Midnight of the day",
	// 		},
	// 	]);
	// 	await db.WhatsappUser.update(
	// 		{ userStat: "PARTOFDAY" },
	// 		{ where: { phone: recipientNumber } }
	// 	);
	// 	return;
	// }
	const timeSlotConvert = (slots, timePeriod) =>
		slots.map((time, index) => ({
			id: (index + 1).toString(),
			title: `${timePeriod}Time: ${time}`,
			description: "Duration: 15 minutes",
		}));
	if (
		!timeSlots.morningSlots.length &&
		!timeSlots.afternoonSlots.length &&
		!timeSlots.eveningSlots.length &&
		!timeSlots.nightSlots.length &&
		!timeSlots.midnight.length
	) {
		// Inform the user that the doctor is not available
		await sendRegistrationMessage(
			recipientNumber,
			"🙁 Sorry, but we couldn't find any available slots for this doctor on the selected date.\n\n" +
			"Please choose a different date or try again."
		);
		await db.WhatsappUser.update(
			{ userStat: "DATE-SELECTION" },
			{ where: { phone: recipientNumber } }
		);
		sendAppointmentDateReplyButton(recipientNumber);
		return;
	}
	const convertedMorningSlots = timeSlotConvert(
		timeSlots.morningSlots,
		"Morning"
	);
	const convertedAfternoonSlots = timeSlotConvert(
		timeSlots.afternoonSlots,
		"Afternoon"
	);
	const convertedEveningSlots = timeSlotConvert(
		timeSlots.eveningSlots,
		"Evening"
	);
	const convertedNightSlots = timeSlotConvert(timeSlots.nightSlots, "Night");
	const convertedMidNightSlots = timeSlotConvert(
		timeSlots.midnight,
		"MidNight"
	);
	console.log(
		"message",
		convertedMorningSlots,
		convertedAfternoonSlots,
		convertedEveningSlots,
		convertedNightSlots,
		convertedMidNightSlots
	);

	const sendTimeSlotsChunks = async (recipientNumber, slots, timePeriod) => {
		const chunkSize = 10;
		for (let i = 0; i < slots.length; i += chunkSize) {
			const chunk = slots.slice(i, i + chunkSize);
			await sendTimeListAppointmentMessage(
				recipientNumber,
				chunk,
				timePeriod
			);
		}
	};

	await sendTimeSlotsChunks(
		recipientNumber,
		convertedMorningSlots,
		"Morning"
	);
	await sendTimeSlotsChunks(
		recipientNumber,
		convertedAfternoonSlots,
		"Afternoon"
	);
	await sendTimeSlotsChunks(
		recipientNumber,
		convertedEveningSlots,
		"Evening"
	);
	await sendTimeSlotsChunks(recipientNumber, convertedNightSlots, "Night");
	await sendTimeSlotsChunks(
		recipientNumber,
		convertedMidNightSlots,
		"MidNight"
	);
}

async function SendSlotMessages2(recipientNumber, type) {
	const user = await db.WhatsappUser.findOne({
		where: { phone: recipientNumber },
		attributes: ["selectedDoctor", "appointmentDate", "appointmentTime"],
		raw: true,
	});
	console.log(user);
	const user_selected_doctor = user.selectedDoctor;
	const doctor = await db.User.findOne({
		where: { userId: user_selected_doctor },
		attributes: [
			"onlineConsultationTimeFrom",
			"onlineConsultationTimeTo",
			"userId",
		],
		raw: true,
	});

	const userAppointmentDate = new Date(user.appointmentDate);
	const { onlineConsultationTimeFrom, onlineConsultationTimeTo, userId } =
		doctor;

	const [fromHours, fromMinutes] = onlineConsultationTimeFrom.split(":");
	const [toHours, toMinutes] = onlineConsultationTimeTo.split(":");

	const from = new Date(userAppointmentDate);
	from.setHours(parseInt(fromHours), parseInt(fromMinutes));

	const to = new Date(userAppointmentDate);
	to.setHours(parseInt(toHours), parseInt(toMinutes));
	console.log("============================================================");
	console.log(from, to);
	console.log("============================================================");
	const timeSlots = await findAvailableTimeSlots(from, to, userId, user);
	const timeSlotConvert = (slots, timePeriod) =>
		slots.map((time, index) => ({
			id: (index + 1).toString(),
			title: `${timePeriod}Time: ${time}`,
			description: "Duration: 15 minutes",
		}));
	if (
		!timeSlots.morningSlots.length &&
		!timeSlots.afternoonSlots.length &&
		!timeSlots.eveningSlots.length &&
		!timeSlots.nightSlots.length &&
		!timeSlots.midnight.length
	) {
		// Inform the user that the doctor is not available
		await sendRegistrationMessage(
			recipientNumber,
			"🙁 Sorry, but we couldn't find any available slots for this doctor on the selected date.\n\n" +
			"Please choose a different date or try again."
		);
		await db.WhatsappUser.update(
			{ userStat: "DATE-SELECTION" },
			{ where: { phone: recipientNumber } }
		);
		sendAppointmentDateReplyButton(recipientNumber);
		return;
	}
	const convertedMorningSlots = timeSlotConvert(
		timeSlots.morningSlots,
		"Morning"
	);
	const convertedAfternoonSlots = timeSlotConvert(
		timeSlots.afternoonSlots,
		"Afternoon"
	);
	const convertedEveningSlots = timeSlotConvert(
		timeSlots.eveningSlots,
		"Evening"
	);
	const convertedNightSlots = timeSlotConvert(timeSlots.nightSlots, "Night");
	const convertedMidNightSlots = timeSlotConvert(
		timeSlots.midnight,
		"MidNight"
	);
	console.log(
		"message",
		convertedMorningSlots,
		convertedAfternoonSlots,
		convertedEveningSlots,
		convertedNightSlots,
		convertedMidNightSlots
	);

	const sendTimeSlotsChunks = async (recipientNumber, slots, timePeriod) => {
		const chunkSize = 10;
		for (let i = 0; i < slots.length; i += chunkSize) {
			const chunk = slots.slice(i, i + chunkSize);
			await sendTimeListAppointmentMessage(
				recipientNumber,
				chunk,
				timePeriod
			);
		}
	};
	if (type == "morning") {
		await sendTimeSlotsChunks(
			recipientNumber,
			convertedMorningSlots,
			"Morning"
		);
	} else if (type == "afternoon") {
		await sendTimeSlotsChunks(
			recipientNumber,
			convertedAfternoonSlots,
			"Afternoon"
		);
	} else if (type == "evening") {
		await sendTimeSlotsChunks(
			recipientNumber,
			convertedEveningSlots,
			"Evening"
		);
	} else if (type == "night") {
		await sendTimeSlotsChunks(
			recipientNumber,
			convertedNightSlots,
			"Night"
		);
	} else if (type == "midnight") {
		await sendTimeSlotsChunks(
			recipientNumber,
			convertedMidNightSlots,
			"MidNight"
		);
	}
}

let messageObject = (recipient) => {
	return {
		messaging_product: "whatsapp",
		recipient_type: "individual",
		to: `${recipient}`,
		type: "interactive",
		interactive: {},
	};
};

function getPaymentTemplatedMessageInput(recipient, name, amount, orderId) {
	return {
		messaging_product: "whatsapp",
		to: recipient,
		type: "template",
		template: {
			name: "transaction_payment_confirmation",
			language: {
				code: "en",
			},
			components: [
				{
					type: "body",
					parameters: [
						{
							type: "text",
							text: name,
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
							type: "text",
							text: amount,
						},
						{
							type: "text",
							text: orderId,
						},
					],
				},
			],
		},
	};
}

function sendMessage(data) {
	var config = {
		method: "post",
		url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
		headers: {
			Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
			"Content-Type": "application/json",
		},
		data: data,
	};
	return axios(config);
}

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
			},
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
		let newMessageObject = messageObject(recipient);
		newMessageObject.interactive = welcomeMessage;

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
};

const sendGenderSelectionMessage = (recipient) => {
	try {
		let newMessageObject = messageObject(recipient);
		newMessageObject.interactive = genderMessage;

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
};

// Function to handle different chatbot states
const handleMessage = async (message, recipientNumber) => {
	const user = await db.WhatsappUser.findOne({
		where: { phone: recipientNumber },
	});
	switch (user.userStat) {
		case "PAYMENT_DONE":
			await db.WhatsappUser.update(
				{ userStat: "END", paymentDone: message },
				{ where: { phone: recipientNumber } }
			);
			return "Kindly note that it's an online consultation. If your symptoms worsen or in an emergency, please visit a nearby doctor. Thank you!";

		case "END":
			await db.WhatsappUser.update(
				{ userStat: "COMPLETE", paymentDone: message },
				{ where: { phone: recipientNumber } }
			);
			return "Your Appointment Booked!!!!!!!";

		default:
			await db.WhatsappUser.update(
				{ userStat: "START" },
				{ where: { phone: recipientNumber } }
			);
			// Handle additional userStats or conditions
			return "Something went Wrong";
	}
};

const sendRegistrationMessage = async (recipient, message) => {
	try {
		let newMessageObject = getTextMessageInput(recipient, message);
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
};

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
		buttonInteractiveObject.body.text =
			reply.title + " (" + reply.description + ")";
		let newMessageObject = messageObject(recipient);
		newMessageObject.interactive = buttonInteractiveObject;

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
};

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
		let newMessageObject = messageObject(recipient);
		newMessageObject.interactive = appointmentDateButtonInteractiveObject;

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
};

const sendDoctorDepartmentList = (recipient, listOfDoctorDepartment) => {
	try {
		let newMessageObject = messageObject(recipient);

		let newDrListInteractiveObject = DoctorDepartmentListInteractiveObject(
			listOfDoctorDepartment
		);
		newMessageObject.interactive = newDrListInteractiveObject;
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
};

const sendDoctorDepartmentList2 = (recipient, listOfDoctorDepartment) => {
	try {
		let newMessageObject = messageObject(recipient);

		let newDrListInteractiveObject = DoctorDepartmentListInteractiveObject2(
			listOfDoctorDepartment
		);
		newMessageObject.interactive = newDrListInteractiveObject;
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
};

const sendListDoctorMessage = async (recipient, listOfDoctor) => {
	try {
		let newMessageObject = messageObject(recipient);

		let newDrListInteractiveObject = drListInteractiveObject(listOfDoctor);
		newMessageObject.interactive = newDrListInteractiveObject;

		await axios.post(
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
};

const sendTimeListAppointmentMessage = async (
	recipient,
	listOfAppointment,
	slotType
) => {
	try {
		const newMessageObject = messageObject(recipient, slotType);

		const newAppointmentListInteractiveObject =
			appointmentTimeListInteractiveObject(listOfAppointment, slotType);
		newMessageObject.interactive = newAppointmentListInteractiveObject;
		await axios.post(
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
};

const DoctorDepartmentListInteractiveObject2 = (listOfDepartment) => {
	return {
		type: "list",
		header: {
			type: "text",
			text: "Please choose part of day",
		},
		body: {
			text: "Please choose part of day",
		},
		footer: {
			text: "ChildDr",
		},
		action: {
			button: "Choose",
			sections: [
				{
					title: "timesOfDay",
					rows: listOfDepartment,
				},
			],
		},
	};
};

const DoctorDepartmentListInteractiveObject = (listOfDepartment) => {
	return {
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
					rows: listOfDepartment,
				},
			],
		},
	};
};

const drListInteractiveObject = (listOfDoctor) => {
	return {
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
					rows: listOfDoctor,
				},
			],
		},
	};
};

const appointmentTimeListInteractiveObject = (listOfAppointment, slotType) => {
	return {
		type: "list",
		header: {
			type: "text",
			text: `⏰ ${slotType} Time`,
		},
		body: {
			text: `Please select the ⏰ appointment ${slotType.toLowerCase()} time that suits you best.`,
		},
		footer: {
			text: "ChildDR",
		},
		action: {
			button: `${slotType} Time ⏰`,
			sections: [
				{
					title: "Doctors",
					rows: listOfAppointment,
				},
			],
		},
	};
};

const findDrList = async (department) => {
	const listOfDoctor = await db.User.findAll({
		where: { department },
		attributes: [
			["user_id", "id"],
			[Sequelize.literal("CONCAT(first_name,' ', last_name)"), "title"],
			[
				Sequelize.literal(
					"CONCAT(qualifications, ' - ', department, ' - Price ', price)"
				),
				"description",
			],
		],
		raw: true,
		tableName: "user",
	});
	return listOfDoctor;
};

const findDoctorDepartmentList = async () => {
	const listOfDepartment = await db.Department.findAll({
		// order: [
		//   ['department_name', 'ASC'],
		// ],
		attributes: [
			["department_id", "id"],
			["department_name", "title"],
			["description", "description"],
		],
		raw: true,
		limit: 10,
		tableName: "department",
	});
	return listOfDepartment;
};

const GetPaymentUrl = async (wa_id) => {
	try {
		const user = await db.WhatsappUser.findOne({ where: { wa_id } });
		let url = Config.serverUrl + "/whatsapp-payment/create-payment";
		const response = await axios(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			data: user,
		});
		return response.data;
	} catch (error) {
		console.error("Error:", error);
	}
};

const transactionMessage = async (name, amount, orderId) => {
	try {
		const response = `*Payment Confirmation ✅*
Hello *${name}*, we have successfully received your payment of Rs ₹ *${amount}*.
An email has been sent to your registered email address with the following details:
Payment ID: *${orderId}*
`;
		return response;
	} catch (error) {
		console.error("Error:", error);
	}
};

const tocBlock = {
	type: "button",
	header: {
		type: "text",
		text: "ChildDR 🏥",
	},
	body: {
		text: `As per govenment rules and policies we are bound to read and follow certain regulation and policies we insist you to read it first. link https://www.childdrofficial.com/terms-of-service.html`,
	},
	footer: {
		text: "Please read Term & Conditions above.",
	},
	action: {
		buttons: [
			{
				type: "reply",
				reply: {
					id: "AGREE",
					title: "AGREE",
				},
			},
			{
				type: "reply",
				reply: {
					id: "DISAGREE",
					title: "DISAGREE",
				},
			},
		],
	},
};

const sendTOCBlock = (recipient) => {
	try {
		let newMessageObject = messageObject(recipient);
		newMessageObject.interactive = tocBlock;

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
};

module.exports = {
	sendTOCBlock,
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
	SendSlotMessages,
	validatePhoneNumber,
	transactionMessage,
	getPaymentTemplatedMessageInput,
	sendDoctorDepartmentList2,
	SendSlotMessages2,
};
