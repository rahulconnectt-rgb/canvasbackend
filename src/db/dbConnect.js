import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnect = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    const connectionInstance = await mongoose.connect(uri);

    console.log(
      `/n Database is connected successfully !! DB Host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`DB connection failed, ERROR : ${error}`);
    process.exit(1);
  }
};
