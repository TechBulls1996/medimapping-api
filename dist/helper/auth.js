"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = exports.UpdatePassword = exports.comparePassword = exports.generatePassword = exports.loginUser = exports.registerUser = void 0;
const { generateToken } = require("../helper/global");
const User = require("../db/models/User");
const bcrypt = require("bcrypt");
const registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password, phone, dob, gender, bloodGroup, country, state, city, address, pinCode, } = data;
    try {
        const passwordHash = yield (0, exports.generatePassword)(password);
        const user = yield User.create({
            name: fullName,
            email,
            password: passwordHash,
            mobile: phone,
            dob,
            gender,
            bloodGroup,
            country,
            state,
            city,
            address,
            pinCode,
        });
        if (user) {
            const jwtToken = yield generateToken(user.id, user === null || user === void 0 ? void 0 : user.name, user === null || user === void 0 ? void 0 : user.email);
            if (!jwtToken)
                return false;
            return {
                status: true,
                authToken: jwtToken,
                user: {
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    pinCode: user.pinCode,
                    roles: user.roles,
                },
            };
        }
    }
    catch (err) {
        console.log("Register Error:", err);
        return { status: false, error: err };
    }
    return false;
});
exports.registerUser = registerUser;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //find user and compare password
        const user = yield User.findOne({ email: email }).exec();
        const comparePass = yield (0, exports.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password);
        if (user && comparePass) {
            //gereate Token
            const jwtToken = yield generateToken(user.id, user === null || user === void 0 ? void 0 : user.name, user === null || user === void 0 ? void 0 : user.email);
            if (!jwtToken)
                return false;
            return {
                status: true,
                authToken: jwtToken,
                user: {
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    pinCode: user.pinCode,
                    roles: user.roles,
                },
            };
        }
        return false;
    }
    catch (error) {
        console.log("Login Error::::::", error);
        return false;
    }
});
exports.loginUser = loginUser;
const generatePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRounds = 10;
    const hash = yield bcrypt.hash(password, saltRounds).catch((err) => {
        console.log("Hash Generation Error: ", err);
        return false;
    });
    return hash;
});
exports.generatePassword = generatePassword;
const comparePassword = (password, passwordHash) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield bcrypt
        .compare(password, passwordHash)
        .catch((err) => {
        console.log("Hash Compare::::: ", err);
        return false;
    });
    return hash;
});
exports.comparePassword = comparePassword;
const UpdatePassword = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passHash = yield (0, exports.generatePassword)(password);
        const user = yield User.findOneAndUpdate({ email: email }, { password: passHash });
        if (user) {
            return true;
        }
    }
    catch (error) {
        console.log("Password Error:", error);
    }
    return false;
});
exports.UpdatePassword = UpdatePassword;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({ email: email }).exec();
        if (user) {
            return user;
        }
    }
    catch (err) {
        console.log("Error: ", err);
    }
    return false;
});
exports.findUserByEmail = findUserByEmail;
