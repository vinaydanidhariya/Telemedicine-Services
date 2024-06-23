"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];
module.exports = (sequelize, DataTypes) => {
  class webSlider extends Model {
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
  webSlider.init(
    {
      webSliderId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        field: "web_slider_id",
      },
      sliderTitle: {
        type: DataTypes.TEXT,
        field: "slider_title",
        allowNull: false,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        field: "short_description",
        allowNull: false,
      },
      photo: {
        type: DataTypes.TEXT,
        field: "photo",
        allowNull: false,
      }
    },
    {
      sequelize,
      timestamps: false,
      modelName: "webSlider",
      tableName: "web_slider",
      schema: Config.schema,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "web_slider_pkey",
          unique: true,
          fields: [
            {
              name: "web_slider_id",
            },
          ],
        },
      ],
    }
  );
  return webSlider;
};
