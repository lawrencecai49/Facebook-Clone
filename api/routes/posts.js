/*jshint esversion: 10*/
const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');

const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).end("access denied");
  next();
};

//post a new post
router.post('/', isAuthenticated, async(req, res) => {
  try{
    const newPost = new Post({
      authour: req.user._id,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      public: req.body.public
    });
    let savedPost = await newPost.save();
    return res.json(savedPost);
  } catch (err) {
    console.log(err);
    return res.status(500).end("Error occurred when saving post");
  }
});
  
//delete a post
router.delete('/:postId', isAuthenticated, (req, res) => {
  Post.findByIdAndDelete(req.params.postId, (err, post) => {
    if (err) return res.status(500).end("Error occurred when deleting post");
    if (!post) return res.status(400).end("Could not find post");
    if (post.authour != req.user._id) return res.status(401).end("Access denied: You do not own the post");
    Comment.deleteMany({post: post._id});
    return res.json("Post sucessfully deleted");
  });
});

//get all posts
router.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) return res.status(500).end("Error occured when retrieving posts");
    return res.json(posts);
  });
});

module.exports = router;