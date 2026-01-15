import blogModel from "../models/blog.model.js";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import BlogCategoryController from "../models/blog.categories.model.js";
import likeModel from "../models/blog.like.model.js";
import commentModel from "../models/blog.comments.model.js";
import uploadOnCloudinary from "../services/cloudinary.js";
import { userModel } from "../models/user.model.js";
import followModel from '../models/followUser.model.js';
import { updateBlogTrendingScore } from "../services/trendingService.js";

// Create blog
const createBlog = asyncHandler(async (req, res) => {
  const { tittle, content, slug, visibility, category } = req?.body;

  const author = req?.user._id;

  let featureImages = null;

  if (req.file) {
    const uploadRes = await uploadOnCloudinary(req.file.buffer);
    if (uploadRes?.secure_url) {
      featureImages = uploadRes.secure_url;
    }
  }

  const blog = await blogModel.create({
    tittle,
    content,
    featureImages,
    slug,
    visibility,
    category,
    author,
  });

  // Populate the created blog with author and category
  const populatedBlog = await blogModel.findById(blog._id)
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug');

  res.status(200).json({
    status: "success",
    data: populatedBlog,
    message: "Blog created successfully",
  });

});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.author.toString() !== req?.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this blog");
  }

  await blogModel.findByIdAndDelete(blogId);

  return res.json(new ApiResponse(200, null,"Blog deleted successfully"));
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { tittle, content, slug, visibility, category } = req.body;
  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.author.toString() !== req?.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this blog");
  }

  blog.tittle = tittle || blog.tittle;
  blog.content = content || blog.content;
  blog.slug = slug || blog.slug;
  blog.visibility = visibility || blog.visibility;
  blog.category = category || blog.category;
  blog.updatedAt = Date.now();

  await blog.save();

  return res.json(new ApiResponse(200, blog, "Blog updated successfully"));
});

// Get user blog
const getUserBlogs = asyncHandler(async (req, res) => {
  const author = req?.user._id;
  const blogs = await blogModel.find({ author })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, blogs, "User Blogs fetched successfully"));
});


/**
 * Get All Blogs with Smart Sorting Options
 * 
 * Sorting Strategies:
 * 1. "latest"     - Newest first (chronological)
 * 2. "oldest"     - Oldest first
 * 3. "popular"    - Most engagement (likes + comments + reads)
 * 4. "smart"      - Balanced algorithm (DEFAULT) - fair exposure for all
 * 5. "random"     - Randomized feed for discovery
 * 
 * The "smart" algorithm balances:
 * - Engagement score (40%)
 * - Recency bonus (30%)
 * - Random factor (30%) - gives older posts a chance
 */
