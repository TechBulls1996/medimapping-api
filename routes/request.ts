import express from "express";
import { FailedMsg, SuccessMsg } from "../helper/messages";
import { ApiFailedResponse, getRequestAuth } from "../helper/global";
import {
  LikeValidate,
  requestGetValidate,
} from "../helper/validations/requestValidation";
const Request = require("../db/models/Request");
const requestRouter = express.Router();
const { requestValidate } = require("../helper/validations/requestValidation");
import { ObjectId } from "mongodb";

requestRouter.post(
  "/",
  requestValidate,
  async (req: express.Request, res: express.Response) => {
    const authData = getRequestAuth(req);

    const request = await Request.create({
      userId: new ObjectId(authData.userId),
      patientEmail: req.body.email,
      patientName: req.body.name,
      ...req.body,
    });

    if (request) {
      return res.json({
        status: true,
        message: SuccessMsg,
        request,
      });
    }

    return res.status(401).json(ApiFailedResponse(FailedMsg));
  }
);

requestRouter.get("/", requestGetValidate, async (req: any, res: any) => {
  let page: any = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize: any = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  if (page === 0) page = 1;
  let skip = page * pageSize - pageSize;

  const request = await Request.aggregate([
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
      message: SuccessMsg,
      data: request,
      pagination: {
        page,
        pageSize,
        nextPage: request?.length >= pageSize ? true : false,
        prePage: page == 1 ? false : true,
      },
    });
  }

  return res.status(401).json(ApiFailedResponse(FailedMsg));
});

requestRouter.post(
  "/like/create",
  LikeValidate,
  async (req: express.Request, res: express.Response) => {
    const authData = getRequestAuth(req);
    const { requestId } = req.body;

    const request = await Request.updateOne(
      {
        _id: requestId,
        "social.Likes": { $ne: authData.userId },
      },
      {
        $push: { "social.Likes": authData.userId },
      }
    );
    if (request.modifiedCount >= 1) {
      return res.json({
        status: true,
        message: "Your Vote is added...",
      });
    } else if (request.modifiedCount === 0) {
      const pullRequest = await Request.updateOne(
        {
          _id: requestId,
          "social.Likes": authData.userId,
        },
        {
          $pull: { "social.Likes": authData.userId },
        }
      );
      return res.json({
        status: false,
        message: "Your Vote is removed...",
      });
    }

    return res.status(401).json(ApiFailedResponse(FailedMsg));
  }
);

module.exports = requestRouter;
