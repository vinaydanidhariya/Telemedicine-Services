// import path from 'path';
const { Sequelize, DataTypes, QueryInterface } = require('sequelize');
// const db = {};
let sequelize;
class db {
  constructor() {
    if (Object.keys(db) && Object.keys(db).length) {
      return db;
    }
    try {
      sequelize = new Sequelize(
        process.env.DATABASE, process.env.DATABASE_USERNAME, process.env.REPLICATION_READ_PASSWORD,
        {
          "database": process.env.DATABASE,
          "username": process.env.DATABASE_USERNAME,
          "schema": process.env.DATABASE_SCHEMA,
          "dialect": process.env.DATABASE_DIALECT,
          "logging": true,
          "dialectOptions": {
            "ssl": {
              "require": true,
              "rejectUnauthorized": false
            }
          },
          "port": 5432,
          "replication": {
            "read": [
              {
                "host": process.env.REPLICATION_READ_HOST,
                "username": process.env.DATABASE_USERNAME,
                "password": process.env.REPLICATION_READ_PASSWORD
              }
            ],
            "write": {
              "host": process.env.REPLICATION_WRITE_HOST,
              "username": process.env.DATABASE_USERNAME,
              "password": process.env.REPLICATION_WRITE_PASSWORD
            }
          },
          "pool": {
            "max": parseInt(process.env.POOL_MAX),
            "min": parseInt(process.env.POOL_MIN),
            "idle": parseInt(process.env.POOL_IDLE)
          }
        },
        {
          logging: console.log,
          logging: function (str) {
            console.log(str);
            // do your own logging
          }
        });
    } catch (error) {
      console.log(error);
      throw 'Error while connecting database';
    }

    // importing all tables here
    db.User = require('./user.js')(sequelize, Sequelize.DataTypes);
    db.WhatsappUser = require('./wa_user.js')(sequelize, Sequelize.DataTypes);
    db.PaymentTransaction = require('./payment_transaction')(sequelize, Sequelize.DataTypes);
    db.Department = require('./departments')(sequelize, Sequelize.DataTypes);
    db.Setting = require('./setting')(sequelize, Sequelize.DataTypes);
    db.Blogs = require('./blogs')(sequelize, Sequelize.DataTypes);
    db.Event = require('./event')(sequelize, Sequelize.DataTypes);
    db.Schedule = require('./schedule')(sequelize, Sequelize.DataTypes);
    db.Appointment = require('./appointment')(sequelize, Sequelize.DataTypes);
    db.webSlider = require('./web_slider')(sequelize, Sequelize.DataTypes);
    db.Prescription = require('./prescription')(sequelize, Sequelize.DataTypes);

    // Associates all tables here
    db.User.associate(db);
    db.WhatsappUser.associate(db);
    db.Department.associate(db);
    db.Setting.associate(db);
    db.Blogs.associate(db);
    db.Event.associate(db);
    db.Schedule.associate(db);
    db.Appointment.associate(db);
    db.webSlider.associate(db);
    db.Prescription.associate(db);

    if(sequelize.schema) {
      sequelize.sync({
      }).then(() => {
        console.log('Database & tables created!');
      }, error => {
        console.error('Error while syncing database');
        console.error(error);
        throw new Error('Error while syncing database');
      });

    }
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    return db;
  }
}

module.exports = new db();
