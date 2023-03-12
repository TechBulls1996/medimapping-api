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
const global_1 = require("../helper/global");
const requestValidation_1 = require("../helper/validations/requestValidation");
const Request = require("../db/models/Request");
const requestRouter = express_1.default.Router();
const { requestValidate } = require("../helper/validations/requestValidation");
const mongodb_1 = require("mongodb");
requestRouter.post("/", requestValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = (0, global_1.getRequestAuth)(req);
    const request = yield Request.create(Object.assign({ userId: new mongodb_1.ObjectId(authData.userId), patientEmail: req.body.email, patientName: req.body.name }, req.body));
    if (request) {
        return res.json({
            status: true,
            message: messages_1.SuccessMsg,
            request,
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
requestRouter.get("/", requestValidation_1.requestGetValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    if (page === 0)
        page = 1;
    let skip = page * pageSize - pageSize;
    const request = yield Request.aggregate([
        { $addFields: { userObjId: { $toObjectId: "$userId" } } },
        {
            $lookup: {
                from: "users",
                localField: "userObjId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $skip: skip },
        { $limit: pageSize },
        {
            $project: {
                _id: 1,
                bloodType: 1,
                bloodGroup: 1,
                bloodUnit: 1,
                time: 1,
                hospital: 1,
                hospitalAddress: 1,
                country: 1,
                state: 1,
                city: 1,
                pinCode: 1,
                patientName: 1,
                patientEmail: 1,
                age: 1,
                desc: 1,
                social: 1,
                createdAt: 1,
                user: {
                    _id: 1,
                    name: 1,
                    image: 1,
                },
            },
        },
    ]);
    if (request) {
        return res.json({
            status: true,
            message: messages_1.SuccessMsg,
            data: request,
            pagination: {
                page,
                pageSize,
                nextPage: (request === null || request === void 0 ? void 0 : request.length) >= pageSize ? true : false,
                prePage: page == 1 ? false : true,
            },
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
requestRouter.post("/like/create", requestValidation_1.LikeValidate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = (0, global_1.getRequestAuth)(req);
    const { requestId } = req.body;
    const request = yield Request.updateOne({
        _id: requestId,
        "social.Likes": { $ne: authData.userId },
    }, {
        $push: { "social.Likes": authData.userId },
    });
    if (request.modifiedCount >= 1) {
        return res.json({
            status: true,
            message: "Your Vote is added...",
        });
    }
    else if (request.modifiedCount === 0) {
        const pullRequest = yield Request.updateOne({
            _id: requestId,
            "social.Likes": authData.userId,
        }, {
            $pull: { "social.Likes": authData.userId },
        });
        return res.json({
            status: false,
            message: "Your Vote is removed...",
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
module.exports = requestRouter;
