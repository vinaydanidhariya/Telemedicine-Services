"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
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
  User.init(
    {
      userId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: "userId",
      },
      firstName: {
        type: DataTypes.TEXT,
        field: "firstName",
        allowNull: false,
      },
      lastName: {
        type: DataTypes.TEXT,
        field: "lastName",
        allowNull: false,
      },
      phone: {
        type: DataTypes.TEXT,
        field: "phone",
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
        allowNull: false,
      },
      gender: {
        type: DataTypes.TEXT,
        field: "gender",
        allowNull: false,
      },
      qualifications: {
        type: DataTypes.TEXT,
        field: "qualifications",
        allowNull: false,
      },
      specializations: {
        type: DataTypes.TEXT,
        field: "specializations",
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        field: "password",
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        field: "emailVerficationStatus",
        allowNull: true,
        defaultValue: true,
      },
      status: {
        type: DataTypes.TEXT,
        field: "status",
        allowNull: false,
      },
      createdDate: {
        type: DataTypes.DATE,
        field: "createdDate",
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedDate: {
        type: DataTypes.DATE,
        field: "updatedDate",
        allowNull: false,
      },
      type: {
        type: DataTypes.TEXT,
        field: "type",
        allowNull: true,
      },
      photo_url: {
        type: DataTypes.TEXT,
        field: "photoUrl",
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "User",
      tableName: "user",
      schema: Config.schema,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "user_pkey",
          unique: true,
          fields: [
            {
              name: "user_id",
            },
          ],
        },
      ],
    }
  );
  return User;
};
