import mongoose from "mongoose";

const Connection = async () => {
    const URL = process.env.MONGO_URI; 
    try {
        await mongoose.connect(URL);
        console.log(`Database connected successfully`);
    } catch (error) {
        console.log(`Error while connecting to the database: ${error.message}`);
    }
};

export default Connection;
