import moment from "moment";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

export const getDate = (seprator: string = "/") => {
  // current timestamp in milliseconds
  let ts = Date.now();

  let date = new Date(ts);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let hour = date.getHours();
  let minutes = date.getMinutes();
  var ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;

  return (
    day +
    seprator +
    month +
    seprator +
    year +
    " " +
    hour +
    ":" +
    minutes +
    " " +
    ampm
  );
};

export const generateToken = (
  userId: any,
  userName: string,
  userEmail: string
) => {
  if (userId?.length <= 0 || userEmail?.length <= 0 || userName?.length <= 0) {
    return false;
  }

  let jwtSecretKey = process.env.SECRET_KEY;
  let data = {
    time: moment(),
    userId: userId,
    userName: userName,
    userEmail: userEmail,
  };
  const token = jwt.sign(data, jwtSecretKey);
  return token;
};

export const decodeToken = (token: string) => {
  if (token.length <= 0) {
    return false;
  }
  let jwtSecretKey = process.env.SECRET_KEY;
  return jwt.verify(token, jwtSecretKey, (error: any, decoded: any) => {
    if (error) {
      // console.log("Decode Token Error: ", error);
      return false;
    }
    return decoded;
  });
};

export const getRequestAuth = (req: any) => {
  const rawAuthStr = req.headers.authorization;
  const auth = rawAuthStr?.replace("Bearer ", "");
  return decodeToken(auth);
};

export const validationErrorHandler = (
  req: any,
  res: any,
  next: () => void
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({
      errors: errors.array().map((err: any) => {
        return { param: err.param, message: err.msg };
      }),
    });
  next();
};

export const ApiFailedResponse = (message: any, param: any = "global") => {
  return {
    status: false,
    errors: [
      {
        message,
        param,
      },
    ],
  };
};
