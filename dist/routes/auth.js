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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messages_1 = require("../helper/messages");
const authRouter = express_1.default.Router();
const { loginUser, UpdatePassword, findUserByEmail, registerUser, } = require("../helper/auth");
const { loginValidate, emailValidate, registerValidate, } = require("../helper/validations/authValidation");
const { LoginSuccess, LoginFail, PasswordUpdated, PasswordFailed, NotFound, RegisterSuccess, } = require("../helper/messages");
const { ApiFailedResponse } = require("../helper/global");
authRouter.post("/login", loginValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const login = yield loginUser(email, password);
    if (login) {
        return res.json({
            status: login.status,
            message: LoginSuccess,
            token: login.authToken,
            user: login.user,
        });
    }
    return res.status(401).json(ApiFailedResponse(LoginFail));
}));
authRouter.post("/register", registerValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const user = yield registerUser(req.body);
    if (user && user.status) {
        return res.json({
            status: true,
            message: RegisterSuccess,
            token: user.authToken,
            user,
        });
    }
    else if (user && !user.status) {
        return res.status(401).json({
            status: false,
            errors: [
                {
                    param: "global",
                    message: "Your Email/Phone [" +
                        (((_b = (_a = user === null || user === void 0 ? void 0 : user.error) === null || _a === void 0 ? void 0 : _a.keyValue) === null || _b === void 0 ? void 0 : _b.email) || ((_d = (_c = user === null || user === void 0 ? void 0 : user.error) === null || _c === void 0 ? void 0 : _c.keyValue) === null || _d === void 0 ? void 0 : _d.mobile)) +
                        "] is duplicate.",
                },
            ],
        });
    }
    return res.status(401).json(ApiFailedResponse(messages_1.FailedMsg));
}));
authRouter
    .post("/forgot/password", emailValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    const user = yield findUserByEmail(email);
    if (user) {
        //sent mail to user
    }
    res.status(401).json({ status: false, message: NotFound });
}))
    .post("/forgot/password/update", loginValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.query;
    const updatePass = yield UpdatePassword(email, password);
    if (updatePass) {
        res.json({
            status: true,
            message: PasswordUpdated,
        });
    }
    res.status(401).json({ status: false, message: PasswordFailed });
}));
module.exports = authRouter;
