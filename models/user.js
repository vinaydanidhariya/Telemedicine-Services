"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // One-to-Many: User has many Appointments
      User.hasMany(models.Appointment, {
        foreignKey: "doctor_id", // The foreign key in the Appointments table that references Doctors
        as: "appointments", // Alias for the association
      });
    }
  }
  User.init(
    {
      userId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: "user_id",
      },
      firstName: {
        type: DataTypes.TEXT,
        field: "first_name",
        allowNull: false,
      },
      lastName: {
        type: DataTypes.TEXT,
        field: "last_name",
        allowNull: false,
      },
      phone: {
        type: DataTypes.TEXT,
        field: "phone",
        unique: true,
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
        unique: true,
        allowNull: false,
      },
      gender: {
        type: DataTypes.TEXT,
        field: "gender",
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        field: "date_of_birth",
        allowNull: false,
      },
      qualifications: {
        type: DataTypes.TEXT,
        field: "qualifications",
        allowNull: false,
      },
      department: {
        type: DataTypes.TEXT,
        field: "department",
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        field: "password",
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.TEXT,
        field: "reset_token",
        allowNull: true,
      },
      resetTokenExpiration: {
        type: DataTypes.DATE,
        field: "reset_token_expiration",
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        field: "email_verfication_status",
        allowNull: true,
        defaultValue: false,
      },
      delete: {
        type: DataTypes.BOOLEAN,
        field: "delete",
        allowNull: true,
        defaultValue: false,
      },
      status: {
        type: DataTypes.TEXT,
        field: "status",
        allowNull: false,
      },
      doctorRegistrationNumber: {
        type: DataTypes.TEXT,
        field: "doctor_registration_number",
        allowNull: false,
      },
      experience: {
        type: DataTypes.TEXT,
        field: "experience",
        allowNull: false,
      },
      physicalPractice: {
        type: DataTypes.TEXT,
        field: "physical_practice",
        allowNull: false,
      },
      university: {
        type: DataTypes.TEXT,
        field: "university",
        allowNull: false,
      },
      degreeText: {
        type: DataTypes.TEXT,
        field: "degree_text",
        allowNull: false,
      },
      graduationYear: {
        type: DataTypes.TEXT,
        field: "graduation_year",
        allowNull: false,
      },
      onlineConsultationTimeFrom: {
        type: DataTypes.TEXT,
        field: "online_consultation_time_from",
        allowNull: false,
      },
      onlineConsultationTimeTo: {
        type: DataTypes.TEXT,
        field: "online_consultation_time_to",
        allowNull: false,
      },
      clinicTimeFrom: {
        type: DataTypes.TEXT,
        field: "clinic_time_from",
        allowNull: false,
      },
      clinicTimeTo: {
        type: DataTypes.TEXT,
        field: "clinic_time_to",
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.TEXT,
        field: "photo_url",
        allowNull: true,
      },
      degreeUrl: {
        type: DataTypes.TEXT,
        field: "degree_url",
        allowNull: true,
      },
      aadharCardUrl: {
        type: DataTypes.TEXT,
        field: "aadhar_card_url",
        allowNull: true,
      },
      panCardUrl: {
        type: DataTypes.TEXT,
        field: "pan_card_url",
        allowNull: true,
      },
      digitalSignatureUrl: {
        type: DataTypes.TEXT,
        field: "digital_signature_url",
        allowNull: true,
      },
      type: {
        type: DataTypes.TEXT,
        field: "type",
        allowNull: true,
      },
      otpString: {
        type: DataTypes.TEXT,
        field: "otp_string",
        allowNull: true,
      },
      isOTP: {
        type: DataTypes.BOOLEAN,
        field: "is_otp",
        allowNull: true,
        defaultValue:false
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "User",
      tableName: "user",
      schema: process.env.SCHEMA,
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
