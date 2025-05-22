import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`mongodb connected successfully with ${process.env.MONGO_URI}`);
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;