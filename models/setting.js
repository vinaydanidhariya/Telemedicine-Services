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
      mailServer: {
        type: DataTypes.TEXT,
        field: "mail_server",
        allowNull: false,
      },
      from: {
        type: DataTypes.TEXT,
        field: "from",
        allowNull: false,
      },
      username: {
        type: DataTypes.TEXT,
        field: "username",
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        field: "password",
        allowNull: true,
      },
      port: {
        type: DataTypes.INTEGER,
        field: "port",
        allowNull: true,
      },
      protocol: {
        type: DataTypes.TEXT,
        field: "protocol",
        allowNull: false,
      },
      GoogleAPIkeys: {
        type: DataTypes.TEXT,
        field: "google_Api_keys",
        allowNull: false,
      },
      OAuthclientID: {
        type: DataTypes.TEXT,
        field: "OAuth_client_id",
        allowNull: false,
      },
      razorpayAPIKeyID: {
        type: DataTypes.TEXT,
        field: "razorpay_api_Key_id",
        allowNull: false,
      },
      KeySecret: {
        type: DataTypes.TEXT,
        field: "key_Secret",
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
