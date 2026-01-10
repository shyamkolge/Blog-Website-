import {ApiError , ApiResponse , asyncHandler} from '../utils/index.js'
import followModel from '../models/followUser.model.js'

const followUser = asyncHandler(async (req, res) => {
  const { authorId } = req.body;
  const userId = req.user._id;

  if (!authorId) {
    throw new ApiError(400, "Author ID is required");
  }

  if (userId.toString() === authorId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const alreadyFollowing = await followModel.findOne({
    userId,
    authorId,
  });

  if (alreadyFollowing) {
    throw new ApiError(400, "Already following this user");
  }

  const followed = await followModel.create({
    userId,
    authorId,
  });

  return res.json(
    new ApiResponse(200, followed, "Following successfully")
  );
});


const unfollowUser = asyncHandler(async (req, res) => {
  const { authorId } = req.body;
  const userId = req.user._id;

  const unfollow = await followModel.findOneAndDelete({
    userId,
    authorId,
  });

  if (!unfollow) {
    throw new ApiError(404, "Follow relationship not found");
  }

  return res.json(
    new ApiResponse(200, unfollow, "Un-followed successfully")
  );
});



const getFollowedUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const followed = await followModel
    .find({ userId })
    .populate(
      "authorId",
      "firstName lastName username profilePhoto email"
    );

  return res.json(
    new ApiResponse(200, followed, "Followed users fetched successfully")
  );
});


const checkUserFollow = asyncHandler(async (req, res) => {
  const { authorId } = req.body;
  const userId = req.user._id;

  const isFollowing = await followModel.exists({
    userId,
    authorId,
  });

  return res.json(
    new ApiResponse(200, { isFollowing: !!isFollowing }, "Follow status fetched")
  );
});


export { 
    followUser,
    unfollowUser,
    getFollowedUsers,
    checkUserFollow
} 