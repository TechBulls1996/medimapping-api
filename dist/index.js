"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
//connect with DB
const dbUrl = process.env.MONGODB;
mongoose.set("strictQuery", false);
try {
    mongoose.connect(dbUrl);
    const database = mongoose.connection;
    database.once("connected", () => {
        console.log("[DB]: Database Connected Successfully!");
    });
    database.on("error", (error) => {
        console.log(error);
    });
}
catch (error) {
    console.log(error);
}
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// routes
app.use("/", routes);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
