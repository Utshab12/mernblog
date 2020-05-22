const express = require('express')
const Blog = require('../models/blogs')
const Feedback = require('../models/feedback')
const auth = require('../middlewares/userAuth')
const multer = require('multer')
const fs = require('fs')

const router  = new express.Router()

var storage =  multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'images/blogs')
  },
  filename: (req, file, cb)=>{
    cb(null, file.fieldname + '-'+Date.now()+ '.jpg')
  }
});
var upload = multer({

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  },
  storage: storage,
  
});

//blog creation
router.post('/user/blog', upload.single('image'), auth, async(req, res)=>{
  let blog
  if(req.file){
      blog = new Blog({
      ...req.body,
      image: req.file.path,
      creator: req.user._id
    })
  }else{
      blog = new Blog({
      ...req.body,
      creator: req.user._id
 
    })
  }
 
  try{
    await blog.save()
    res.status(200).send(blog)
  }catch(e){
    res.status(400).send(e)
  }
} 
)

// blog edit api
router.patch('/user/blog/edit/:id', upload.single('image'), auth, async(req,res)=>{
  if(req.file){
    req.body = {
      ...req.body,
        image:req.file.path,
    }
  }else{
    req.body = req.body
  }
  const updates = Object.keys(req.body)
  const allowedUpdates = ["title", "content", "image"]
  const isValid = updates.every((update) => allowedUpdates.includes(update))
  if(!isValid){
    res.status(400).send("User trying invalid Updates!")
  }
  try{
     const blog = await Blog.findById(req.params.id)
     if(req.user.id==blog.creator){
      updates.forEach((update)=>{
        if(update === 'image'){
         try{
           fs.unlinkSync(blog.image)
           // console.log("Image deleted successfully")
         }catch(err){
           console.log("Error while delete existing file"+err)
         }
       }
        blog[update] = req.body[update]
      })
      if(!blog){
        res.status(400).send()
      }
      await blog.save()
      res.status(200).send(blog)
     }else{
      res.status(400).send("Something going wrong")
     }
  }catch(e){
    res.status(400).send(e)
  }
})

//delete api
router.delete('/user/blog/del/:id', auth, async(req, res)=>{
  try{
    const blog = await Blog.findByIdAndDelete(req.params.id)
    res.status(200).send({blog, msg :'Deleted Successfully'})
  }catch(e){
    res.status(400).send(e)
  }
})

// get api
router.get('/blogs', async(req, res)=>{
  try{
    const blogs = await Blog.find()
    const feedback = await Feedback.find()
    res.status(200).send({blogs, feedback})
  }catch(e){
    res.status(400).send(e)
  }
})


// get api
router.get('/blogs/:id', async(req, res)=>{
  try{
    const blogs = await Blog.find({creator : req.params.id})
    // const feedback = await Feedback.find()
    res.status(200).send(blogs)
  }catch(e){
    res.status(400).send(e)
  }
})

module.exports = router