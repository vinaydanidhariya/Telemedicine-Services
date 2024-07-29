
const express = require("express");
const router = express.Router();
const authentication = require("../../../middleware/login_module").check_auth;
const moment = require('moment');
const db = require("../../../models");
const { Op } = require('sequelize');

router.get("/appointment-stat", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		const today = moment.utc(); // Get the current date in UTC using Moment.js
		const lastWeek = moment.utc().subtract(7, 'days'); // Get the date of the same day last week in UTC

		const dates = []; // Array to store dates
		const appointmentCounts = []; // Array to store appointment counts

		let currentDate = lastWeek.clone(); // Initialize currentDate with the start of last week

		// Loop through each day of last week
		while (currentDate.isBefore(today)) {
			const nextDate = currentDate.clone().add(1, 'day'); // Get the next day

			// Query appointment count for the current day
			const appointmentCount = await db.Appointment.count({
				where: {
					doctorId: req.user.userId,
					createdAt: {
						[Op.between]: [currentDate.toDate(), nextDate.toDate()] // Filter appointments for the current day
					}
				}
			});

			// Push date and appointment count to their respective arrays
			dates.push(currentDate.format('YYYY-MM-DD'));
			appointmentCounts.push(appointmentCount);

			currentDate = nextDate; // Move to the next day
		}

		// Calculate the total appointment count
		const totalAppointmentCount = appointmentCounts.reduce((total, count) => total + count, 0);

		const response = {
			dates,
			appointmentCounts,
			totalAppointmentCount
		};
		console.log(response);
		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

router.get("/month-revenue", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		// Get the current UTC date
		const currentUtcDate = moment.utc();

		// Calculate the start date of the current month in UTC using Moment.js
		const startDate = moment.utc().startOf('month');

		// Calculate the end date of the current month in UTC using Moment.js
		const endDate = moment.utc().endOf('month');

		const results = await db.PaymentTransaction.findAll({
			attributes: [
				[db.sequelize.fn("to_char", db.sequelize.col("payment_date"), "DD"), 'day'],
				[db.sequelize.literal('CAST(SUM(payment_amount) AS INTEGER)'), 'day_paymentAmount'],
			],
			where: {
				payment_date: {
					[Op.between]: [startDate, endDate], // Use Moment.js converted dates
				},
				receiverUserId: req.user.userId
			},
			group: [
				db.sequelize.fn('to_char', db.sequelize.col('payment_date'), 'DD'), // Group by day of the month
			],
			order: [
				db.sequelize.fn('to_char', db.sequelize.col('payment_date'), 'DD'), // Order by day of the month
			],
			raw: true,
		});

		console.log(results);

		const totalTransactionAmount = results.reduce((total, oneDay) => total + parseFloat(oneDay.day_paymentAmount), 0);

		let totalRevenue = await db.PaymentTransaction.sum('payment_amount', {
			where: {
				receiverUserId: req.user.userId
			},
		});
		if (totalRevenue==null) {
			totalRevenue = 0;
		}

		const today = moment.utc().startOf('day'); // Set the time to the beginning of the day

		const todayRevenue = await db.PaymentTransaction.sum('payment_amount', {
			where: {
				receiverUserId: req.user.userId,
				createdAt: {
					[Op.gte]: today.toDate(),
				},
			},
		});
		const todayRevenueResult = todayRevenue !== null ? todayRevenue : 0;

		const dayArrayForMonth = results.map(result => result.day);
		const transactionCounts = results.map(result => parseInt(result.day_paymentAmount));

		const response = {
			todayRevenue: `₹ ${todayRevenueResult}`,
			transactionCounts,
			monthTotalPaymentAmount: `₹ ${totalTransactionAmount}`,
			dayArrayForMonth,
			currentMonth: currentUtcDate.format('MM-YYYY'),
			totalRevenue: `₹ ${totalRevenue}`,
		};

		console.log(response);
		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

router.get("/annual-revenue", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		// Get the current UTC date
		const currentUtcDate = moment.utc();

		// Calculate the start date of the current year in UTC using Moment.js
		const startDate = moment.utc().startOf('year');

		// Calculate the end date of the current year in UTC using Moment.js
		const endDate = moment.utc().endOf('year');

		const results = await db.PaymentTransaction.findAll({
			attributes: [
				[db.sequelize.fn("to_char", db.sequelize.col("payment_date"), "MM/YYYY"), 'month_year'],
				[db.sequelize.fn('COUNT', db.sequelize.col('*')), 'transaction_count'],
				[db.sequelize.literal('CAST(SUM(payment_amount) AS INTEGER)'), 'month_paymentAmount'],
			],
			where: {
				payment_date: {
					[Op.between]: [startDate.toDate(), endDate.toDate()], // Use Moment.js converted dates
				},
				receiverUserId: req.user.userId
			},
			group: [
				db.sequelize.fn('to_char', db.sequelize.col('payment_date'), 'MM/YYYY'), // Group by month and year
			],
			order: [
				db.sequelize.fn('to_char', db.sequelize.col('payment_date'), 'MM/YYYY'), // Order by month and year
			],
			raw: true,
		});

		console.log(results);

		// Create an array of months in MM/YYYY format for the x-axis labels
		const monthYearLabels = moment.months().map((month, index) => `${index + 1}/${currentUtcDate.year()}`);

		// Initialize an array to hold transaction counts for each month
		const transactionCounts = new Array(12).fill(0);

		// Populate transaction counts from the results
		results.forEach((result) => {
			const [month, year] = result.month_year.split('/');
			const monthIndex = parseInt(month) - 1; // Adjust for 0-based index
			transactionCounts[monthIndex] = parseInt(result.transaction_count);
		});
		let totalRevenue= await db.PaymentTransaction.sum('payment_amount', {
			where: {
				receiverUserId: req.user.userId,
			}	
		})
		if(!totalRevenue){
			totalRevenue=0;
		}
		const response = {
			monthYearLabels,
			transactionCounts,
			yearTotalPaymentAmount: results.reduce((total, oneMonth) => total + parseFloat(oneMonth.month_paymentAmount), 0),
			currentYear: currentUtcDate.year(),
			totalRevenue
		};

		console.log(response);
		res.json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;