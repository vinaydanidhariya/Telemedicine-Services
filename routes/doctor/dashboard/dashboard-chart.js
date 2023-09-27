
const express = require("express");
const router = express.Router();
const authentication = require("../../../middleware/login_module").check_auth;
const db = require("../../../models");
const { sequelize, DataTypes, Op } = require('sequelize');
const { response } = require("../../../app");


router.get("/total-revenue", authentication, checkAccess('chart/doctor'), async function (req, res, next) {
	try {
		const data = [110, 270, 145, 245, 205, 285]; // Replace with your data retrieval logic


		const currentMonth = db.sequelize.literal("DATE_TRUNC('month', CURRENT_DATE)");
		const currentYear = db.sequelize.literal("DATE_TRUNC('year', CURRENT_DATE)");

		const results = await db.PaymentTransaction.findAll({
			attributes: [
				[db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date')), 'day'],
				[db.sequelize.fn('COUNT', db.sequelize.col('*')), 'transaction_count'],
				[db.sequelize.literal('CAST(SUM(payment_amount) AS INTEGER)'), 'total_paymentAmount'],
			],
			where: {
				[Op.and]: [
					db.sequelize.where(db.sequelize.fn('DATE_TRUNC', 'month', db.sequelize.col('payment_date')), currentMonth),
					db.sequelize.where(db.sequelize.fn('DATE_TRUNC', 'year', db.sequelize.col('payment_date')), currentYear),
				],
			},
			group: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			order: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			raw: true
		});
		console.log(results);
		res.json(results);
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
			},
			group: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			order: [db.sequelize.fn('DATE_TRUNC', 'day', db.sequelize.col('payment_date'))],
			raw: true,
		});

		// Extract transaction counts into a separate variable
		const transactionCounts = results.map(result => parseInt(result.transaction_count));

		// Extract the total payment amount into a separate variable
		const totalPaymentAmount = results.length > 0 ? parseInt(results[0].total_paymentAmount) : 0;

		let response = {
			transactionCounts: transactionCounts,
			totalPaymentAmount: "₹ " + totalPaymentAmount,
			currentMonth: currentMonth + "-" + currentYear
		}

		console.log(response);
		res.json(response);
	} catch (error) {
		console.log(error)
	}
});

module.exports = router;