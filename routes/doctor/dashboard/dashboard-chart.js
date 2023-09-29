
const express = require("express");
const router = express.Router();
const authentication = require("../../../middleware/login_module").check_auth;
const db = require("../../../models");
const { Op } = require('sequelize');


router.get("/appointment-stat", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		const today = new Date();
		const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

		// Query total appointment count
		const totalAppointmentCount = await db.Appointment.count({
			where: {
				doctorId: req.user.userId
			}
		});

		// Query last week's appointment count
		const lastWeekAppointmentCount = await db.Appointment.count({
			where: {
				doctorId: req.user.userId,
				createdAt: {
					[Op.gte]: lastWeek
				}
			}
		});

		const response = {
			lastWeekAppointmentCount,
			appointmentCount: totalAppointmentCount
		};

		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

router.get("/month-revenue", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		// Get the current year and month
		const currentYear = new Date().getUTCFullYear();
		const currentMonth = new Date().getUTCMonth() + 1; // Month is 0-based, so add 1

		// Calculate the start date of the current month in UTC
		const startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1)); // Start of the month in UTC

		// Calculate the end date of the current month in UTC
		const endDate = new Date(Date.UTC(currentYear, currentMonth, 0)); // End of the month in UTC

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
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

		const todayRevenue = await db.PaymentTransaction.sum('payment_amount', {
			where: {
				receiverUserId: req.user.userId,
				createdAt: {
					[Op.gte]: today
				}
			}
		});
		const todayRevenueResult = todayRevenue !== null ? todayRevenue : 0;

		// const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

		// const weekRevenue = await db.PaymentTransaction.findAll({
		// 	attributes: [
		// 		[db.sequelize.fn('TO_CHAR', db.sequelize.col('createdAt'), 'Day'), 'dayName'], // Extract day name
		// 		[db.sequelize.fn('COUNT', '*'), 'transactionCount'],
		// 		[db.sequelize.fn('SUM', db.sequelize.col('payment_amount')), 'totalPaymentAmount']
		// 	],
		// 	where: {
		// 		receiverUserId: req.user.userId,
		// 		createdAt: {
		// 			[Op.between]: [lastWeek, today] // Filter for the last seven days
		// 		}
		// 	},
		// 	group: [db.sequelize.fn('TO_CHAR', db.sequelize.col('createdAt'), 'Day')],
		// 	raw: true
		// });

		// console.log(weekRevenue);
		// let totalTransactionCount = 0;
		// let totalRevenue1 = 0;

		// // Loop through the weekRevenue array to calculate the total transaction count and revenue
		// weekRevenue.forEach((day) => {
		// 	totalTransactionCount += parseInt(day.transactionCount);
		// 	totalRevenue1 += parseFloat(day.totalPaymentAmount);
		// });

		// console.log("Total Transaction Count for Last Seven Days:", totalTransactionCount);
		// console.log("Total Revenue for Last Seven Days:", totalRevenue);
		// weekRevenue will contain an array of objects with 'dayName', 'totalPaymentAmount', and 'transactionCount' for each day of the week.


		const transactionCounts = results.map(result => parseInt(result.transaction_count));
		let response = {
			todayRevenue: "₹ " + todayRevenueResult,
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