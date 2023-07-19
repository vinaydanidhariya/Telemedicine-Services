const express = require("express");
const router = express.Router();
const db = require("../../models");
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

const uploadSourceLeadFile = multer({
  storage: storage, // global posting data upload file storage assign
  limits: {
    // Define limits for the file
    fileSize: 5 * 1024 * 1024, // 5 mb image only allowed
  },
  fileFilter: function (req, file, cb) {
    // Filter the file based on the type.
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("avatar");

router.get("/add-blog", authentication, function (req, res, next) {
  try {
    res.render("blogs/add-blog", {
      title: "BLOG",
      // layout: 'default'
      sessionUser: req.user,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/blog-list", authentication, async function (req, res, next) {
  try {
    res.render("blogs/list-blog", {
      title: "DOCTORS",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/add-blog", async function (req, res, next) {
  try {
    uploadSourceLeadFile(req, res, async function (err) {
      // Check err while upload
      if (err) {
        console.log("Error while uploading image");
        console.log(err);
        return res.send({
          type: "error",
          message: err.message,
        });
      } else {
        const { authorName, description, date, title } = req.body;
        console.log(req.body);
        try {
          db.Blogs.create({
            authorName,
            description,
            date,
            title,
            photo: req.file.filename,
            updatedDate: new Date(),
          })
            .then(() => {
              let message = `Added Doctor successfully`;
              res.send({
                status: 200,
                message,
                type: "success",
              });
            })
            .catch((error) => {
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

module.exports = router;
