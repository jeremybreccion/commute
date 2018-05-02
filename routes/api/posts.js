var express = require('express');
var router = express.Router();
var config = require('../../config/config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.database.name, { native_parser: true });
db.bind(config.database.collections.posts);

router.post('/add', function(req, res, next){
    var addedPost = req.body;

    //likes, dislikes, & comments are list of users
    addedPost.likes = [];
    addedPost.dislikes = [];
    //supposedly array of objects
    addedPost.comments = [];

    db.posts.insert(addedPost, function(err){
        if(err){
            res.status(400).send({message: 'Cannot add this post'});
        }
        else{
            res.status(200).send({message: 'Post successfully added'});
        }
    });
});

//for search results. can have more than 1
//POST method is use to get posts because req.body must be used
//req.body must be used because express.jwt.unless does not exempt url routes with params
//need to exempt route so user is not required to login when searching
router.post('/searchPosts', function(req, res, next){
    //{ title: {from: req.params.from, to: req.params.to}} does not work
    console.log(req.body);
    db.posts.find({'title.from': req.body.from, 'title.to': req.body.to}).toArray(function(err, posts){
        if(err){
            res.status(400).send({message: 'Error in searching'});
        }
        else if(posts.length == 0){
            res.status(400).send({message: 'No results found'});
        }
        else{
            res.status(200).send(posts);
        }
    });
});

router.post('/viewPost', function(req, res, next){
    db.posts.findOne({_id: mongo.helper.toObjectID(req.body.id)}, function(err, post){
        if(err){
            res.status(400).send({message: 'Error in searching'});
        }
        else if(post){
            res.status(200).send(post);
        }
        else{
            res.status(400).send({message: 'Cannot find that particular guide'});
        }
    });
});

router.put('/likePost/:id', function(req, res){
    var updateOp = {};

    db.posts.findOne({_id: mongo.helper.toObjectID(req.params.id)}, function(err, aPost){
        if(err){
            res.status(400).send();
        }
        //check if the user has already either liked or disliked the post
        else{
            if(aPost.likes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {likes: req.session.user.username}
                };
            }
            else if(aPost.dislikes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {dislikes: req.session.user.username},
                    $push: {likes: req.session.user.username}
                }
            }
            else{
                updateOp = {
                    $push: {likes: req.session.user.username}
                };
            }

            db.posts.update({_id: mongo.helper.toObjectID(req.params.id)}, updateOp, function(err){
                if(err){
                    res.status(400).send();
                }
                else{
                    res.status(200).send();
                }
            });
        }
    });
});

router.put('/dislikePost/:id', function(req, res){
    var updateOp = {};

    db.posts.findOne({_id: mongo.helper.toObjectID(req.params.id)}, function(err, aPost){
        if(err){
            res.status(400).send();
        }
        //check if the user has already either liked or disliked the post
        else{
            if(aPost.dislikes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {dislikes: req.session.user.username}
                };
            }
            else if(aPost.likes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {likes: req.session.user.username},
                    $push: {dislikes: req.session.user.username}
                }
            }
            else{
                updateOp = {
                    $push: {dislikes: req.session.user.username}
                };
            }

            db.posts.update({_id: mongo.helper.toObjectID(req.params.id)}, updateOp, function(err){
                if(err){
                    res.status(400).send();
                }
                else{
                    res.status(200).send();
                }
            });
        }
    });

});

module.exports = router;