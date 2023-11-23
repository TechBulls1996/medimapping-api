import express from "express";
import { FailedMsg, SuccessMsg } from "../helper/messages";
import { ApiFailedResponse, getRequestAuth } from "../helper/global";
import { recordValidate } from "../helper/validations/recordsValidation";
import { ObjectId } from "mongodb";

const recordsRouter = express.Router();
const Record = require("../db/models/Record");

recordsRouter.post(
  "/add",
  recordValidate,
  async (req: express.Request, res: express.Response) => {
    const authData = getRequestAuth(req);

    const request = await Record.create({
      userId: new ObjectId(authData.userId),
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


module.exports = recordsRouter;