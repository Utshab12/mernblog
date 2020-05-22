const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt  = require("jsonwebtoken")


const userSchema = mongoose.Schema({
  avatar:{ 
     type: String
      },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isAlpha(value)){
        throw new Error("Only alphabets can be used!")
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("Email is invalid!")
      }
    }
  },
  password: {
    type: String,
    required: true,
    // validate(value){
    //   if(value.length<8){
    //     throw new Error("Password length must be 8 characters!")
    //   }
    // }  
  },
  tokens: [{
    token:{
      type: String,
      required: true
    }
  }]

})

userSchema.virtual('Blog',{
  ref: 'Blog',
  localField: '_id',
  foreignField: 'creator'
})

userSchema.virtual('Feedback', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'creator'
})

// Generating the authorization token 
userSchema.methods.generateAuthToken = async function(){
  const user = this
  const token = jwt.sign({_id: user._id.toString()}, 'blogingapp')
  user.tokens = user.tokens.concat({token})
  await user.save()
  return token
}

//hashing the password 
userSchema.pre('save', async function(next){
  const user = this
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//login credentials
userSchema.statics.findByCredentials = async(email, password)=>{
  const user = await User.findOne({email})
  if(!user){
    throw new Error("Email is incorrect!")
  }
  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch){
    throw new Error("Password is incorrect!")
  }

  return user
}


const User = mongoose.model('User', userSchema)
module.exports = User
