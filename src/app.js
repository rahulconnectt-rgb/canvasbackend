import express from "express";
import cors from "cors";
const app = express();

//middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//import all route
import canvasRoute from "./routes/canvas.route.js";

//use all route
app.use("/api/canvas", canvasRoute);

//defaul route for error
app.use((err, req, res, next) => {
  return res.status(500).json({
    sucess: false,
    data: null,
  });
});

export default app;
