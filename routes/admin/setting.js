const express = require("express");
const { log } = require("handlebars");
const router = express.Router();
const authentication = require("../../middleware/login_module").check_auth;
const db = require("../../models/");

router.get("/", authentication, async function (req, res, next) {
  try {
    const setting = await db.Setting.findOne();
    let stringSetting = {};
    if (setting) {
      stringSetting = setting.toJSON()
    }
    res.render("settings/setting", {
      title: "ChildDR | Setting",
      data: stringSetting,
      // layout: 'default',
      sessionUser: req.user,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", authentication, async function (req, res, next) {
  try {
    console.log(req.body);
    const {
      mailServer,
      from,
      username,
      password,
      port,
      GoogleAPIkeys,
      OAuthclientID,
      razorpayAPIKeyID,
      KeySecret,
      protocol,
    } = req.body;
    const adminset = await db.Setting.update(
      {
        mailServer,
        from,
        username,
        password,
        port,
        GoogleAPIkeys,
        OAuthclientID,
        razorpayAPIKeyID,
        KeySecret,
        protocol,
        updatedDate: new Date(),
      },
      { where: { settingId: 2 } }
    );
    res.send({
      status: 200,
      message: "SUCCESS",
      type: "success",
    });
  } catch (error) {
    console.log(error);
  }
});
// router.post("/", async function (req, res, next) {
//   try {
//     const {
//       mail_Server,
//       lastName,
//       email,
//       qualifications,
//       gender,
//       price,
//       password,
//       photo_url,
//       phone,
//       department
//     } = req.body;

//     const passwordEncrypt = convertToMd5(password);
//     const customer = await db.User.create({
//       firstName,
//       lastName,
//       type: "DOCTOR",
//       email,
//       qualifications,
//       department,
//       gender,
//       price,
//       password: passwordEncrypt,
//       status: true,
//       photo_url,
//       phone,
//       createdDate: new Date(),
//       updatedDate: new Date(),
//     });

//     res.send("Add user");
//   } catch (error) {
//     console.log(error);
//   }
// });
module.exports = router;
