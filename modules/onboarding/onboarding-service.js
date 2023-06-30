/* eslint-disable no-async-promise-executor */
/* eslint-disable prefer-promise-reject-errors */
import {
  SUCCESS,
  FAILURE,
  SOMETHING_WENT_WRONG,
  EMAIL_EXIST,
  EMAIL_NOT_EXIST,
  USER_SIGN_SUCCESSFUL,
  INVALID_PASSWORD,
  UNAUTHORIZED_USER
} from '../../helpers/message';
import Constants from '../../helpers/constants';
import Logger from '../../helpers/logger';
import db from '../../models';
import { hash, compareHash, getJwtToken, verifyToken, deepClone, getCurentTime, getDomain } from '../../helpers/utils';
import { first } from 'underscore';

const { User, Company, CompanyUserRole } = db;

class OnboardingService {
  async getInstance (req, res, next) {
    try {
      return { message: SUCCESS, result: {} };
    } catch (error) {
      Logger.error({ message: SOMETHING_WENT_WRONG, error });
      throw Error({ message: SOMETHING_WENT_WRONG, error });
    }
  }

  async signup (req, res, next) {
    return new Promise(async (resolve, reject) => {
      let { firstName, lastName, businessName, businessType, email, password } = req.body;
      let roleSlug = Constants.SET_ADMIN_ROLE(businessType);
      businessName = businessName.toLowerCase();
      email = email.toLowerCase();
      const userExist = await db.User.count({
        where: { email }
      });

      if (userExist) {
        reject({ message: EMAIL_EXIST });
        return;
      }

      // taking domain name from here
      const domain = getDomain(email);
      const slug = domain.toUpperCase();

      // checking that same company exist
      let companyId = null;
      try {
        companyId = deepClone(await Company.findOne({
          attributes: ['companyId'],
          where: { name: businessName }
        }));
      } catch (error) {
        Logger.error({ message: SOMETHING_WENT_WRONG, error });
        reject({ message: SOMETHING_WENT_WRONG, error });
        return;
      }
      if (companyId) {
        companyId = companyId.companyId;
        roleSlug = Constants.SET_EMPLOYEE_ROLE(businessType);
      } else {
        try {
          const companyObj = {
            portalId: Constants.DEFAULT_PORTAL_ID,
            name: businessName,
            domain,
            businessType,
            slug,
            status: Constants.STATUS.ACTIVE,
            state: null,
            createdDate: getCurentTime(),
            updatedDate: getCurentTime()
          };

          roleSlug = `${businessType}_ADMIN`;
          companyId = await Company.create(companyObj);
          companyId = deepClone(companyId);
          companyId = companyId.companyId;
        } catch (error) {
          Logger.error({ message: SOMETHING_WENT_WRONG, error });
          reject({ message: SOMETHING_WENT_WRONG, error });
          return;
        }
      }

      const passwordEncrypt = await hash(password);
      User.create({
        firstName,
        lastName,
        email,
        password: passwordEncrypt,
        status: Constants.STATUS.ACTIVE, // non nullable column so setting it to default
        createdDate: getCurentTime(),
        updatedDate: getCurentTime()
      }).then((user) => {
        user = deepClone(user);
        const userId = user.userId;
        // mapping user and company here
        CompanyUserRole.create({
          userId,
          companyId,
          designation: null,
          roleSlug,
          status: Constants.STATUS.ACTIVE,
          createdDate: getCurentTime(),
          updatedDate: getCurentTime()
        }).then(() => {
          resolve({ message: USER_SIGN_SUCCESSFUL });
        }, error => {
          Logger.error({ message: SOMETHING_WENT_WRONG, error });
          reject({ message: SOMETHING_WENT_WRONG, error });
        });
      }, error => {
        Logger.error({ message: SOMETHING_WENT_WRONG, error });
        reject({ message: SOMETHING_WENT_WRONG, error });
      });
    });
  }

  async signin (req, res, next) {
    return new Promise(async (resolve, reject) => {
      let { email, password } = req.body;
      email = email.toLowerCase();
      User.findOne({
        attributes: ['userId', 'email', 'password', 'firstName', 'lastName'],
        where: { email: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('email')), email) },
        include: [{
          model: db.CompanyUserRole,
          as: 'userCompanyRole',
          attributes: ['userId', 'companyId', 'designation', 'roleSlug'],
          required: true,
          include: [{
            model: db.Company,
            as: 'roleCompany',
            attributes: ['businessType', 'name', 'companyId']
          }, {
            model: db.UserRole,
            as: 'userRole',
            attributes: ['name']
          }]
        }]
      }).then(async user => {
        user = deepClone(user);
        if (!user) {
          reject({
            message: EMAIL_NOT_EXIST
          });
          return;
        }

        // Matching password
        const isPasswordMatch = await compareHash(password, user.password);
        if (!isPasswordMatch) {
          reject({ message: INVALID_PASSWORD });
          return;
        }

        // Generate token
        delete user.password;
        let userObj = deepClone(user);

        userObj = this.loginUserDto({ ...userObj, portalId: 1 });
        const token = getJwtToken(userObj, Constants.ONE_MONTH);
        userObj = { ...userObj, token };
        // const refrestToken = getJwtToken(userEmailObj, Constants.ONE_DAY);

        resolve({
          message: SUCCESS,
          result: userObj
        });
      });
    });
  }

  async refreshToken (req, res, next) {
    return new Promise(async (resolve, reject) => {
      try {
        let refreshToken = req.headers.authorization;
        refreshToken = refreshToken.split(' ')[1];
        const accessToken = '';
        const decodedObj = verifyToken(refreshToken);
        if (!decodedObj) {
          reject({ message: UNAUTHORIZED_USER });
          return;
        }
        let { email } = decodedObj;
        email = email.toLowerCase();
        User.findOne({
          attributes: ['userId', 'email', 'firstName', 'lastName'],
          where: { email: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('email')), email) }
        }).then(async user => {
          user = deepClone(user);
          if (!user) {
            reject({
              message: EMAIL_NOT_EXIST
            });
          }

          // Generate token
          const userObj = deepClone(user);
          const token = getJwtToken(userObj, Constants.ONE_HOUR);
          resolve({ message: SUCCESS, result: { token } });
        });
        return;
      } catch (error) {
        Logger.error({ message: UNAUTHORIZED_USER, error });
        reject({ message: UNAUTHORIZED_USER, error });
      }
    });
  }

  loginUserDto (user) {
    user = deepClone(user);
    user.role = user.userCompanyRole && user.userCompanyRole.length
      ? {
          name: first(user.userCompanyRole).userRole ? first(user.userCompanyRole).userRole.name : null,
          slug: first(user.userCompanyRole).roleSlug
        }
      : null;

    user.company = user.userCompanyRole && user.userCompanyRole.length && user.userCompanyRole[0].roleCompany ? user.userCompanyRole[0].roleCompany : null;

    delete user.userCompanyRole;

    return user;
  }
}

export default new OnboardingService();
