"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];
module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        }
    }
    Event.init(
        {
            eventId: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: true,
                primaryKey: true,
                field: "event_id",
            },
            title: {
                type: DataTypes.TEXT,
                field: "title",
                allowNull: true,
            },
            photo: {
                type: DataTypes.TEXT,
                field: "photo",
                allowNull: true,
            },
            date: {
                type: DataTypes.DATE,
                field: "date",
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                field: "description",
                allowNull: true,
            },
            sortDescription: {
                type: DataTypes.TEXT,
                field: "sort_description",
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                field: "active",
                allowNull: true,
                defaultValue: true,
            },
            delete: {
                type: DataTypes.TEXT,
                field: "delete",
                allowNull: true,
                defaultValue: false,
            },
        },
        {
            sequelize,
            timestamps: true,
            modelName: "Event",
            tableName: "event",
            schema: Config.schema,
            freezeTableName: true,
            hasTrigger: true,
            indexes: [
                {
                    name: "event_pkey",
                    unique: true,
                    fields: [
                        {
                            name: "event_id",
                        },
                    ],
                },
            ],
        }
    );
    return Event;
};
