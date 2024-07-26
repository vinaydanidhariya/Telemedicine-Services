"use strict";
const { Sequelize, DataTypes, Model } = require("sequelize");

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
        field: "author_name",
        allowNull: true,
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
      deleteBlog: {
        type: DataTypes.BOOLEAN,
        field: "delete_blog",
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Blogs",
      tableName: "blogs",
      schema: process.env.SCHEMA,
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
