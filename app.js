const createError = require("http-errors");
const express = require("express");
var logger = require('morgan');
const path = require("path");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const whatsappRouter = require("./routes/whatsapp-webhook/whatsapp-webhook");
const razorPayROuter = require("./routes/payment-webhook/payment-webhook");
const paymentRouter = require("./routes/payment");
const app = express();
const debug = require("debug")("shreehariclinic:server");
const http = require("http");
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
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
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/wa-webhook", whatsappRouter);
app.use("/whatsapp-payment", razorPayROuter);
app.use("/payment", paymentRouter);

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});
module.exports = app;