const getAllBlogs = asyncHandler(async (req, res) => {
  const { 
    sort = 'smart',  // Default to smart sorting
    page = 1, 
    limit = 10,
    category 
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Base query
  const matchQuery = { visibility: 'public' };
  
  // Add category filter if provided
  if (category) {
    const categoryDoc = await BlogCategoryController.findOne({ slug: category });
    if (categoryDoc) {
      matchQuery.category = categoryDoc._id;
    }
  }

  let blogs;
  let totalCount;

  switch (sort) {
    case 'latest':
      // Simple chronological - newest first
      blogs = await blogModel.find(matchQuery)
        .populate('author', 'firstName lastName username profilePhoto email')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      totalCount = await blogModel.countDocuments(matchQuery);
      break;

    case 'oldest':
      // Oldest first
      blogs = await blogModel.find(matchQuery)
        .populate('author', 'firstName lastName username profilePhoto email')
        .populate('category', 'name slug')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));
      totalCount = await blogModel.countDocuments(matchQuery);
      break;

    case 'popular':
      // Most engagement - good for "best of all time"
      blogs = await blogModel.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            popularityScore: {
              $add: [
                { $multiply: [{ $ifNull: ["$likeCount", 0] }, 3] },
                { $multiply: [{ $ifNull: ["$commentCount", 0] }, 5] },
                { $ifNull: ["$readCount", 0] }
              ]
            }
          }
        },
        { $sort: { popularityScore: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        // Lookup author
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              { $project: { firstName: 1, lastName: 1, username: 1, profilePhoto: 1, email: 1 } }
            ]
          }
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        // Lookup category
        {
          $lookup: {
            from: "blogcategories",
            localField: "category",
            foreignField: "_id",
            as: "category",
            pipeline: [{ $project: { name: 1, slug: 1 } }]
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $project: { popularityScore: 0 } }
      ]);
      totalCount = await blogModel.countDocuments(matchQuery);
      break;

    case 'random':
      // Random sampling - great for discovery
      blogs = await blogModel.aggregate([
        { $match: matchQuery },
        { $sample: { size: parseInt(limit) } },
        // Lookup author
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              { $project: { firstName: 1, lastName: 1, username: 1, profilePhoto: 1, email: 1 } }
            ]
          }
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        // Lookup category
        {
          $lookup: {
            from: "blogcategories",
            localField: "category",
            foreignField: "_id",
            as: "category",
            pipeline: [{ $project: { name: 1, slug: 1 } }]
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
      ]);
      totalCount = await blogModel.countDocuments(matchQuery);
      break;

    case 'smart':
    default:
      /**
       * Smart Feed Algorithm
       * 
       * Score = (engagementScore × 0.4) + (recencyScore × 0.3) + (randomFactor × 0.3)
       * 
       * This ensures:
       * - High-quality content gets visibility (engagement)
       * - New content gets a chance (recency)
       * - Old but good content can resurface (random factor)
       */
      const now = new Date();
      const maxAgeDays = 30; // Consider posts from last 30 days for recency bonus
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

      blogs = await blogModel.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            // 1. Engagement Score (normalized 0-100)
            engagementScore: {
              $min: [
                100,
                {
                  $add: [
                    { $multiply: [{ $ifNull: ["$likeCount", 0] }, 2] },
                    { $multiply: [{ $ifNull: ["$commentCount", 0] }, 4] },
                    { $multiply: [{ $ifNull: ["$readCount", 0] }, 0.1] }
                  ]
                }
              ]
            },
            
            // 2. Recency Score (100 for new posts, decays over maxAgeDays)
            ageMs: { $subtract: [now, "$createdAt"] },
          }
        },
        {
          $addFields: {
            recencyScore: {
              $max: [
                0,
                {
                  $multiply: [
                    100,
                    { $subtract: [1, { $divide: [{ $min: ["$ageMs", maxAgeMs] }, maxAgeMs] }] }
                  ]
                }
              ]
            },
            
            // 3. Random Factor (0-100) - gives every post a chance
            randomFactor: { $multiply: [{ $rand: {} }, 100] }
          }
        },
        {
          $addFields: {
            // Final Smart Score
            smartScore: {
              $add: [
                { $multiply: ["$engagementScore", 0.4] },  // 40% engagement
                { $multiply: ["$recencyScore", 0.3] },    // 30% recency
                { $multiply: ["$randomFactor", 0.3] }     // 30% random (fair chance)
              ]
            }
          }
        },
        { $sort: { smartScore: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        // Lookup author
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              { $project: { firstName: 1, lastName: 1, username: 1, profilePhoto: 1, email: 1 } }
            ]
          }
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        // Lookup category
        {
          $lookup: {
            from: "blogcategories",
            localField: "category",
            foreignField: "_id",
            as: "category",
            pipeline: [{ $project: { name: 1, slug: 1 } }]
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        // Clean up internal fields
        {
          $project: {
            engagementScore: 0,
            recencyScore: 0,
            randomFactor: 0,
            smartScore: 0,
            ageMs: 0
          }
        }
      ]);
      totalCount = await blogModel.countDocuments(matchQuery);
      break;
  }

  return res.json(new ApiResponse(200, {
    blogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalBlogs: totalCount,
      hasMore: skip + blogs.length < totalCount
    },
    sortedBy: sort
  }, "Blogs fetched successfully"));
});


