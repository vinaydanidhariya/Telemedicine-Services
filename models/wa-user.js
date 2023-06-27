"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json");

module.exports = (sequelize, DataTypes) => {
  class WhatsappUser extends Model {
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
  WhatsappUser.init(
    {
      userId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        field: "userId",
      },
      fullName: {
        type: DataTypes.TEXT,
        field: "fullName",
        allowNull: true,
      },
      profileName: {
        type: DataTypes.TEXT,
        field: "profileName",
        allowNull: true,
      },
      wa_id: {
        type: DataTypes.TEXT,
        field: "wa_id",
        allowNull: true,
      },
      phone: {
        type: DataTypes.TEXT,
        field: "phone",
        allowNull: true,
      },
      USerEnterNumber: {
        type: DataTypes.TEXT,
        field: "USerEnterNumber",
        allowNull: true,
      },
      userStat: {
        type: DataTypes.TEXT,
        field: "userStat",
        allowNull: true,
      },
      appointmentDate: {
        type: DataTypes.TEXT,
        field: "appointmentDate",
        allowNull: true,
      },
      price: {
        type: DataTypes.TEXT,
        field: "price",
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        field: "email",
        allowNull: true,
      },
      age: {
        type: DataTypes.TEXT,
        field: "age",
        allowNull: true,
      },
      category: {
        type: DataTypes.TEXT,
        field: "category",
        allowNull: true,
      },
      gender: {
        type: DataTypes.TEXT,
        field: "gender",
        allowNull: true,
      },
      selectedDoctor: {
        type: DataTypes.TEXT,
        field: "selectedDoctor",
        allowNull: true,
      },
      appointmentTime: {
        type: DataTypes.TEXT,
        field: "appointmentTime",
        allowNull: true,
      },
      status: {
        type: DataTypes.TEXT,
        field: "status",
        allowNull: true,
      },
      type: {
        type: DataTypes.TEXT,
        field: "type",
        allowNull: true,
      },
      photo_url: {
        type: DataTypes.TEXT,
        field: "photoUrl",
        allowNull: true,
      },
      createdDate: {
        type: DataTypes.DATE,
        field: "createdDate",
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedDate: {
        type: DataTypes.DATE,
        field: "updatedDate",
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "WhatsappUser",
      tableName: "wa-user",
      schema: Config.schema,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "wa-user_pkey",
          unique: true,
          fields: [
            {
              name: "userId",
            },
          ],
        },
      ],
    }
  );
  return WhatsappUser;
};
