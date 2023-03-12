"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("../helper/global");
const moment_1 = __importDefault(require("moment"));
const authMiddelware = (req, res, next) => {
    const msg = "Authentication Failed, Please Login again.";
    try {
        const decodedToken = (0, global_1.getRequestAuth)(req);
        const { userId, userName, time } = decodedToken;
        const timeDiff = (0, moment_1.default)().diff((0, moment_1.default)(time), "days");
        if (!decodedToken || (!userId && !userName) || timeDiff > 7) {
            return res.status(401).json((0, global_1.ApiFailedResponse)(msg));
        }
        else {
            next();
        }
    }
    catch (error) {
        return res.status(401).json((0, global_1.ApiFailedResponse)(msg));
    }
};
module.exports = authMiddelware;
