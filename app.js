var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var mongoose = require('mongoose');
var config = require('./config/database');
var users = require('./routes/users');

mongoose.connect(config.database);

mongoose.connection.on('connected', function () {
	console.log('Connected to database ' + config.database);
});

mongoose.connection.on('error', function (err) {
	console.log('Database error ' + err);
});

var app = express();
app.use(cors());

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session()); 
require('./config/passport')(passport);

app.use('/users', users);

// server listener
module.exports = app;