const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text : String,
    author : {
        id : {
            type : String,
            trim : true
        },
        nickName : {
            type : String,
            maxLength : 20
        },
        profilePhoto : {
            type : String
        }
    },
    date : {
        type : String
    },
    postId : String
})

module.exports = mongoose.model('Comment', commentSchema)