
const onSpecificDayMessage = `ON SPECIFIC DAY 📅 BOOK APPOINTMENT TYPE ➡️  *1* `
const appointmentMessage = (name, appointment_date, time) => {
	const res = (`🙋 Hi *${name}* ! 
Thank you for scheduling an appointment with 
*ChildDr Clinic 🏥* on *${appointment_date}*
at *${time}* ⌚️.
Please join before 5 Minutes`)
	return res
}

module.exports = {
	appointmentMessage,
	onSpecificDayMessage
}