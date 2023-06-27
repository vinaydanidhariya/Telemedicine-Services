var express = require("express");
var router = express.Router();
let Razorpay = require("razorpay");
/* GET users listing. */
router.post("/create-payment", async function (req, res, next) {

    const { userId, fullName, price, email, phone } = req.body
    console.log(req.body, "5555555555555555555555555555555555555555555555555555555555555555555555555555555555555")

    var instance = new Razorpay({
        key_id: "rzp_test_eIM2tN4jZB7id4",
        key_secret: "ZrWjvHIA2dvJmxNJ0jvMIgnT",
    });

    const { id } = await instance.orders.create({
        amount: price * 100,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
            id: `${userId}`,
            name: `${fullName}`,
            email: `${email}`,
            mobile: `${phone}`
        },
    });
    res.send(`https://40018dd7c14a-6958608321302419644.ngrok-free.app/payment/?id=${id}`);
});

router.post("/payment-callback", async function (req, res, next) {
    const requestedBody = JSON.stringify(req.body)
    const receivedSignature = req.headers['x-razorpay-signature']
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(requestedBody).digest('hex')
    if (receivedSignature === expectedSignature) {
        console.log("Hii for payment ***************************************************************************************");
    } else {
        res.status(501).send('received but unverified resp')
    }
});
/* GET users listing. */
router.get("/", async function (req, res, next) {
    const { id } = req.query
    if (id) {
        res.render("payment", { orderId: id });
    } else {
        res.render("payment-error");
    }
});

module.exports = router;
