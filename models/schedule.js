"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Schedule extends Model {
		static associate(models) {
			// models.User.hasMany(models.CompanyUserRole, { foreignKey: 'userId', targetKey: 'userId', sourceKey: 'userId', as: 'userCompanyRole' });
		}
	}
	Schedule.init(
		{
			scheduleId: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: true,
				primaryKey: true,
				field: "schedule_id",
			},
			eventId: {
				type: DataTypes.BIGINT,
				field: "event_id",
			},
			doctorId: {
				type: DataTypes.INTEGER,
				field: "doctor_id",
				allowNull: false,
			},
			title: {
				type: DataTypes.TEXT,
				field: "title",
				allowNull: true,
			},
			startDate: {
				type: DataTypes.DATE,
				field: "start_date",
				allowNull: false,
			},
			endDate: {
				type: DataTypes.DATE,
				field: "end_date",
				allowNull: false,
			},
		},
		{
			sequelize,
			timestamps: true,
			modelName: "Schedule",
			tableName: "schedule",
			schema: process.env.SCHEMA,
			freezeTableName: true,
			hasTrigger: true,
			indexes: [
				{
					name: "Schedule_pkey",
					unique: true,
					fields: [
						{
							name: "schedule_id",
						},
					],
				},
			],
		}
	);
	return Schedule;
};
