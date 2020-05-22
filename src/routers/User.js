const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/userAuth')
const multer = require('multer')
const fs = require('fs')

const router  = new express.Router()

var storage =  multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'images/avatars')
  },
  filename: (req, file, cb)=>{
    cb(null, file.fieldname + '-'+Date.now()+ '.jpg')
  }
});
var upload = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  },
  storage: storage,
  
});


// user signup api
router.post('/user', upload.single('avatar'), async(req, res)=>{
  let user
  if(req.file){
    user = new User({
      ...req.body,
      avatar: req.file.path
    })
  }else{
    user = new User({
      ...req.body 
    })
  }
 
  try{
    await user.save()
    const token = await user.generateAuthToken()
    console.log(token)
    res.status(200).send({user, token})
  }catch(e){
    res.status(400).send(e)
  }
}, (error, req, res, next)=>{
  res.status(400).send({error: error.message})
} 
)

// user login api
router.post('/user/login', async(req, res)=>{
  try{
    console.log(req.body.email)
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({user, token})
  }catch(e){
    res.status(400).send(e)
  }
})

// user logout api
router.post('/user/logout', auth, async(req, res)=>{
  try{
    req.user.tokens = []
    await req.user.save()
    res.status(200).send("Logout Successfully")
  }catch(e){  
    res.status(501).send(e)
  }
})

// user edit api
router.patch('/user/edit', upload.single('avatar'), auth, async(req,res)=>{
  if(req.file){
    req.body = {
      ...req.body,
      avatar:req.file.path
    }
  }else{
    req.body = req.body
  }
  const updates = Object.keys(req.body)
  const allowedUpdates = ["username", "email", "password", "avatar"]
  const isValid = updates.every((update) => allowedUpdates.includes(update))
  if(!isValid){
    res.status(400).send("User trying invalid Updates!")
  }
  try{
     const user = req.user
     updates.forEach((update)=>{
       if(update === 'avatar'){
        try{
          fs.unlinkSync(user.avatar)
          // console.log("Image deleted successfully")
        }catch(err){
          console.log("Error while delete existing file"+err)
        }
      }
       user[update] = req.body[update]
     })
     if(!user){
       res.status(400).send()
     }
     await user.save()
     res.status(200).send(user)
  }catch(e){
    res.status(400).send(e)
  }
})


module.exports = router