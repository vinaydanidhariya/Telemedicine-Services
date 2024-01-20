"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];
module.exports = (sequelize, DataTypes) => {
	class Setting extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */

		static associate(models) {
			// define association here
			// models.User.hasMany(models.CompanyUserRole, { foreignKey: 'userId', targetKey: 'userId', sourceKey: 'userId', as: 'userCompanyRole' });
		}
	}
	Setting.init(
		{
			settingId: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: true,
				primaryKey: true,
				field: "setting_id",
			},
			refreshToken: {
				type: DataTypes.TEXT,
				field: "refresh_token",
				allowNull: true,
			},
			reachNumber: {
				type: DataTypes.INTEGER,
				field: "reach_number",
				allowNull: true,
			},
		},
		{
			sequelize,
			timestamps: false,
			modelName: "Setting",
			tableName: "setting",
			schema: Config.schema,
			freezeTableName: true,
			hasTrigger: true,
			indexes: [
				{
					name: "setting_pkey",
					unique: true,
					fields: [
						{
							name: "setting_id",
						},
					],
				},
			],
		}
	);
	return Setting;
};