/**
 * Production-Grade Trending Algorithm
 * 
 * Formula: TrendingScore = (W1 × likes + W2 × comments + W3 × shares + W4 × reads) × TimeDecay
 * 
 * Weights:
 * - Likes: 3 (high intent signal)
 * - Comments: 5 (highest engagement)
 * - Shares: 4 (viral potential)
 * - Reads: 1 (passive engagement)
 * 
 * Time Decay: Uses exponential decay based on post age
 * - Half-life of ~3 days (posts lose half their score every 3 days)
 */
const getTrendingBlogs = asyncHandler(async (req, res) => {
  const { 
    limit = 10, 
    page = 1,
    timeWindow = 7,  // Days to consider for trending
    category 
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Scoring weights
  const WEIGHTS = {
    likes: 3,
    comments: 5,
    shares: 4,
    reads: 1
  };
  
  // Half-life in days (score halves every 3 days)
  const HALF_LIFE_DAYS = 3;
  const DECAY_CONSTANT = Math.log(2) / (HALF_LIFE_DAYS * 24 * 60 * 60 * 1000);

  // Build match query
  const matchQuery = {
    visibility: 'public',
    createdAt: { 
      $gte: new Date(Date.now() - parseInt(timeWindow) * 24 * 60 * 60 * 1000) 
    }
  };

  // Add category filter if provided
  if (category) {
    const categoryDoc = await BlogCategoryController.findOne({ slug: category });
    if (categoryDoc) {
      matchQuery.category = categoryDoc._id;
    }
  }

  const now = new Date();

  const trendingBlogs = await blogModel.aggregate([
    // Stage 1: Match public blogs within time window
    { $match: matchQuery },
    
    // Stage 2: Calculate trending score with time decay
    {
      $addFields: {
        // Age in milliseconds
        ageMs: { $subtract: [now, "$createdAt"] },
        
        // Raw engagement score (weighted sum)
        rawScore: {
          $add: [
            { $multiply: [{ $ifNull: ["$likeCount", 0] }, WEIGHTS.likes] },
            { $multiply: [{ $ifNull: ["$commentCount", 0] }, WEIGHTS.comments] },
            { $multiply: [{ $ifNull: ["$shareCount", 0] }, WEIGHTS.shares] },
            { $multiply: [{ $ifNull: ["$readCount", 0] }, WEIGHTS.reads] }
          ]
        }
      }
    },
    
    // Stage 3: Apply time decay using exponential decay formula
    {
      $addFields: {
        trendingScore: {
          $multiply: [
            "$rawScore",
            {
              $exp: {
                $multiply: [-DECAY_CONSTANT, "$ageMs"]
              }
            }
          ]
        }
      }
    },
    
    // Stage 4: Add velocity bonus (engagement per hour)
    {
      $addFields: {
        engagementVelocity: {
          $cond: {
            if: { $gt: ["$ageMs", 0] },
            then: {
              $divide: [
                "$rawScore",
                { $divide: ["$ageMs", 3600000] } // Convert to hours
              ]
            },
            else: "$rawScore"
          }
        }
      }
    },
    
    // Stage 5: Final score combines trending score and velocity
    {
      $addFields: {
        finalScore: {
          $add: [
            "$trendingScore",
            { $multiply: ["$engagementVelocity", 0.1] } // 10% velocity bonus
          ]
        }
      }
    },
    
    // Stage 6: Sort by final score
    { $sort: { finalScore: -1 } },
    
    // Stage 7: Pagination
    { $skip: skip },
    { $limit: parseInt(limit) },
    
    // Stage 8: Lookup author details
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [
          { $project: { firstName: 1, lastName: 1, username: 1, profilePhoto: 1, email: 1 } }
        ]
      }
    },
    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    
    // Stage 9: Lookup category details
    {
      $lookup: {
        from: "blogcategories",
        localField: "category",
        foreignField: "_id",
        as: "category",
        pipeline: [
          { $project: { name: 1, slug: 1 } }
        ]
      }
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    
    // Stage 10: Clean up response (remove internal scoring fields)
    {
      $project: {
        ageMs: 0,
        rawScore: 0,
        engagementVelocity: 0
      }
    }
  ]);

  // Get total count for pagination
  const totalCount = await blogModel.countDocuments(matchQuery);

  return res.json(new ApiResponse(200, {
    blogs: trendingBlogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalBlogs: totalCount,
      hasMore: skip + trendingBlogs.length < totalCount
    }
  }, "Trending blogs fetched successfully"));
});


