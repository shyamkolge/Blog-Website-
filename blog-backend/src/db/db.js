import mongoose from 'mongoose';

const connectWithMongoDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connection successful...!");
    } catch (error) {
        console.log("DB Connection Error :: db/index.js :: ", error);
        console.log(`Failed to connect to: ${process.env.DB_URL}`);
    }
};

export default connectWithMongoDB;
