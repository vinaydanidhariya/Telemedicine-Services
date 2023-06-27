var express = require("express");
var router = express.Router();

router.get("/", async function (req, res, next) {
    console.log(req.query.id, "+++++++++++++++++++++++++++++++++++++++++++++++");
    const { id } = req.query
    if (id) {
        res.render("payment", { orderId: id });
    } else {
        res.render("payment-error");
    }
});

module.exports = router;