import express from "express";
const userRouter = express.Router();

userRouter.get("/", (req: any, res: any) => {
  res.json("User Page.");
});

module.exports = userRouter;
