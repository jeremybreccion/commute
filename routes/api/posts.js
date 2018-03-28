var express = require('express');
var router = express.Router();
var config = require('../../config/config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.database.name, { native_parser: true });
db.bind(config.database.collections.posts);

router.post('/add', function(req, res, next){
    db.posts.insert(req.body, function(err){
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
router.post('/getPosts', function(req, res, next){
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

module.exports = router;