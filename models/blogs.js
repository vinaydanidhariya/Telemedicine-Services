"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");
const Config = require("../config/config.json")[process.env.NODE_ENV];
module.exports = (sequelize, DataTypes) => {
  class Blogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // models.User.hasMany(models.CompanyUserRole, { foreignKey: 'userId', targetKey: 'userId', sourceKey: 'userId', as: 'userCompanyRole' });
    }
  }
  Blogs.init(
    {
      blogId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        field: "blog_id",
      },
      authorName: {
        type: DataTypes.TEXT,
        field: "authorname",
        allowNull: false,
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
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        field: "description",
        allowNull: false,
      },

      active: {
        type: DataTypes.BOOLEAN,
        field: "active",
        allowNull: false,
        defaultValue: true,
      },
      delete: {
        type: DataTypes.TEXT,
        field: "delete",
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Blogs",
      tableName: "blogs",
      schema: Config.schema,
      freezeTableName: true,
      hasTrigger: true,
      indexes: [
        {
          name: "blogs_pkey",
          unique: true,
          fields: [
            {
              name: "blog_id",
            },
          ],
        },
      ],
    }
  );
  return Blogs;
};
