const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    id : {
        type : String,
        //unique : true,
        trim : true
    },
    password : {
        type : String,
        minLength : 8,
        trim : true
    },
    nickName : {
        type : String,
        maxLength : 20
    },
    profilePhoto : {
        type : String
    },
    friends : [{
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
    }],
    friendsRequests : [{
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
    }],
    friendsSends : [{
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
    }]
})

userSchema.pre('save', async function(next) {
    let auth = this

    if(auth.isModified('password' || 'newPassword')) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(auth.password, salt)

        auth.password = hash
    }

    next()
})

userSchema.methods.comparePassword = async function (plain) {
    let auth = this
    const match = await bcrypt.compare(plain, auth.password)

    return match
}

const User = mongoose.model('User', userSchema)

module.exports = User