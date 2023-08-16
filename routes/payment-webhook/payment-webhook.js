var express = require("express");
var router = express.Router();
let Razorpay = require("razorpay");
var crypto = require('crypto');
const moment = require('moment');
const Config = require('../../config/config.json')[process.env.NODE_ENV];
const db = require('../../models')
const { sendRegistrationMessage, getPaymentTemplatedMessageInput, sendMessage, transactionMessage } = require('../../utils/messageHelper');
const { appointmentMessage } = require('../../utils/messages');
const { Transaction } = require("sequelize");

router.post("/create-payment", async function (req, res, next) {
    try {
        let { userId, fullName, price, email, phone } = req.body

        var instance = new Razorpay({
            key_id: Config.Razorpay.key_id,
            key_secret: Config.Razorpay.key_secret,
        });
        let newPrice = Number(price) * 100
        const { id } = await instance.orders.create({
            amount: Math.floor(newPrice),
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                id: userId,
                name: fullName,
                email: email,
                mobile: phone
            },
        });
        console.log(id)
        res.send(`${Config.serverUrl}/payment?id=${id}`);
    } catch (error) {
        console.log(error);
    }

});

router.post("/payment-callback1", async function (req, res, next) {
    try {
        const requestedBody = JSON.stringify(req.body)
        const receivedSignature = req.headers['x-razorpay-signature']
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(requestedBody).digest('hex')
        if (receivedSignature === expectedSignature) {
            console.log(req.body);
            const event = req.body.event
            if (event === 'order.paid') {
                const status = req.body.payload.order.entity.status
                if (status === 'paid') {
                    const userinfo = req.body.payload.payment.notes
                    console.log(req.body.payload.payment, "Payment Response")

                    const data = req.body.payload.payment
                    const userId = data.entity.notes.id;
                    const name = data.entity.notes.name;
                    const email = data.entity.notes.email;
                    const mobile = data.entity.notes.mobile;
                    const orderId = data.entity.order_id;
                    const status = data.entity.status;
                    const amount = data.entity.amount;
                    const date = data.entity.created_at;
                    const PaymentTransactionId = data.entity.id;

                    await db.PaymentTransaction.create({
                        payerUserId: userId,
                        PaymentTransactionId,
                        paymentDate: new Date(),
                        payerName: name,
                        payerEmail: email,
                        payerMobile: mobile,
                        paymentAmount: amount / 100,
                        orderId,
                        paymentStatus: status
                    })

                    await db.WhatsappUser.update(
                        { useStat: "PAYMENT-DONE", paymentId: orderId },
                        { where: { phone: mobile } })

                    const message = await transactionMessage(name, amount / 100, orderId);
                    await sendRegistrationMessage(mobile, `${message}`);

                    const userInfo = await db.WhatsappUser.findOne(
                        {
                            where: { phone: mobile }
                        })
                    const prescription = await db.Prescription.create({
                        patientId: userInfo.userId,
                        doctorId: userInfo.selectedDoctor
                    });
                    const appointment = await db.Appointment.create({
                        patientId: userInfo.userId,
                        doctorId: userInfo.selectedDoctor,
                        prescriptionId: prescription.prescriptionId,
                        status: "RECEIVED",
                    });
                    await db.WhatsappUser.update(
                        {
                            userStat: "SEND-APPOINTMENT",
                        },
                        {
                            where: {
                                phone: mobile,
                            },
                        }
                    );
                    const formattedDate = moment(userInfo.appointmentDate).format('DD/MM/YYYY');
                    const data1 = appointmentMessage(userInfo.fullName, formattedDate, userInfo.appointmentTime)

                    await sendRegistrationMessage(mobile, data1);
                    // const messageData = getPaymentTemplatedMessageInput(mobile, name, amount, orderId)
                    // sendMessage(messageData);
                    res.status(200).send('RECEIVED')
                }
            }
            else if (event === "payment.captured") {
                console.log(req.body);
                res.status(200).send('received')
            }
        } else {
            res.status(501).send('received but unverified resp')
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/", async function (req, res, next) {
    const { id } = req.query
    if (id) {
        res.render("payment", { orderId: id });
    } else {
        res.render("payment-error");
    }
});

module.exports = router;
