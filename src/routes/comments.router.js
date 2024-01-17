const express = require('express')
const Comment = require('../models/comments.model')
const Post = require('../models/posts.model')
const router = express.Router()

router.post('/add', async(req, res, next) => {
    try {
        if(!req.body.text) {
            return res.send('내용을 입력해주세요')
        } else {
            const comment = await new Comment(req.body)
            const has = await Comment.findOne({_id : String(comment._id)})
            console.log(!!has)
            if(!has) {
                await comment.save()
                await Post.findOneAndUpdate({_id : req.body.postId}, {$inc : {comments : 1}})
                const comments = await Comment.find({postId : req.body.postId})
                return res.status(200).json({comments})                
            }
        }
    } catch (error) {
        next(error)
    }
})

router.post('/all', async (req, res, next) => {
    try {
        const comments = await Comment.find({postId : req.body.postId})
        return res.status(200).json({comments})
    } catch (error) {
        next(error)
    }
})

router.put('/edit', (async (req, res, next) => {
    try {
        const commentId = req.body.commentId
        const desc = req.body.description
        const comment = await Comment.findOne({_id : commentId})

        if(!comment) {
            res.send('존재하지 않는 댓글입니다')
        } else {
            const newComment = await Comment.findOneAndUpdate({_id : commentId}, {text : desc}, {new : true})
            return res.status(200).json(newComment)
        }        
    } catch (error) {
        next(error)
    }
}))

router.post('/del', (async (req, res, next) => {
    try {
        const commentId = req.body.commentId
        const comment = await Comment.findOne({_id : commentId})

        if(!comment) {
            res.send('존재하지 않는 댓글입니다')
        } else {
            await Comment.findOneAndDelete({_id : commentId})
            await Post.findOneAndUpdate({_id : req.body.postId}, {$inc : {comments : -1}})
            res.status(200).send('댓글 삭제에 성공했습니다')
        }
    } catch (error) {
        next(error)
    }
}))

module.exports = router