"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];

module.exports = (sequelize, DataTypes) => {
    class Prescription extends Model {
        static associate(models) {
            Prescription.belongsTo(models.WhatsappUser, {
                foreignKey: 'patient_id',
                as: 'patient',
            });

            Prescription.belongsTo(models.User, {
                foreignKey: 'doctor_id',
                as: 'doctor',
            });

            Prescription.hasOne(models.Appointment, {
                foreignKey: 'prescriptionId', // The foreign key in the Appointments table that references Prescriptions
                as: 'appointment', // Alias for the association
            });
        }
    }
    Prescription.init(
        {
            prescriptionId: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: "prescription_id",
            },
            patientId: {
                type: DataTypes.INTEGER,
                field: "patient_id",
                allowNull: false,
            },
            doctorId: {
                type: DataTypes.INTEGER,
                field: "doctor_id",
                allowNull: false,
            },
            doctorRegistrationNumber: {
                type: DataTypes.TEXT,
                field: "doctor_registration_number",
                allowNull: true,
            },
            medicines: {
                type: DataTypes.ARRAY(DataTypes.JSONB), // Store JSON data in an array
                field: "medicines",
                allowNull: true,
                defaultValue: [], // Default value as an empty array
            },
            medicalInfo: {
                type: DataTypes.ARRAY(DataTypes.JSONB),
                field: "medical_info",
                allowNull: true,
                defaultValue: [],
            },
            prescriptionMsg: {
                type: DataTypes.TEXT,
                field: "prescription_msg",
                allowNull: true,
            },
            patientWeight: {
                type: DataTypes.TEXT,
                field: "patient_weight",
                allowNull: true,
            },
            patientHeight: {
                type: DataTypes.TEXT,
                field: "patient_height",
                allowNull: true,
            },
            note: {
                type: DataTypes.TEXT,
                field: "note",
                allowNull: true,
            }
        },
        {
            sequelize,
            timestamps: true,
            modelName: "Prescription",
            tableName: "prescription",
            schema: process.env.SCHEMA,
            freezeTableName: true,
            hasTrigger: true,
            indexes: [
                {
                    name: "prescription_pkey",
                    unique: true,
                    fields: [
                        {
                            name: "prescription_id",
                        },
                    ],
                },
            ],
        }
    );
    return Prescription;
};

