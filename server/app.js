"use strict";

// Get dependencies
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Enviroment Variable Configuration
const dotenv = require("dotenv");
dotenv.config();

// Body Parser Configuration
app.use(express.json({ limit: "250mb" }));
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "build")));

// Get our API routes
const index_routes = require("./routes");
app.use('/api/registration', index_routes.reg_api);
app.use('/api/profile', index_routes.profile_api);
app.use('/api/booking', index_routes.booking_api);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

module.exports = app;
