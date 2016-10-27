// app.js 
'use strict'; 
var express = require('express'); 
var app = express(); 
module.exports = app; 

var swig = require('swig'); 
var http = require('http'); 
var bodyParser = require('body-parser'); 
var morgan = require('morgan');

var path = require('path');
var port = 3000; 

var models = require('./models'); 
var Page = models.Page;
var User = models.User; 
var wikiRouter = require('./routes/wiki'); 
var usersRouter = require('./routes/users'); 
 
// Body Parsing Middlewre 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// wikiRouter 
app.use('/wiki', wikiRouter); 
app.use('/users', usersRouter); 

app.get('/', function(req, res){
	res.render('index'); 
});

// Swig template set-up
app.engine('html', swig.renderFile);
swig.setDefaults({ cache: false });
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Morgan 
app.use(morgan('dev')); 


// Express Static
app.use(express.static(__dirname + 'node_modules')); 
app.use(express.static(__dirname + '/public' )); 

// Error-handling middleware 
app.use(function(err, req, res, next){
	console.error(err); 
	res.status(500).send(err.message); 
}); 


User.sync()
.then(function(){
	return Page.sync(); 
})
.then(function(){
	app.listen(3000, function(){
		console.log('Server is listening on port ' + port); 
	}); 
}); 


