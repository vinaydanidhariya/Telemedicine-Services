"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {}
  }
  Department.init(
    {
      departmentId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: "department_id",
      },
      departmentName: {
        type: DataTypes.TEXT,
        field: "department_name",
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        field: "description",
        allowNull: false,
      },
      status: {
        type: DataTypes.TEXT,
        field: "status",
        defaultValue: true,
        allowNull: false,
      },
      photo_url: {
        type: DataTypes.TEXT,
        field: "photo_url",
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "department",
      tableName: "department",
      schema: process.env.SCHEMA,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "department_pkey",
          unique: true,
          fields: [
            {
              name: "department_id",
            },
          ],
        },
      ],
    }
  );
  return Department;
};
