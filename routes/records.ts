import express from "express";
import { FailedMsg, SuccessMsg } from "../helper/messages";
import { ApiFailedResponse, getRequestAuth } from "../helper/global";
import { recordIdValidation, recordValidate } from "../helper/validations/recordsValidation";
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

recordsRouter.get("/", async (req: any, res: any) => {
  let page: any = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize: any = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  if (page === 0) page = 1;
  let skip = page * pageSize - pageSize;
  const sort = req.query.sort || "All";
  let finalSort: any = { CreatedAt: -1 };

  if (sort === "All" || sort === "Recent") {
    finalSort = { CreatedAt: -1 };
  } 

  const request = await Record.find()
  .sort(finalSort)
  .skip((page - 1) * pageSize)
  .limit(pageSize);

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


module.exports = recordsRouter;