
const onSpecificDayMessage = `ON SPECIFIC DAY 📅 BOOK APPOINTMENT TYPE ➡️  *1* `
const appointmentMessage = (name, appointment_date, time) => {
    const res = (`🙋 Hi *${name}* ! 
Thank you for your appointment with
*ChildDr Clinic* at *${appointment_date}*
on *${time}*.
Please arrive at least 10 minutes before your appointment time.
Reply 👉
1 to confirm, 
2 to cancel,
3 to Reschedule. `)
    return res
}

module.exports = {
    appointmentMessage,
    onSpecificDayMessage
}