const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('./src/db/mongoose')
const UserRouter = require('./src/routers/User')
const BlogRouter = require('./src/routers/Blogs')
const FeedbackRouter = require('./src/routers/Feedback')
const path = require('path')

const app = express()
//port address
const port = process.env.PORT || 5000

if(process.env.NODE_ENV === 'production'){

    app.use(express.static('client/build'));
    app.get('*', (req, res)=>{
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// app.use(express.json())
app.use(cors());
app.options('*', cors());

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(UserRouter)
app.use(BlogRouter)
app.use(FeedbackRouter)
app.use('/images', express.static('images'))

//server start
app.listen(port, ()=>{
  console.log(`Server is working on port ${port}`)
})
