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
const User = require("../db/models/User");
const Activity = require("../db/models/Activity");
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
    const authData = (0, global_1.getRequestAuth)(req);
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    if (page === 0)
        page = 1;
    let skip = page * pageSize - pageSize;
    const sort = req.query.sort || "All";
    let finalSort = { CreatedAt: -1 };
    let finalMatch = { $match: {} };
    if (sort === "All" || sort === "Recent") {
        finalSort = { CreatedAt: -1 };
    }
    else if (sort === "Higest") {
        finalSort = { "social.Likes": -1 };
    }
    else if (sort === "NearBy") {
        const user = yield User.findById(authData.userId);
        finalMatch = { $match: { city: { value: user.city.value } } };
    }
    const request = yield Request.aggregate([
        finalMatch,
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
        { $sort: finalSort },
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
                status: 1,
                response: 1,
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
requestRouter.post("/like/create", requestValidation_1.requestIdValidation, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        //add to activity also
        yield Activity.create({
            userId: authData.userId,
            url: "/request/like/create",
            type: "Like",
            data: {
                by: "user",
                requestId: requestId,
            },
        });
        return res.json({
            status: false,
            message: "Your Vote is removed...",
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
requestRouter.post("/response/create", requestValidation_1.requestIdValidation, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = (0, global_1.getRequestAuth)(req);
    const { requestId } = req.body;
    const request = yield Request.findOne({
        _id: requestId,
        response: { $elemMatch: { userId: authData.userId } },
    });
    if (request) {
        return res.json({
            status: false,
            message: "You Already Responded to this Request",
        });
    }
    else {
        try {
            // Add response
            const statusText = (request === null || request === void 0 ? void 0 : request.status) && (request === null || request === void 0 ? void 0 : request.status) === "pending"
                ? "moderate"
                : (request === null || request === void 0 ? void 0 : request.status) || "pending";
            yield Request.updateOne({
                _id: requestId,
            }, {
                $push: {
                    response: { userId: authData.userId, time: new Date() },
                },
                status: statusText,
            });
            //add to activity also
            yield Activity.create({
                userId: authData.userId,
                url: "/request/response/create",
                type: "Response",
                data: {
                    by: "user",
                    requestId: requestId,
                },
            });
            //response
            return res.json({
                status: true,
                message: "Your Response is added...",
            });
        }
        catch (error) {
            console.log(error);
            return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
        }
    }
}));
requestRouter.get("/recent/donars", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = (0, global_1.getRequestAuth)(req);
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const sort = { CreatedAt: -1 };
    const request = yield Activity.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $limit: pageSize },
        { $sort: sort },
        { $unwind: "$user" },
        {
            $project: {
                _id: 1,
                user: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    city: 1,
                    state: 1,
                },
                type: 1,
            },
        },
    ]);
    if (request) {
        return res.json({
            status: true,
            message: messages_1.SuccessMsg,
            data: request,
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
requestRouter.get("/recent/recievers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = (0, global_1.getRequestAuth)(req);
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const sort = { CreatedAt: -1 };
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
        { $limit: pageSize },
        { $sort: sort },
        { $unwind: "$user" },
        {
            $project: {
                _id: 1,
                bloodType: 1,
                bloodGroup: 1,
                city: 1,
                state: 1,
                user: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    city: 1,
                    state: 1,
                },
                type: 1,
            },
        },
    ]);
    if (request) {
        return res.json({
            status: true,
            message: messages_1.SuccessMsg,
            data: request,
        });
    }
    return res.status(401).json((0, global_1.ApiFailedResponse)(messages_1.FailedMsg));
}));
module.exports = requestRouter;
