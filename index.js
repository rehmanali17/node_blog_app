const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const {userRoutes, postRoutes,postsAction} = require('./routes/Routes')
const conn = require('./config')
// Database connection
conn.connect((err)=>{
    if(!err){
        console.log('Database connection successful')
    }else{
        console.log(err.sqlMessage)
    }
})



// Express App Settings
const PORT = process.env.port || 3000
const app = express()
app.use(express.json({extended:false, limit: '50mb'}))
app.use(cors())
app.use('/user', userRoutes);
app.use('/user/posts/', postRoutes);
app.use('/post/action/', postsAction);

app.listen(PORT,()=> console.log(`Server running at port ${PORT}`))