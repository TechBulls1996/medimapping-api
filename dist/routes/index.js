"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router = express_1.default.Router();
const { getDate } = require("../helper/global");
const authRoutes = require("./auth");
const userRouter = require("./user");
const requestRoutes = require("./request");
const authMiddelware = require("../middleware/auth");
// middleware that is specific to this router
router.use((req, res, next) => {
    const date = new Date();
    console.log("[server]:", req.originalUrl, " ", getDate());
    next();
});
// define the home page route
router.get("/", (req, res) => {
    res.json("Medimapping Api index page.");
});
// Enable CORS for all routes
const allowedOrigins = ['http://medimapping.com', 'http://www.medimapping.com'];
const corsOpts = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Type']
};
router.use((0, cors_1.default)(corsOpts));
//auth routes
router.use("/auth", authRoutes);
router.use("/request", authMiddelware, requestRoutes);
router.use("/user", authMiddelware, userRouter);
module.exports = router;
