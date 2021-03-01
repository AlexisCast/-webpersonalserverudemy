const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

const app = express();
const { API_VERSION } = require("./config");

//Load routings
const authRoutes = require("./routers/auth");
const userRoutes = require("./routers/user");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configure Header HTTP
//...

//Router Basic
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);

module.exports = app;
