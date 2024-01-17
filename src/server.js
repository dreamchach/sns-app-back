const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 4000
const path = require('path')
const usersRouter = require('./routes/users.router')
const postsRouter = require('./routes/posts.router')
const commentsRouter = require('./routes/comments.router')
//const profileRouter = require('./routes/profiles.router')
//const likeRouter = require('./routes/likes.router')
//const friendsRouter = require('./routes/friends.router')
const cors = require('cors')
const multer = require('multer')
const upload = multer({
    storage : multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, 'public/')
        },
        filename : (req, file, cb) => {
            cb(null, `${file.originalname}_${Date.now()}.jpg`)
        }
    })
})

// .env 파일 사용
require('dotenv').config()

app.use(express.json())
app.use(cors())

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../public')))

// router
app.use('/auth', usersRouter)
app.use('/post', postsRouter)
app.use('/comment', commentsRouter)
//app.use('/profile/:id', profileRouter)
//app.use('/friends', friendsRouter)
//app.use('/posts/:id/like', likeRouter)

// mongoDB 연동
mongoose.connect(process.env.mongoDB_URI)
    .then(() => {
        console.log('mongoDB connected')
    })
    .catch((error) => {
        console.log(error)
    })

// express error handling
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.send(error.message || 'Error Occurred')
})

app.post('/image', upload.single('file'), async (req, res, next) => {
    try {
        return res.status(200).json({fileName : req.file.filename})
    } catch (error) {
        return next(error)
    }
})

app.post('/images', upload.array('files'), async (req, res, next) => {
    let array = []
    for(let i = 0; i < req.files.length; i += 1) {
        array.push(req.files[i].filename)
    }
    return res.status(200).json({fileNames : array})
})

app.get('/', (req, res) => {
    res.send('hello world')
})

// backend 최초 실행 시 사용되는 함수
app.listen(port, () => {
    console.log('backend is ready')
})