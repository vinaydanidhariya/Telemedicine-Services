'use strict';
const { Sequelize, DataTypes, Model } = require('sequelize');
const Config = require('../config/config.json');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
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
  User.init({
    userId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'user_id'
    },
    firstName: {
      type: DataTypes.TEXT,
      field: 'firstName',
      allowNull: false
    },
    lastName: {
      type: DataTypes.TEXT,
      field: 'last_name',
      allowNull: false
    },
    slug: {
      type: DataTypes.TEXT,
      field: 'slug',
      allowNull: true
    },
    phone: {
      type: DataTypes.TEXT,
      field: 'phone',
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      field: 'email',
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      field: 'password',
      allowNull: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      field: 'email_verfication_status',
      allowNull: false,
      defaultValue: true
    },
    status: {
      type: DataTypes.TEXT,
      field: 'status',
      allowNull: false
    },
    randomPassword: {
      type: DataTypes.BOOLEAN,
      field: 'random_password',
      allowNull: true,
      defaultValue: true
    },
    editApplication: {
      type: DataTypes.BOOLEAN,
      field: 'edit_application',
      allowNull: false,
      defaultValue: true
    },
    createdDate: {
      type: DataTypes.DATE,
      field: 'created_date',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedDate: {
      type: DataTypes.DATE,
      field: 'updated_date',
      allowNull: false
    },
    type: {
      type: DataTypes.TEXT,
      field: 'type',
      // values: [Constants.USER_TYPES.USER, Constants.USER_TYPES.CUSTOMER],
      allowNull: true,
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'User',
    tableName: 'user',
    schema: Config.schema,
    freezeTableName: true,
    hasTrigger: true,
    indexes: [
      {
        name: 'user_pkey',
        unique: true,
        fields: [
          {
            name: 'user_id'
          }
        ]
      }
    ]
  });
  return User;
};
