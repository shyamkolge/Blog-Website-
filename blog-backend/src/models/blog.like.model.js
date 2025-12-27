import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({ 
    postId : {  
         type:mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    createdAt: {    
        type: Date, 
        default: Date.now,
    }
});

const likeModel = mongoose.model("BlogLikes", likeSchema);  

export default likeModel;