// Get single blog by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const blog = await blogModel.findOne({ slug })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug');

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check visibility - only allow public blogs or blogs by the user
  if (blog.visibility === 'private') {
    if (!req.user) {
      throw new ApiError(401, "Please log in to view this private blog");
    }
    if (blog.author._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You don't have permission to view this blog");
    }
  }

  // Increment read count only once per session (using cookie)
  // This prevents counting multiple views from the same user in a short time
  const viewKey = `blog_view_${blog._id}`;
  const hasViewed = req.cookies?.[viewKey];
  
  if (!hasViewed) {
    blog.readCount = (blog.readCount || 0) + 1;
    await blog.save();
    
    // Update trending score asynchronously (non-blocking)
    updateBlogTrendingScore(blog._id).catch(err => 
      console.error('Failed to update trending score:', err)
    );
    
    // Set a cookie to track this view (expires in 1 hour to allow re-counting after some time)
    res.cookie(viewKey, 'true', {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: false, // Allow client-side access if needed
      sameSite: 'lax'
    });
  }

  return res.json(new ApiResponse(200, blog, "Blog fetched successfully"));
});



// Get followers blog 
const getFollowersBlogs = asyncHandler(async (req, res) => {
  const { sort = 'latest' } = req.query;
  const userId = req?.user._id;

  const following = await followModel.find({ userId }).select("authorId");

  if (!following.length) {
    return res.json(
      new ApiResponse(200, { blogs: [], followingCount: 0 }, "No blogs from followed users")
    );
  }

  const followedUserIds = following.map(f => f.authorId);

  // Determine sort order
  let sortOption = { createdAt: -1 }; // Default: latest first
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const blogs = await blogModel.find({ 
    author: { $in: followedUserIds },
    visibility: 'public'
  })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort(sortOption);
    
  return res.json(new ApiResponse(200, {
    blogs,
    followingCount: followedUserIds.length,
    totalBlogs: blogs.length,
    sortedBy: sort
  }, "Blogs fetched successfully"));
})


// Get user's liked posts
const getUserLikedPosts = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  
  const likes = await likeModel.find({ user: userId })
    .populate({
      path: 'postId',
      populate: [
        { path: 'author', select: 'firstName lastName username profilePhoto email' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .sort({ createdAt: -1 });

  const likedPosts = likes
    .filter(like => like.postId !== null)
    .map(like => like.postId);

  return res.json(new ApiResponse(200, likedPosts, "User liked posts fetched successfully"));
});

// Get user's comments
const getUserComments = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  
  const comments = await commentModel.find({ user: userId })
    .populate({
      path: 'postId',
      populate: [
        { path: 'author', select: 'firstName lastName username profilePhoto email' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .populate('user', 'firstName lastName username profilePhoto')
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, comments, "User comments fetched successfully"));
});

// Like/Unlike a blog
const toggleLike = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to like blogs");
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check if user already liked this blog
  const existingLike = await likeModel.findOne({ postId: blogId, user: userId });

  if (existingLike) {
    // Unlike - remove the like
    await likeModel.findByIdAndDelete(existingLike._id);
    blog.likeCount = Math.max(0, (blog.likeCount || 0) - 1);
    await blog.save();
    
    // Update trending score asynchronously
    updateBlogTrendingScore(blogId).catch(err => 
      console.error('Failed to update trending score:', err)
    );
    
    return res.json(new ApiResponse(200, { liked: false, likeCount: blog.likeCount }, "Blog unliked successfully"));
  } else {
    // Like - add the like
    await likeModel.create({ postId: blogId, user: userId });
    blog.likeCount = (blog.likeCount || 0) + 1;
    await blog.save();
    
    // Update trending score asynchronously
    updateBlogTrendingScore(blogId).catch(err => 
      console.error('Failed to update trending score:', err)
    );
    
    return res.json(new ApiResponse(200, { liked: true, likeCount: blog.likeCount }, "Blog liked successfully"));
  }
});

