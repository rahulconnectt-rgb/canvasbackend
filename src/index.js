import { dbConnect } from "./db/dbConnect.js";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port : http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });
