process.env.TS_NODE_DEV && require("dotenv").config();

import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import usersRouter from "./services/users";
import accommodationRouter from "./services/accomodation";

const server = express();
const port = process.env.port || 3001;

//passport.use("google", googleStrategy);

//***********************************Middlewares*******************************************************/

server.use(cors());
server.use(express.json());
//server.use(passport.initialize());

//***********************************Endpoints*********************************************************/
server.use("/users", usersRouter);
server.use("/accommodation", accommodationRouter);

//***********************************Error handlers****************************************************/

if (!process.env.MONGO_CONNECTION) {
  throw new Error("No Mongo url");
}

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("👌 Connected to Mongo!");

  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`🚀 Server listening on port ${port}`);
  });
});
