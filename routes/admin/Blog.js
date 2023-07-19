const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;


router.get("/add-blog", authentication, function (req, res, next) {
  try {
      res.render("blogs/add-blog", {
          title: "BLOG",
          // layout: 'default'
          sessionUser: req.user
      });
  } catch (error) {
      console.log(error)
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
router.post("/", authentication, async function (
  req,
  res,
  next
) {
//   try {
//     const { code } = req.body;
//     console.log(req.body);
//     if (code === "778899") {
//       const listOfDepartment = await db.Department.findAll({
//         order: [["department_name", "ASC"]],
//         attributes: [
//           ["department_id", "id"],
//           ["department_name", "title"],
//         ],
//         raw: true,
//         tableName: "department",
//       });
//       console.log(listOfDepartment);
//       res.send(listOfDepartment);
//     } else {
//       res.send("error");
//     }
//   } catch (error) {
//     console.log(error);
//   }
});

module.exports = router;
