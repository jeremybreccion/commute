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

module.exports = router;