// Check if user liked a blog
const checkUserLiked = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req?.user?._id;

  if (!userId) {
    return res.json(new ApiResponse(200, { liked: false }, "User not logged in"));
  }

  const like = await likeModel.findOne({ postId: blogId, user: userId });
  return res.json(new ApiResponse(200, { liked: !!like }, "Like status fetched successfully"));
});

// Add a comment to a blog
const addComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to comment");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Create comment
  const comment = await commentModel.create({
    postId: blogId,
    user: userId,
    content: content.trim(),
  });

  // Update blog comment count
  blog.commentCount = (blog.commentCount || 0) + 1;
  await blog.save();

  // Update trending score asynchronously
  updateBlogTrendingScore(blogId).catch(err => 
    console.error('Failed to update trending score:', err)
  );

  // Populate comment with user info
  const populatedComment = await commentModel.findById(comment._id)
    .populate('user', 'firstName lastName username profilePhoto');

  return res.json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

// Get comments for a blog
const getBlogComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const comments = await commentModel.find({ postId: blogId })
    .populate('user', 'firstName lastName username profilePhoto')
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to delete comments");
  }

  const comment = await commentModel.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user is the author of the comment
  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // Get the blog to update comment count
  const blog = await blogModel.findById(comment.postId);
  if (blog) {
    blog.commentCount = Math.max(0, (blog.commentCount || 0) - 1);
    await blog.save();
  }

  await commentModel.findByIdAndDelete(commentId);

  return res.json(new ApiResponse(200, null, "Comment deleted successfully"));
});


// Bookmark/Unbookmark a blog
const bookmarkBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req?.user._id;

  if (!userId) {
    throw new ApiError(401, "Please log in to bookmark blogs");
  }

  const blog = await blogModel.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if blog is already bookmarked
  const isBookmarked = user.bookmarkedBlogs.some(
    (id) => id.toString() === blogId.toString()
  );

  if (isBookmarked) {
    // Unbookmark - remove from array
    user.bookmarkedBlogs = user.bookmarkedBlogs.filter(
      (id) => id.toString() !== blogId.toString()
    );
    await user.save();
    return res.json(new ApiResponse(200, { bookmarked: false }, "Blog unbookmarked successfully"));
  } else {
    // Bookmark - add to array
    user.bookmarkedBlogs.push(blogId);
    await user.save();
    return res.json(new ApiResponse(200, { bookmarked: true }, "Blog bookmarked successfully"));
  }
});


// get the bookmarked blogs
const getBookmarkedBlogs = asyncHandler(async (req, res) => {
  const userId = req?.user._id;
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const bookmarkedBlogs = await blogModel.find({ _id: { $in: user.bookmarkedBlogs } })
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  
  return res.json(new ApiResponse(200, bookmarkedBlogs, "Bookmarked blogs fetched successfully"));
});


export { 
  createBlog, 
  deleteBlog, 
  updateBlog, 
  getUserBlogs, 
  getAllBlogs,
  getBlogBySlug,
  getUserLikedPosts,
  getUserComments,
  getTrendingBlogs,
  getBlogComments,
  getBookmarkedBlogs,
  getFollowersBlogs,
  toggleLike,
  checkUserLiked,
  addComment,
  deleteComment,
  bookmarkBlog,
};
