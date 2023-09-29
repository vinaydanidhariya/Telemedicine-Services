
const express = require("express");
const router = express.Router();
const authentication = require("../../../middleware/login_module").check_auth;
const db = require("../../../models");
const { Op } = require('sequelize');


router.get("/appointment-stat", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {

		const results = await db.Appointment.findAll({
			attributes: [
				[db.sequelize.fn('COUNT', db.sequelize.col('*')), 'total_appointment'],
			],
			where: {
				doctorId: req.user.userId
			},
			raw: true
		});
		const appointmentCount = results.map(result => parseInt(result.total_appointment));


		const today = new Date();
		const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

		const lastWeekAppointmentCount = await db.Appointment.findAll({
			attributes: [
				[db.sequelize.fn('COUNT', db.sequelize.col('*')), 'total_appointment'],
			],
			where: {
				doctorId: req.user.userId,
				'createdAt': {
					[Op.gte]: lastWeek
				}
			},
			raw: true
		});
		let response = {};
		response.lastWeekAppointmentCount = lastWeekAppointmentCount[0].total_appointment;
		response.appointmentCount = results[0].total_appointment;
		console.log(response);

		res.json(response);
	} catch (error) {
		console.log(error)
	}
});

router.get("/month-revenue", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		// Get the current year and month
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1; // Month is 0-based, so add 1

		// Calculate the start date of the current month
		const startDate = new Date(currentYear, currentMonth - 1, 1); // Start of the month

		const endDate = new Date(currentYear, currentMonth, 0); // End of the month

		const results = await db.PaymentTransaction.findAll({
			attributes: [
				[db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date')), 'day'],
				[db.sequelize.fn('COUNT', db.sequelize.col('*')), 'transaction_count'],
				[db.sequelize.literal('CAST(SUM(payment_amount) AS INTEGER)'), 'total_paymentAmount'],
			],
			where: {
				payment_date: {
					[Op.and]: [
						{ [Op.gte]: startDate }, // Greater than or equal to the start of the month
						{ [Op.lte]: endDate },   // Less than or equal to the end of the month
					],
				},
				receiverUserId: req.user.userId
			},
			group: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			order: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			raw: true,
		});
		const totalRevenue = await db.PaymentTransaction.findAll({
			attributes: [
				[db.sequelize.literal('CAST(SUM(payment_amount) AS INTEGER)'), 'total_paymentAmount'],
			],
			where: {
				receiverUserId: req.user.userId
			},
			raw: true,
		});
		const transactionCounts = results.map(result => parseInt(result.transaction_count));
		let response = {
			transactionCounts: transactionCounts,
			monthTotalPaymentAmount: "₹ " + results[0].total_paymentAmount,
			currentMonth: currentMonth + "-" + currentYear,
			totalRevenue: "₹ " + totalRevenue[0].total_paymentAmount
		}

		console.log(response);
		res.json(response);
	} catch (error) {
		console.log(error)
	}
});

module.exports = router;