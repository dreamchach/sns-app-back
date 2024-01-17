const express = require('express')
const router = express.Router()
const Auth = require('../models/users.model')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const Post = require('../models/posts.model')
//const auth = require('../middleware/auth')
//const bcrypt = require('bcrypt')

router.post('/signup', async (req, res, next) => {
    try {
        if(!req.body.id || !req.body.password || !req.body.nickName || !req.body.profilePhoto){
            return res.send('필수 정보가 입력되지 않았습니다')
        }else {
            const auth = await Auth.findOne({id : req.body.id})
            if(auth === null) {
                const auth = new Auth(req.body)
                const payload = {
                    userId : auth._id.toHexString()
                }
                const accessToken = jwt.sign(payload, process.env.jwt, {expiresIn : '24h'})

                auth.save()
        
                return res.json({auth, accessToken})                
            }else res.send('이미 존재하는 아이디입니다')
        }
    } catch (error) {
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        if(!req.body.id || !req.body.password) {
            return res.status(400).send('필수정보가 입력되지 않았습니다')
        }
        const auth = await Auth.findOne({id : req.body.id})

        if(auth === null) {
            return res.send('아이디를 찾을 수 없습니다')
        }
        const match = await auth.comparePassword(req.body.password)
        const payload = {
            userId : auth._id.toHexString()
        }
        const accessToken = jwt.sign(payload, process.env.jwt, {expiresIn : '24h'})


        if(!match) {
            return res.send('잘못된 비밀번호입니다')
        }
        return res.json({auth, accessToken})
    } catch (error) {
        next(error)
    }
})

router.post('/kakao/login', async (req, res, next) => {
    const {code} = req.body
    const restApiKey = process.env.kakaoClientID
    const data = {
        grant_type:'authorization_code',
        client_id:restApiKey,
        redirect_uri : 'http://localhost:3000/auth/kakao/callback',
        code
    }
    const header = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Authorization': 'Bearer '
    };
    const queryString = Object.keys(data)
    .map(k=>encodeURIComponent(k)+'='+encodeURIComponent(data[k]))
    .join('&')
    const kakaoToken = await axios.post("https://kauth.kakao.com/oauth/token", queryString, {headers: header})
    const accessToken = kakaoToken.data.access_token
    header.Authorization += accessToken
    const kakaoUserData = await axios.get('https://kapi.kakao.com/v2/user/me', {headers : header})

    const userData = {
        id : kakaoUserData.data.id,
        nickName : kakaoUserData.data.properties.nickname,
        profilePhoto : kakaoUserData.data.properties.profile_image
    }
    const resData = {
        auth : userData,
        accessToken
    }

    const user = await Auth.findOne({id : kakaoUserData.data.id})
    if(!user) {
        const auth = new Auth(userData)
        auth.save()
        res.status(200).json(resData)        
    } else res.status(200).json(resData)

})

router.post('/google/login', async (req, res, next) => {
    if(req.body.googleToken !== '') {
        const googleUserData = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${req.body.googleToken}`)

        const userData = {
            id : googleUserData.data.email,
            nickName : googleUserData.data.name,
            profilePhoto : googleUserData.data.picture
        }
        const data = {
            auth : userData,
            accessToken : req.body.googleToken
        }
        const user = await Auth.findOne({id : googleUserData.data.email})
        if(!user) {
            const auth = new Auth(userData)
            auth.save()
            res.status(200).json(data)            
        } else res.status(200).json(data)
    }
})

router.put('/me/nickname', async (req, res, next) => {
    try {
        if(!req.body.id || !req.body.nickName) {
            return res.send('필수 정보가 입력되지 않았습니다')
        }else {
            const auth = await Auth.findOne({id : req.body.id})
            if(!auth) {
                res.send('존재하지 않는 계정입니다')
            }else {
                const user = await Auth.findOneAndUpdate(
                    {id : req.body.id},
                    {nickName : req.body.nickName},
                    {new : true}
                )
                res.status(200).json(user)

            }
        }
    } catch (error) {
        next(error)
    }
})

router.put('/me/photo', async (req, res, next) => {
    try {
        if(!req.body.id || !req.body.profilePhoto) {
            res.send('필수 정보가 입력되지 않았습니다')
        } else {
            const auth = await Auth.findOne({id : req.body.id})
            if(!auth) {
                res.send('존재하지 않는 계정입니다')
            } else {
                const user = await Auth.findOneAndUpdate(
                    {id : req.body.id},
                    {profilePhoto : req.body.profilePhoto},
                    {new : true}
                )

                res.status(200).json(user)                
            }
        }
    } catch (error) {
        next(error)
    }
})

router.post('/user', async (req, res, next) => {
    try {
        const userId = req.body.id
        const user = await Auth.findOne({id : userId})
        if(!user) {
            res.send('존재하지 않는 유저입니다')
        } else {
            const posts = await Post.find({"author.id" : userId})
            res.status(200).json({user, posts})
        }
    } catch (error) {
        next(error)
    }
})

/*
router.get('/me', auth, async(req, res, next) => {
    console.log(req.body)
    try {
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]
        const decode = jwt.verify(token, process.env.jwt)
        const user = await Auth.findOne({'_id' : decode.userId})

        return res.json({user})
    } catch (error) {
        next(error)
    }
})

router.get('/logout', auth, async(req, res, next) => {
    console.log(req.body)
    try {
        return res.status(200).json({ResponseValue : true})
    } catch (error) {
        next(error)
    }
})

router.put('/user', auth, async(req, res, next) => {
    console.log(req.body)
    try {
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]
        const decode = jwt.verify(token, process.env.jwt)
        const user = await Auth.findOne({_id : decode.userId})
        const match = await user.comparePassword(req.body.oldPassword)

        if(match) {
            if(req.body.newPassword && req.body.profileImgBase64) {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(req.body.newPassword, salt)
    
                await Auth.findOneAndUpdate(
                    {_id : decode.userId},
                    {$set: {password : hash}},
                    {new : true}
                )

                const user = await Auth.findOneAndUpdate(
                    {_id : decode.userId},
                    {profileImgBase64 : req.body.profileImgBase64},
                    {new : true}
                )
    
                return res.status(200).json({user})
            }else if(req.body.newPassword) {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(req.body.newPassword, salt)
    
                const user = await Auth.findOneAndUpdate(
                    {_id : decode.userId},
                    {$set: {password : hash}},
                    {new : true}
                )

                return res.status(200).json({user})
            }else {
                const user = await Auth.findOneAndUpdate(
                    {_id : decode.userId},
                    {profileImgBase64 : req.body.profileImgBase64},
                    {new : true}
                )
    
                return res.status(200).json({user})
            }

        }else {
            return res.status(400).send('비밀번호가 일치하지 않습니다')
        }
    } catch (error) {
        next(error)
    }
})
*/
module.exports = router