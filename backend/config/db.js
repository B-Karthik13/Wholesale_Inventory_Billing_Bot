import { connect } from "mongoose";

//connect to DB
export const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URL || "mongodb://localhost:27017/wholesale-erp");
    console.log("DB connected");
  } catch (err) {
    console.log("Error in Db connection", err);
  }
};
