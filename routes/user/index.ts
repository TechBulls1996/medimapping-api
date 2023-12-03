import express from "express";
import { ApiFailedResponse, getRequestAuth } from "../../helper/global";
import { FailedMsg, SuccessMsg } from "../../helper/messages";
const userRouter = express.Router();
const Activity = require("../../db/models/Activity");

userRouter.get("/", (req: any, res: any) => {
  res.json("User Page.");
});

userRouter.get("/network", async (req: any, res: any) => {
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
    { $unwind: "$user" },
    {
      $match: {
        type: { $in: ["Response", "Like"] }, // Add this stage to filter by donation type
      },
    },
    {
      $group: {
        _id: "$userId",
        latestDonation: { $last: "$$ROOT" }, // Keep the latest donation activity for each user
      },
    },
    { $replaceRoot: { newRoot: "$latestDonation" } }, // Replace the root with the latest donation activity
    { $limit: pageSize },
    { $sort: sort },
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



module.exports = userRouter;
