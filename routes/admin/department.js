const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/slider");
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
}).single("slider_photo");

router.get(
  "/add-department",
  authentication,
  checkAccess("department/add-department"),
  function (req, res, next) {
    try {
      res.render("department/add-department", {
        title: "DEPARTMENT",
        sessionUser: req.user,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  "/add-department",
  authentication,
  checkAccess("post/department/add-department"),
  async function (req, res, next) {
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
          const { department_name, description } = req.body;
          console.log(req.body);
          try {
            db.Department.create({
              departmentName: department_name,
              description: description,
            })
              .then(() => {
                let message = `Department Created successfully`;
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
                  message: `Something Went Wrong while creating Department`,
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
  }
);

router.get(
  "/department-list",
  authentication,
  checkAccess("department/department-list"),
  async (req, res) => {
    try {
      res.render("department/department-list", {
        title: "DEPARTMENT-LIST",
      });
    } catch (error) {
      console.error("Error retrieving department posts:", error);
      // Handle errors appropriately
      res.status(500).send("Error retrieving department posts"); // Return an error response to the client
    }
  }
);

router.post(
  "/department-list",
  authentication,
  checkAccess("department/department-list"),
  async (req, res) => {
    try {
      // Retrieve all event posts from the database using the event model
      const department = await db.Department.findAll({
        attributes: [
          "department_id",
          "department_name",
          "description",
          "status",
        ], // You can directly specify the attribute without an alias
        raw: true, // Get raw JSON data instead of Sequelize instances
      });
      console.log("department posts retrieved:", department);
      res.send(department);
    } catch (errosr) {
      console.error("Error retrieving department posts:", error);
      // Handle errors appropriately
      res.status(500).send("Error retrieving department posts"); // Return an error response to the client
    }
  }
);

router.post(
  "/delete-department",
  authentication,
  checkAccess("post/department/delete-department"),
  async function (req, res, next) {
    try {
      const { code, department_id } = req.body;
      console.log(req.body);
      if (code === "778899") {
        await db.Department.destroy({
          where: {
            departmentId: department_id,
          },
        });
        res.send({
          status: 200,
          message: "Department Deleted successfully",
          type: "success",
        });
      } else {
        res.send({
          status: 400,
          message: `unauthorized request`,
          type: "fails",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        status: 400,
        message: `Error While Deleting Department`,
        type: "fails",
      });
    }
  }
);

router.get(
  "/edit-department/:id",
  authentication,
  checkAccess("department/edit-department"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const department = await db.Department.findByPk(id);
      const departmentPost = department.toJSON();
      console.log(departmentPost);
      if (!departmentPost) {
        // department post not found, handle error or redirect to an error page
        res.status(404).send("department not found");
        return;
      }

      res.render("department/edit-department", {
        data:departmentPost
      });
    } catch (error) {
      console.error("Error retrieving department post:", error);
      // Handle errors appropriately
      res.status(500).send("Error retrieving department post");
    }
  }
);
router.post(
  "/edit-department",
  authentication,
  checkAccess("post/department/edit-department"),
  async function (req, res, next) {
    console.log(req.body);
    try {
      const { department_id,  department_name, description } = req.body;
      await db.Department.update(
        {
          departmentName:department_name,
          description,
          updatedDate: new Date(),
        },
        {
          where: {
            departmentId:department_id
          },
        }
      );
      res.send({
        status: 200,
        message: "SUCCESS",
        type: "success",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
