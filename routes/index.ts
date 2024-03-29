import express from "express";

const router = express.Router();
const { getDate } = require("../helper/global");

const authRoutes = require("./auth");
const userRouter = require("./user");
const publicRouter = require("./public");
const requestRoutes = require("./request");
const reportsRoutes = require("./records");

const authMiddelware = require("../middleware/auth");
// middleware that is specific to this router
router.use((req: any, res: any, next: () => void) => {
  const date = new Date();
  console.log("[server]:", req.originalUrl, " ", getDate());
  next();
});


// define the home page route
router.get("/", (req: any, res: any) => {
  res.json("Medimapping Api index page.");
});

//auth routes
router.use("/auth", authRoutes);
router.use("/public", publicRouter);
router.use("/request", authMiddelware, requestRoutes);
router.use("/records", authMiddelware, reportsRoutes);
router.use("/user", authMiddelware, userRouter);



module.exports = router;
