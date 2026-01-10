import mongoose from "mongoose";

const FollowUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },

  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
});

FollowUserSchema.index({ userId: 1 });
FollowUserSchema.index({ authorId: 1 });
FollowUserSchema.index(
  { userId: 1, authorId: 1 },
  { unique: true }
);

const followModel = mongoose.model("followModel", FollowUserSchema);

export default followModel;
