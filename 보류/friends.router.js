const express = require('express')
const router = express.Router()
const User = require('../src/models/users.model')

router.post('/all', async (req, res, next) => {
    try {
        const userId = req.body.userId
        const user = await User.findOne({id : userId})
        const all = await User.find()
        const nome = all.filter((item) => item.id !== user.id)
        res.status(200).json({users : nome})
    } catch (error) {
        next(error)
    }
})

router.post('/request', async (req, res, next) => {
    try {
        const requestUserId = req.body.requestUser.id
        const requestUserNickname = req.body.requestUser.nickname
        const requestUserPhoto = req.body.requestUser.photo
        const userId = req.body.userId
        const userNickname = req.body.nickname
        const userPhoto = req.body.photo

        const user = await User.findOne({id : requestUserId})
        if(!user) {
            res.send('존재하지 않는 회원입니다')
        }else {
            const auth = await User.findOneAndUpdate({})
        }

    } catch (error) {
        
    }
})



module.exports = router