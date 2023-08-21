'use strict';
const { sequelize, Model } = require('sequelize')
const Config = require("../config/config.json")[process.env.NODE_ENV];

module.exports = (sequelize, DataTypes) => {
    class PaymentTransaction extends Model {
        static associate(models) {
            // models.PaymentTransaction.hasMany(models.SubmissionResponse, { foreignKey: 'applicationSubmissionId', targetKey: 'applicationSubmissionId', sourceKey: 'applicationSubmissionId', as: 'applicationSubmission' });
        }
    }
    PaymentTransaction.init({
        transactionId: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'transaction_Id'
        },
        orderId: {
            type: DataTypes.TEXT,
            field: 'order_id',
            allowNull: false,
            unique: true
        },
        payerUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'payer_user_id'
        },
        PaymentTransactionId: {
            type: DataTypes.TEXT,
            field: 'Payment_transaction_id',
            allowNull: true,
        },
        payerName: {
            type: DataTypes.TEXT,
            field: 'payer_name',
            allowNull: true
        },
        payerEmail: {
            type: DataTypes.TEXT,
            field: 'payer_email',
            allowNull: true,
        },
        payerMobile: {
            type: DataTypes.TEXT,
            field: 'payer_mobile',
            allowNull: true,
        },
        paymentAmount: {
            type: DataTypes.TEXT,
            field: 'payment_amount',
            allowNull: true,
        },
        paymentStatus: {
            type: DataTypes.TEXT,
            field: 'payment_status',
            allowNull: true,
        },
        paymentDate: {
            type: DataTypes.DATE,
            field: 'payment_date',
            allowNull: true
        },
    }, {
        sequelize,
        timestamps: true,
        modelName: 'PaymentTransaction',
        tableName: 'payment_transaction',
        schema: Config.schema,
        freezeTableName: true,
        hasTrigger: true,
        indexes: [
            {
                name: 'payment_transaction_pkey',
                unique: true,
                fields: [
                    {
                        name: 'payment_transaction_id'
                    }
                ]
            }
        ]
    });
    return PaymentTransaction;
};