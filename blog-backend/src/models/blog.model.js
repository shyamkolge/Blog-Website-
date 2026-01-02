import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  
    tittle: {
        type: String,
        required: true,
    },  
    content: {
        type: String,
        required: true,
    },
    featureImages:{
        type:String,
    },
    slug:{
        type: String,
        required: true,
        unique: true,
    },
    visibility:{
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BlogCategories'
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    shareCount: {
        type: Number,
        default: 0,
    },
    readCount: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date, 
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})


const blogModel = mongoose.model("Blog", blogSchema);

export default blogModel;
