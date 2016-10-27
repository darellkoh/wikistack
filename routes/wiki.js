// routes/wiki.js
'use strict';
var express = require('express');
var wikiRouter = express.Router();
module.exports = wikiRouter;
var models = require('../models');
var Page = models.Page;
var User = models.User;

//GET /wiki/
wikiRouter.get('/', function(req, res, next) {
    Page.findAll({})
        .then(function(pages) {
            res.render('index', {
                pages: pages
            });
        })
        .catch(next);
});


//POST /wiki/
wikiRouter.post('/', function(req, res, next) {

            User.findOrCreate({
                    where: {
                        email: req.body.authorEmail,
                        name: req.body.authorName
                    }
                })
                .spread(function(user, wasCreatedBool) {
                    return Page.create({
                            title: req.body.title,
                            content: req.body.content,
                            status: req.body.status
                        })
                        .then(function(createdPage) {
                            return createdPage.setAuthor(user);
                        });
                })
                .then(function(createdPage) {
                    res.redirect(createdPage.route);
                })
                .catch(next);


            // GET /wiki/add
            wikiRouter.get('/add/', function(req, res, next) {
                res.render('addpage');
            });

            // // GET /wiki/:urlTitle
            wikiRouter.get('/:urlTitle', function(req, res, next) {

                Page.findOne({
                        where: {
                            urlTitle: req.params.urlTitle
                        },
                        include: [
                            { model: User, as: 'author' }
                        ]
                    })
                    .then(function(page) {
                        if (page === null) {
                            res.status(404).send();
                        } else {
                            res.render('wikipage', {
                                page: page
                            });
                        }
                    })
                    .catch(next);
            });


            wikiRouter.get('/search/:tag', function(req, res, next) {
                Page.findByTag(req.params.tag)
                    .then(function(pages) {
                        res.render('index', {
                            pages: pages
                        });
                    })
                    .catch(next);
            });


            wikiRouter.get('/:urlTitle/similar', function(req, res, next) {
                Page.findOne({
                        where: {
                            urlTitle: req.params.urlTitle
                        }
                    })
                    .then(function(page) {
                        if (page === null) {
                            return next(new Error("That page does not exist"));
                        }
                        return page.findSimilar();
                    })
                    .then(function(similarPages) {
                        res.render('index', {
                            pages: similarPages
                        });
                    })
                    .catch(next);
            });
