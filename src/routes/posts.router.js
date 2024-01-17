const express = require('express')
const Post = require('../models/posts.model')
const router = express.Router()

router.post('/add', async(req, res, next) => {
    try {
        if(!req.body.description && !req.body.images) {
            return res.send('내용을 입력해주세요')
        } else {
            const post = await new Post(req.body)
            await post.save()
            const posts = await Post.find()
            return res.status(200).json({posts})
        }
    } catch (error) {
        next(error)
    }
})

router.post('/user/add', async(req, res, next) => {
    try {
        if(!req.body.description && !req.body.images) {
            return res.send('내용을 입력해주세요')
        }else {
            const post = await new Post(req.body)
            await post.save()
            const posts = await Post.find({"author.id" : req.body.author.id})
            return res.status(200).json({posts})
        }
    } catch (error) {
        next(error)
    }
})

router.get('/all', async (req, res, next) => {
    try {
        const posts = await Post.find()
        return res.status(200).json({posts})
    } catch (error) {
        next(error)
    }
})

router.put('/like', (async (req, res, next) => {
    try {
        const postId = req.body.postId
        const userId = req.body.userId

        const post = await Post.findOne({_id : postId})
        if(!post) {
            res.send('존재하지 않는 포스트입니다')
        }else {
            if(post.likes.includes(userId)) {
                const arr = post.likes.filter((item) => item !== userId)
                const newPost = await Post.findOneAndUpdate({_id : postId}, {likes : arr}, {new : true})
                return res.status(200).json(newPost)
            } else {
                const newPost = await Post.findOneAndUpdate({_id : postId}, {$push : {likes : userId}}, {new : true})
                return res.status(200).json(newPost)
            }
        }

    } catch (error) {
        next(error)
    }
}))

router.post('/one', (async (req, res, next) => {
    try {
        const post = await Post.findOne({_id : req.body.id})

        if(!post) {
            res.send('존재하지 않는 포스터입니다')
        }else {
            return res.status(200).json(post)
        }
    } catch (error) {
        next(error)
    }
}))

router.put('/edit/desc', (async (req, res, next) => {
    try {
        const postId = req.body.postId
        const desc = req.body.description
        const post = await Post.findOne({_id : postId})

        if(!post) {
            res.send('존재하지 않는 포스터입니다')
        } else {
            const newPost = await Post.findOneAndUpdate({_id : postId}, {description : desc}, {new : true})
            return res.status(200).json(newPost)
        }        
    } catch (error) {
        next(error)
    }

}))

router.put('/edit/imgs', (async (req, res, next) => {
    try {
        const postId = req.body.postId
        const imgs = req.body.imgs
        const post = await Post.findOne({_id : postId})

        if(!post) {
            res.send('존재하지 않는 포스터입니다')
        } else {
            const newPost = await Post.findOneAndUpdate({_id : postId}, {images : imgs}, {new : true})
            return res.status(200).json(newPost)
        }        
    } catch (error) {
        next(error)
    }

}))

router.post('/del', (async (req, res, next) => {
    try {
        const postId = req.body.postId
        const post = await Post.findOne({_id : postId})

        if(!post) {
            res.send('존재하지 않는 포스터입니다')
        } else {
            await Post.findOneAndDelete({_id : postId})
            res.status(200).send('포스트 삭제에 성공했습니다')
        }
    } catch (error) {
        next(error)
    }
}))



module.exports = router