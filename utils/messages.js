const onSpecificDayMessage = `ON SPECIFIC DAY 📅 BOOK APPOINTMENT TYPE ➡️  *1* `;
const appointmentMessage = (name, appointment_date, time, link, doctor) => {
	const res = `🙋 Hi *${name}* ! 
Thank you for scheduling an appointment with 
*KidsDoc 🏥* on *${appointment_date}*
at *${time}* ⌚️
Link is :${link}.
Doctor name is : ${doctor}
Please join before 5 Minutes`;
	return res;
};

module.exports = {
	appointmentMessage,
	onSpecificDayMessage,
};
