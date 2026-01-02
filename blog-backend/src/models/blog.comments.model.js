import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    
    postId : {
       type:mongoose.Schema.Types.ObjectId,
       ref: 'Blog',
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    content: {
        type: String,
        required: true,
    },  
    createdAt: {
        type: Date, 
        default: Date.now,
    }
})


const commentModel = mongoose.model("blogComments", commentSchema);  

export default commentModel;