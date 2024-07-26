"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Appointment extends Model {
        static associate(models) {
            // One-to-Many: User has many Appointments
            Appointment.belongsTo(models.WhatsappUser, {
                foreignKey: 'patientId', // The foreign key in the Appointments table that references Users
                as: 'patient', // Alias for the association
            });

            // One-to-Many: Doctor has many Appointments
            Appointment.belongsTo(models.User, {
                foreignKey: 'doctorId', // The foreign key in the Appointments table that references Doctors
                as: 'doctor', // Alias for the association
            });
            Appointment.belongsTo(models.Prescription, {
                foreignKey: 'prescriptionId', // The foreign key in the Appointments table that references Prescriptions
                as: 'prescription', // Alias for the association
            });
        }
    }
    Appointment.init(
        {
            AppointmentId: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: "appointment_id",
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
            prescriptionId: {
                type: DataTypes.INTEGER, 
                field: "prescription_id",
                allowNull: true,
            },
            status: {
                type: DataTypes.TEXT,
                field: "status",
                allowNull: false,
            }
        },
        {
            sequelize,
            timestamps: true,
            modelName: "Appointment",
            tableName: "appointment",
            schema: process.env.SCHEMA,
            freezeTableName: true,
            hasTrigger: true,
            indexes: [
                {
                    name: "appointment_pkey",
                    unique: true,
                    fields: [
                        {
                            name: "appointment_id",
                        },
                    ],
                },
            ],
        }
    );
    return Appointment;
};

