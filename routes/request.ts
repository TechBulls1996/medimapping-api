import express from "express";
import { FailedMsg, SuccessMsg } from "../helper/messages";
import { ApiFailedResponse, getRequestAuth } from "../helper/global";
import {
  requestIdValidation,
  requestGetValidate,
} from "../helper/validations/requestValidation";
const Request = require("../db/models/Request");
const User = require("../db/models/User");
const Activity = require("../db/models/Activity");
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
  const authData = getRequestAuth(req);

  let page: any = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize: any = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

  if (page === 0) page = 1;
  let skip = page * pageSize - pageSize;

  const sort = req.query.sort || "All";
  let finalSort: any = { CreatedAt: -1 };
  let finalMatch: any = { $match: {} };

  if (sort === "All" || sort === "Recent") {
    finalSort = { CreatedAt: -1 };
  } else if (sort === "Higest") {
    finalSort = { "social.Likes": -1 };
  } else if (sort === "NearBy") {
    const user = await User.findById(authData.userId);
    finalMatch = { $match: { city: { value: user.city.value } } };
  }

  const request = await Request.aggregate([
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
  requestIdValidation,
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

      //add to activity also
      await Activity.create({
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

    return res.status(401).json(ApiFailedResponse(FailedMsg));
  }
);

requestRouter.post(
  "/response/create",
  requestIdValidation,
  async (req: express.Request, res: express.Response) => {
    const authData = getRequestAuth(req);
    const { requestId } = req.body;

    const request = await Request.findOne({
      _id: requestId,
      response: { $elemMatch: { userId: authData.userId } },
    });

    if (request) {
      return res.json({
        status: false,
        message: "You Already Responded to this Request",
      });
    } else {
      try {
        // Add response
        const statusText =
          request?.status && request?.status === "pending"
            ? "moderate"
            : request?.status || "pending";

        await Request.updateOne(
          {
            _id: requestId,
          },
          {
            $push: {
              response: { userId: authData.userId, time: new Date() },
            },
            status: statusText,
          }
        );

        //add to activity also
        await Activity.create({
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
      } catch (error) {
        console.log(error);
        return res.status(401).json(ApiFailedResponse(FailedMsg));
      }
    }
  }
);

requestRouter.get("/recent/donars", async (req: any, res: any) => {
  const authData = getRequestAuth(req);

  const pageSize: any = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  const sort = { CreatedAt: -1 };

  const request = await Activity.aggregate([
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
      message: SuccessMsg,
      data: request,
    });
  }

  return res.status(401).json(ApiFailedResponse(FailedMsg));
});

requestRouter.get("/recent/recievers", async (req: any, res: any) => {
  const authData = getRequestAuth(req);

  const pageSize: any = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  const sort = { CreatedAt: -1 };

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
      message: SuccessMsg,
      data: request,
    });
  }

  return res.status(401).json(ApiFailedResponse(FailedMsg));
});

module.exports = requestRouter;
