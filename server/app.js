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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Get our API routes
const index_routes = require("./routes");
app.use('/api/registration', index_routes.reg_api);

module.exports = app;
