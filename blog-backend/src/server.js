import dotenv from "dotenv";
import app from "./app.js";
import connectWithMongoDB from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectWithMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is listing on port no : ", PORT);
    });
  })

  .catch((err) => {
    // console.log(`${process.env.DB_URL}/${DB_NAME}`);
    console.log("Mongo DB connection Failed..!", err);
  });
