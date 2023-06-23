// import path from 'path';
const { Sequelize, DataTypes, QueryInterface } = require('sequelize');

const Config = require('../config/config.json');

// const db = {};
let sequelize;

class db {
  constructor() {
    if (Object.keys(db) && Object.keys(db).length) {
      return db;
    }

    try {
      sequelize = new Sequelize(Config.database, Config.username, Config.password, Config);
    } catch (error) {
      console.log(error);
      throw 'Error while connecting database';
    }

    // importing all tables here
    db.User = require('./user.js')(sequelize, Sequelize.DataTypes);

    // Associates all tables here
    db.User.associate(db);

    // sequelize.sync({
    //   force: false
    //   // logging: console.log
    // }).then(() => {
    //   console.log('Database & tables created!');
    // }, error => {
    //   Logger.error('Error while syncing database');
    //   Logger.error(error);
    //   throw new Error('Error while syncing database');
    // });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    return db;
  }
}

module.exports = new db();
