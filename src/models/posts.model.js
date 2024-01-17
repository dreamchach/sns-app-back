const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    description : {
        type : String,
    },
    comments : {
        type : Number,
        default : 0
    },
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
    images : [{type : String}],
    likes : [{type : String}],
    date : {
        type : String
    }
}, {timestamps : true})

module.exports = mongoose.model('Post', postSchema)