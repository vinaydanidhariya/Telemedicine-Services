"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
  class WhatsappUser extends Model {
    static associate(models) {
      // One-to-Many: WhatsappUser has many Prescriptions (as a patient)
      WhatsappUser.hasMany(models.Prescription, {
        foreignKey: 'patientId',
        as: 'prescriptions', // Alias for the association
      });
      // One-to-Many: WhatsappUser has many Appointments
      WhatsappUser.hasMany(models.Appointment, {
        foreignKey: 'patientId', // The foreign key in the Appointments table that references Users
        as: 'appointments', // Alias for the association
      });
    }
  }
  WhatsappUser.init(
    {
      userId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        field: "user_id",
      },
      fullName: {
        type: DataTypes.TEXT,
        field: "full_name",
        allowNull: true,
      },
      profileName: {
        type: DataTypes.TEXT,
        field: "profile_name",
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
      userEnterNumber: {
        type: DataTypes.TEXT,
        field: "user_enter_number",
        allowNull: true,
      },
      userStat: {
        type: DataTypes.TEXT,
        field: "user_stat",
        allowNull: true,
      },
      appointmentDate: {
        type: DataTypes.DATE,
        field: "appointment_date",
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
      dateOfBirth: {
        type: DataTypes.DATE,
        field: "date_of_birth",
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
      department: {
        type: DataTypes.TEXT,
        field: "department",
        allowNull: true,
      },
      selectedDoctor: {
        type: DataTypes.TEXT,
        field: "selected_doctor",
        allowNull: true,
      },
      appointmentTime: {
        type: DataTypes.TEXT,
        field: "appointment_time",
        allowNull: true,
      },
      status: {
        type: DataTypes.TEXT,
        field: "status",
        allowNull: true,
      },
      paymentId: {
        type: DataTypes.TEXT,
        field: "payment_id",
        allowNull: true,
      },
      type: {
        type: DataTypes.TEXT,
        field: "type",
        allowNull: true,
      },
      photo_url: {
        type: DataTypes.TEXT,
        field: "photo_url",
        allowNull: true,
      },
      createdDate: {
        type: DataTypes.DATE,
        field: "created_date",
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedDate: {
        type: DataTypes.DATE,
        field: "updated_date",
        allowNull: true,
      },
      appointmentConfirmed: {
        type: DataTypes.BOOLEAN,
        field: "appointment_confirmed",
        allowNull: true,
      }
    },
    {
      sequelize,
      timestamps: false,
      modelName: "WhatsappUser",
      tableName: "wa-user",
      schema: process.env.SCHEMA,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "wa-user_pkey",
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
  return WhatsappUser;
};
