const express = require("express");
const router = express.Router();
const db = require("../../models");
const { v4: uuidv4 } = require('uuid');
const Path = require('path');
const moment = require('moment');
const { convertToMd5 } = require("../../utils/helper.js");
const authentication = require("../../middleware/login_module").check_auth;

var multer = require("multer");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, "-"));
  },
});

//will be using this for uplading
const uploadSourceLeadFile = multer({
  storage: storage, // global posting data upload file storage assign
  limits: { // Define limits for the file
    fileSize: 5 * 1024 * 1024 // 5 mb image only allowed
  },
  fileFilter: function (req, file, cb) { // Filter the file based on the type.
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('avatar');

router.get("/add-doctor", authentication, async function (req, res, next) {
  try {
    res.render("doctors/add-doctor", {
      title: "DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-doctor", async function (req, res, next) {
  try {
    uploadSourceLeadFile(req, res, async function (err) {
      // Check err while upload
      if (err) {
        console.log('Error while uploading image');
        console.log(err);
        return res.send({
          type: 'error',
          message: err.message
        });
      } else {
        const {
          firstName,
          lastName,
          email,
          password,
          phone,
          dateOfBirth,
          price,
          qualification,
          department,
          gender
        } = req.body;

        try {
          const passwordEncrypt = convertToMd5(password);
          db.User.create({
            firstName,
            lastName,
            type: "DOCTOR",
            email,
            qualifications: qualification,
            department,
            gender,
            price,
            dateOfBirth,
            password: passwordEncrypt,
            status: true,
            photo_url: req.file.filename,
            phone,
            createdDate: new Date(),
            updatedDate: new Date(),
          })
            .then(createdUser => {
              console.log(createdUser.firstName);
              let message = `${createdUser.firstName + " " + createdUser.lastName} Added Doctor successfully`
              res.send({
                status: 200,
                message,
                type: "success",
              });
            })
            .catch(error => {
              console.log(error);
              res.send({
                status: 400,
                message: `Something Went Wrong while adding Doctor`,
                type: "fails",
              });
            });
        } catch (error) {
          console.log(error);
          res.send({
            status: 500,
            message: error.message,
            type: "error",
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit-doctor", authentication, async function (req, res, next) {
  try {
    const { edit } = req.query;
    if (edit) {
      const data = await db.User.findOne({
        where: { userId: edit }
      })
      const newData = data.toJSON()
      console.log(data.toJSON());
      const formattedDate = moment(data.dateOfBirth).format("DD/MM/YYYY");
      res.render("doctors/edit-doctor", {
        title: "DOCTORS",
        data: newData,
        formattedDate
      });
    }
    else {
      res.render("error");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/edit-doctor", async function (req, res, next) {
  try {

    uploadSourceLeadFile(req, res, async function (err) {
      // Check err while upload
      if (err) {
        console.log('Error while uploading image');
        console.log(err);
        return res.send({
          type: 'error',
          message: err.message
        });
      } else {
        const {
          firstName,
          lastName,
          doctorId,
          phone,
          dateOfBirth,
          price,
          qualification,
          department,
          gender
        } = req.body;

        try {
          if (req.file) {
            db.User.update({
              firstName,
              lastName,
              qualifications: qualification,
              department,
              gender,
              price,
              dateOfBirth: moment(dateOfBirth, "DD/MM/YYYY").toDate(),
              photoUrl: req.file.filename,
              phone,
              updatedDate: new Date(),
            },
              { where: { userId: doctorId } }
            )
              .then(createdUser => {
                let message = `${firstName + " " + lastName} \nUpdate Doctor successfully`
                res.send({
                  status: 200,
                  message,
                  type: "success",
                });
              })
              .catch(error => {
                console.log(error);
                res.send({
                  status: 400,
                  message: `Something Went Wrong while updating Doctor`,
                  type: "fails",
                });
              });
          } else {
            db.User.update({
              firstName,
              lastName,
              qualifications: qualification,
              department,
              gender,
              price,
              dateOfBirth: moment(dateOfBirth, "DD/MM/YYYY").toDate(),
              phone,
              updatedDate: new Date(),
            },
              { where: { userId: doctorId } }
            )
              .then(updatedUser => {
                let message = `${firstName + " " + lastName} \n Update Doctor successfully`
                res.send({
                  status: 200,
                  message,
                  type: "success",
                });
              })
              .catch(error => {
                console.log(error);
                res.send({
                  status: 400,
                  message: `Something Went Wrong while updating Doctor`,
                  type: "fails",
                });
              });
          }
        } catch (error) {
          console.log(error);
          res.send({
            status: 500,
            message: error.message,
            type: "error",
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/doctors-list", authentication, async function (req, res, next) {
  try {
    res.render("doctors/list-doctors", {
      title: "DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/doctor-department", authentication, async function (req, res, next) {
  try {
    const { code } = req.body;
    console.log(req.body);
    if (code === "778899") {
      const listOfDepartment = await db.Department.findAll({
        order: [
          ['department_name', 'ASC'],
        ],
        attributes: [
          ['department_id', 'id'],
          [
            'department_name',
            'title'
          ],
        ],
        raw: true,
        tableName: "department"
      });
      console.log(listOfDepartment);
      res.send(listOfDepartment);
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
