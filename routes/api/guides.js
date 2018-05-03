var express = require('express');
var router = express.Router();
var config = require('../../config/config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.database.name, { native_parser: true });
db.bind(config.database.collections.posts);

var ObjectID = require('mongodb').ObjectID;

router.post('/add', function(req, res, next){
    var addedPost = req.body;

    //likes, dislikes, & comments are list of users
    addedPost.likes = [];
    addedPost.dislikes = [];
    //supposedly array of objects
    addedPost.comments = [];

    addedPost.posted_by = req.session.user.username;

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
router.post('/search', function(req, res, next){
    //{ title: {from: req.params.from, to: req.params.to}} does not work
    //use regex for wildcard searches
    
    db.posts.find({'title.from': {$regex: new RegExp(req.body.from, "i")}, 'title.to': {$regex: new RegExp(req.body.to, "i")}}).toArray(function(err, posts){
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

//for everyone's use
router.post('/view', function(req, res, next){
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

router.put('/update', function(req, res){
    db.posts.update({_id: mongo.helper.toObjectID(req.body._id)}, {$set: {title: req.body.title, steps: req.body.steps}}, function(err, writeResult){
        if(err){
            res.status(400).send();
        }
        else if(writeResult.result.nModified == 0){
            res.status(400).send();
        }
        else{
            res.status(200).send({message: 'Post successfully updated'});
        }
    });
});

router.delete('/delete/:id', function(req, res){
    db.posts.remove({_id: mongo.helper.toObjectID(req.params.id)}, function(err, writeResult){
        if(err){
            res.status(400).send();
        }
        else if(writeResult.result.n == 0){
            res.status(400).send();
        }
        else{
            res.status(200).send({message: 'Post successfully deleted'});
        }
    });
});

router.put('/like/:id', function(req, res){
    var updateOp = {};

    db.posts.findOne({_id: mongo.helper.toObjectID(req.params.id)}, function(err, post){
        if(err){
            res.status(400).send();
        }
        //check if the user has already either liked or disliked the post
        else if(post){
            if(post.likes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {likes: req.session.user.username}
                };
            }
            else if(post.dislikes.indexOf(req.session.user.username) != -1){
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

            db.posts.update({_id: mongo.helper.toObjectID(req.params.id)}, updateOp, function(err, writeResult){
                if(err){
                    res.status(400).send();
                }
                else if(writeResult.result.nModified == 0){
                    res.status(400).send();
                }
                else{
                    res.status(200).send();
                }
            });
        }
        else{
            res.status(400).send({message: 'Cannot find that particular guide'});
        }
    });
});

router.put('/dislike/:id', function(req, res){
    var updateOp = {};

    db.posts.findOne({_id: mongo.helper.toObjectID(req.params.id)}, function(err, post){
        if(err){
            res.status(400).send();
        }
        //check if the user has already either liked or disliked the post
        else if(post){
            if(post.dislikes.indexOf(req.session.user.username) != -1){
                updateOp = {
                    $pull: {dislikes: req.session.user.username}
                };
            }
            else if(post.likes.indexOf(req.session.user.username) != -1){
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

            db.posts.update({_id: mongo.helper.toObjectID(req.params.id)}, updateOp, function(err, writeResult){
                if(err){
                    res.status(400).send();
                }
                else if(writeResult.result.nModified == 0){
                    res.status(400).send();
                }
                else{
                    res.status(200).send();
                }
            });
        }
        else{
            res.status(400).send({message: 'Cannot find that particular guide'});
        }
    });
});

//angular variables are guideID, comment.text, & comment.date (yyyy-MM-dd HH:mm format)
router.put('/comment', function(req, res){
    var commentBody = req.body;
    commentBody.comment.commented_by = req.session.user.username;
    //create an ID for uniquely identifying each comment (for future use)
    commentBody.comment.id = new ObjectID();

    db.posts.update({_id: mongo.helper.toObjectID(req.body.guideID)}, {$push: {comments: commentBody.comment}}, function(err, writeResult){
        if(err){
            console.log(err);
            res.status(400).send();
        }
        else if(writeResult.result.nModified == 0){
            console.log('oireoir')
            res.status(400).send();
        }
        else{
            res.status(200).send();
        }
    });
});

router.put('/deleteComment/:id', function(req, res){
    db.posts.update({comments: {$elemMatch: {id: mongo.helper.toObjectID(req.params.id)}}}, {$pull: {comments: {id: mongo.helper.toObjectID(req.params.id)}}}, function(err, writeResult){
        if(err){
            res.status(400).send();
        }
        else if(writeResult.result.nModified == 0){
            res.status(400).send();
        }
        else{
            res.status(200).send();
        }
    });
});

router.get('/posted', function(req, res){
    db.posts.find({posted_by: req.session.user.username}).toArray(function(err, posts){
        if(err){
            res.status(400).send();
        }
        else{
            res.status(200).send(posts);
        }
    });
});

module.exports = router;