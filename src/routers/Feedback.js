const express = require('express')
const Feedback = require('../models/feedback')
const auth = require('../middlewares/userAuth')
const multer = require('multer')


const router  = new express.Router();

//create comments api 
router.post('/blog/comment/:id', auth, async(req,res)=>{
  try{
    let feedback =new Feedback({
       ...req.body,
       package: req.params.id,
       creator: req.user.id
    }) 
   await feedback.save()
   res.status(200).send(feedback)
  }catch(e){
    res.status(400).send(e)
  }
})


//delete comment api
router.delete('/blog/comment/del/:id', auth, async(req,res)=>{
  try{
    const feedback = await Feedback.findByIdAndDelete(req.params.id)  
    
   res.status(200).send({feedback, msg: "Comment Deleted"})
  }catch(e){
    res.status(400).send(e)
  }
})

module.exports = router