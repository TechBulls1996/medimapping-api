import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
dotenv.config();

const app = express();
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

  database.on("error", (error: any) => {
    console.log(error);
  });

} catch (error) {
  console.log(error);
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Enable CORS for all routes
const allowedOrigins = 'http://medimapping.com';  
const corsOpts = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET','POST','HEAD','PUT','PATCH','DELETE'],
};
app.use(cors(corsOpts));

// routes
app.use("/", routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
