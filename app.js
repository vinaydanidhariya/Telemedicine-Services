const createError = require("http-errors");
const express = require("express");
const logger = require('morgan');
const path = require("path");
const cors = require('cors');
require('dotenv').config();
const cookieParser = require("cookie-parser");
global.checkAccess = require("./middleware/authorization").checkAccess;
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin/user");
const usersRouter = require("./routes/users");
const doctorAccess = require("./routes/doctor");
const whatsappRouter = require("./routes/whatsapp-webhook/whatsapp-webhook");
const razorPayROuter = require("./routes/payment-webhook/payment-webhook");
const doctorRouter = require("./routes/admin/doctor.js")
const patientRouter = require("./routes/admin/patient.js")
const settingsRouter = require("./routes/admin/setting.js")
const paymentRouter = require("./routes/admin/payment.js")
const blogsRouter = require("./routes/admin/Blog.js")
const eventsRouter = require("./routes/admin/event")
const webSettingsRouter = require("./routes/admin/web-setting")
const departmentRouter = require("./routes/admin/department")
const dashboardRouter = require("./routes/admin/dashboard")
const uploadRouter = require("./routes/admin/upload")
const auth = require("./middleware/login_module");
const config = require('./config/config.js')

// const OnboardingRouter = require('./modules/onboarding/onboarding-route');

const app = express();
const debug = require("debug")("shreehariclinic:server");
const http = require("http");
const port = normalizePort(process.env.PORT || "3000");
let expressHandlebar = require('express-handlebars');
app.set("port", port);
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

const hbs = expressHandlebar.create(require('./utils/handlebarHelpers.js'));

app.engine('hbs', hbs.engine);
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'hbs');
const session = require("express-session");
const cookieSession = require("cookie-session");

app.use(cookieSession(config.cookie));

app.use(session(config.session));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(cors());
// Add headers before the routes are defined

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/whatsapp-payment", razorPayROuter);
auth.login(app);
// app.use('/onboarding', OnboardingRouter);
app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/admin/dashboard", dashboardRouter);
app.use("/users", usersRouter);
app.use("/wa-webhook", whatsappRouter);
app.use("/doctors", doctorRouter);
app.use("/patient", patientRouter);
app.use("/payment", paymentRouter);
app.use("/setting", settingsRouter);
app.use("/blogs", blogsRouter);
app.use("/events", eventsRouter);
app.use('/upload', uploadRouter);
app.use('/doctor', doctorAccess);
app.use('/web-setting', webSettingsRouter);
app.use('/department', departmentRouter);

app.use(function (req, res, next) {
	next(createError(404));
});
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.redirect("/error")
});
module.exports = app;

function normalizePort(val) {
	const port = parseInt(val, 10);
	if (isNaN(port)) return val;
	if (port >= 0) return port;
	return false;
}
function onError(error) {
	if (error.syscall !== "listen") throw error;
	const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
}
function onListening() {
	const addr = server.address();
	const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	debug("Listening on " + bind);
}