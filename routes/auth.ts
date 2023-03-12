import express from "express";
import { FailedMsg } from "../helper/messages";
const authRouter = express.Router();
const {
  loginUser,
  UpdatePassword,
  findUserByEmail,
  registerUser,
} = require("../helper/auth");
const {
  loginValidate,
  emailValidate,
  registerValidate,
} = require("../helper/validations/authValidation");

const {
  LoginSuccess,
  LoginFail,
  PasswordUpdated,
  PasswordFailed,
  NotFound,
  RegisterSuccess,
} = require("../helper/messages");

const { ApiFailedResponse } = require("../helper/global");

authRouter.post(
  "/login",
  loginValidate,
  async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const login = await loginUser(email, password);
    if (login) {
      return res.json({
        status: login.status,
        message: LoginSuccess,
        token: login.authToken,
        user: login.user,
      });
    }

    return res.status(401).json(ApiFailedResponse(LoginFail));
  }
);

authRouter.post(
  "/register",
  registerValidate,
  async (req: express.Request, res: express.Response) => {
    const user = await registerUser(req.body);
    if (user && user.status) {
      return res.json({
        status: true,
        message: RegisterSuccess,
        token: user.authToken,
        user,
      });
    } else if (user && !user.status) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            param: "global",
            message:
              "Your Email/Phone [" +
              (user?.error?.keyValue?.email || user?.error?.keyValue?.mobile) +
              "] is duplicate.",
          },
        ],
      });
    }
    return res.status(401).json(ApiFailedResponse(FailedMsg));
  }
);

authRouter
  .post(
    "/forgot/password",
    emailValidate,
    async (req: express.Request, res: express.Response) => {
      const { email } = req.query;
      const user = await findUserByEmail(email);
      if (user) {
        //sent mail to user
      }
      res.status(401).json({ status: false, message: NotFound });
    }
  )
  .post(
    "/forgot/password/update",
    loginValidate,
    async (req: express.Request, res: express.Response) => {
      const { email, password } = req.query;
      const updatePass = await UpdatePassword(email, password);
      if (updatePass) {
        res.json({
          status: true,
          message: PasswordUpdated,
        });
      }

      res.status(401).json({ status: false, message: PasswordFailed });
    }
  );

module.exports = authRouter;
