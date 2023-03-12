"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFailedResponse = exports.validationErrorHandler = exports.getRequestAuth = exports.decodeToken = exports.generateToken = exports.getDate = void 0;
const moment_1 = __importDefault(require("moment"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const getDate = (seprator = "/") => {
    // current timestamp in milliseconds
    let ts = Date.now();
    let date = new Date(ts);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    var ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    return (day +
        seprator +
        month +
        seprator +
        year +
        " " +
        hour +
        ":" +
        minutes +
        " " +
        ampm);
};
exports.getDate = getDate;
const generateToken = (userId, userName, userEmail) => {
    if ((userId === null || userId === void 0 ? void 0 : userId.length) <= 0 || (userEmail === null || userEmail === void 0 ? void 0 : userEmail.length) <= 0 || (userName === null || userName === void 0 ? void 0 : userName.length) <= 0) {
        return false;
    }
    let jwtSecretKey = process.env.SECRET_KEY;
    let data = {
        time: (0, moment_1.default)(),
        userId: userId,
        userName: userName,
        userEmail: userEmail,
    };
    const token = jwt.sign(data, jwtSecretKey);
    return token;
};
exports.generateToken = generateToken;
const decodeToken = (token) => {
    if (token.length <= 0) {
        return false;
    }
    let jwtSecretKey = process.env.SECRET_KEY;
    return jwt.verify(token, jwtSecretKey, (error, decoded) => {
        if (error) {
            // console.log("Decode Token Error: ", error);
            return false;
        }
        return decoded;
    });
};
exports.decodeToken = decodeToken;
const getRequestAuth = (req) => {
    const rawAuthStr = req.headers.authorization;
    const auth = rawAuthStr === null || rawAuthStr === void 0 ? void 0 : rawAuthStr.replace("Bearer ", "");
    return (0, exports.decodeToken)(auth);
};
exports.getRequestAuth = getRequestAuth;
const validationErrorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({
            errors: errors.array().map((err) => {
                return { param: err.param, message: err.msg };
            }),
        });
    next();
};
exports.validationErrorHandler = validationErrorHandler;
const ApiFailedResponse = (message, param = "global") => {
    return {
        status: false,
        errors: [
            {
                message,
                param,
            },
        ],
    };
};
exports.ApiFailedResponse = ApiFailedResponse;
