const express = require('express')
const {check,validationResult} = require('express-validator')
const mysql = require('mysql')
const conn = require('../config')
const userRoutes = express.Router()
const postRoutes = express.Router()
const postsAction = express.Router()


// User Signup
userRoutes.post('/signup',[
    check('email','Enter a valid email').isEmail(),
    check('password','Enter a 6 digit password').isLength({
        min: 6
    }),
    check('name','Name field cannot be empty').notEmpty(),
    check('age','Enter a valid age').isInt()
],(req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }else{
        const {email,password,name,age} = req.body
        var sql = "SELECT * from users where u_email=?"
        conn.query(sql,[email],(err,result)=>{
            if(err){
                res.status(500).json({"message":"Mysql Query Error"})
            }else{
                if(result.length > 0){
                    res.status(401).json({"message":"User already exists"})
                }else{
                    var sql = "INSERT into users(u_email,u_password,u_name,u_age) VALUES(?,?,?,?)"
                    sql = mysql.format(sql,[email,password,name,age])
                    conn.query(sql,(err,result)=>{
                        if(err){
                            res.status(500).json({"message":"Mysql Query Error"})
                        }else if(result.affectedRows > 0){
                            res.status(200).json({"message":"Registered Successfully"})
                        }
                    })
                }
            }
        })
    }
});

// User Login
userRoutes.post('/login',[
    check('email','Enter a valid email').isEmail(),
    check('password','Enter password').notEmpty()
],(req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }else{
        const {email,password} = req.body
        var sql = "SELECT * from users where u_email=?"
        conn.query(sql,[email,password],(err,result)=>{
            if(err){
                res.status(500).json({"message":"Mysql Query Error"})
            }else{
                if(result.length == 0){
                    res.status(500).json({"result":"User does not exist"})
                }else{
                    if(result[0].u_password != password){
                      res.status(500).json({"result":"Wrong Password"})
                    }else{
                      res.status(200).json({"result":result[0]})
                    }
                    
                }
            }
        })
    }
});

//Get Single User by ID
userRoutes.get('/getSingleUser/:id',(req,res)=>{
    let id = req.params.id
    var sql = "SELECT * from users where u_id=?"
    conn.query(sql,[id],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          }else if (result.length == 0) {
            res.status(200).json({ result: "No User" });
          }else if (result.length > 0) {
            res.status(200).json({ result: result[0] });
          }
    })
})

// Update User Profile
userRoutes.put('/update/:id',(req,res)=>{
    let id = req.params.id
    const { name,age,password } = req.body;
    var sql = "UPDATE users set u_name=?,u_age=?,u_password=? where u_id=?"
    conn.query(sql,[name,age,password,id],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Unable to edit profile" });
          }else if (result.affectedRows > 0) {
            res.status(200).json({ message: "Profile Updated Successfully" });
          }
    })
})

// Add Post
postRoutes.post("/add",[
    check('content','Content cannot be empty').notEmpty(),
    check('image','Add an Image').notEmpty(),
    check('user','Specify User').notEmpty(),
],(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }else{
        const {content,image,user} = req.body
        var sql =
          "INSERT into posts(post_content,post_image,u_id) VALUES(?,?,?)";
        sql = mysql.format(sql, [content, image, user]);
        conn.query(sql, (err, result) => {
          if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          } else if (result.affectedRows > 0) {
            res.status(200).json({ message: "Post Successfully created" });
          }
        });
    }
})

//Get All Posts
postRoutes.get('/getAllPosts',(req,res)=>{
    var sql = "SELECT posts.post_id,posts.post_image,posts.post_content,users.u_name from posts inner join users on posts.u_id=users.u_id order by posts.post_added_date desc"
    conn.query(sql,(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          }else if (result.length == 0) {
            res.status(200).json({ posts: "No posts" });
          }else if (result.length > 0) {
            res.status(200).json({ posts: result });
          }
    })
})

//Get Single User Posts
postRoutes.get('/getUserPosts/:id',(req,res)=>{
    let user = req.params.id
    var sql = "SELECT * from posts where u_id=? order by post_added_date desc"
    conn.query(sql,[user],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          }else if (result.length == 0) {
            res.status(200).json({ posts: "No posts" });
          }else if (result.length > 0) {
            res.status(200).json({ posts: result });
          }
    })
})

//Get Single Post by ID
postRoutes.get('/getSinglePost/:postId',(req,res)=>{
    let postId = req.params.postId
    var sql = "SELECT posts.post_id,posts.post_image,posts.post_content,users.u_name from posts inner join users on posts.u_id=users.u_id where posts.post_id=?"
    conn.query(sql,[postId],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          }else if (result.length == 0) {
            res.status(200).json({ posts: "No posts" });
          }else if (result.length > 0) {
            res.status(200).json({ posts: result[0] });
          }
    })
})


//Get Post Comments
postRoutes.get('/getPostComments/:postId',(req,res)=>{
    let postId = req.params.postId
    var sql = "SELECT posts_comments.post_comment,users.u_name from posts_comments inner join users on posts_comments.u_id=users.u_id where post_id=? order by posts_comments.comment_added_date desc"
    conn.query(sql,[postId],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          }else if (result.length == 0) {
            res.status(200).json({ comments: "No Comments" });
          }else if (result.length > 0) {
            res.status(200).json({ comments: result });
          }
    })
})

// Add Comment
postRoutes.post('/postComment',(req,res)=>{
    const { comment, post, user } = req.body;
    var sql = "INSERT into posts_comments(post_comment,post_id,u_id) VALUES(?,?,?)"
    sql = mysql.format(sql, [comment, post, user]);
        conn.query(sql, (err, result) => {
          if (err) {
            res.status(500).json({ message: "Mysql Query Error" });
          } else if (result.affectedRows > 0) {
            res.status(200).json({ message: "Comment Posted Successfully" });
          }
        }
    )
})

// Delete Post
postRoutes.delete('/delete/:postId',(req,res)=>{
    let post = req.params.postId
    var sql = "DELETE from posts where post_id=?"
    conn.query(sql,[post],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Unable to delete post" });
          }else if (result.affectedRows > 0) {
            res.status(200).json({ message: "Post deleted successfully" });
          }
    })
})

// Update Post
postRoutes.put('/update/:postId',(req,res)=>{
    let post = req.params.postId
    const { image,content } = req.body;
    var sql = "UPDATE posts set post_image=?,post_content=? where post_id=?"
    conn.query(sql,[image,content,post],(err,result)=>{
        if (err) {
            res.status(500).json({ message: "Unable to edit post" });
          }else if (result.affectedRows > 0) {
            res.status(200).json({ message: "Post Updated Successfully" });
          }
    })
})





module.exports = {userRoutes,postRoutes,postsAction}