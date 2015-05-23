var express = require('express');
var session = require('express-session');
var passport = require('passport');
var uberStrategy = require('passport-uber');
var request = require('request');
var app = express();

// environment variables: do not share, store, or commit the actual values!
var clientID = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var sessionSecret = process.env.SESSION_SECRET;

app.use(session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/client'));
app.set('views', __dirname + '/client/views');
app.set('view engine','ejs');

// to support persistent login sessions, passport needs to be able to serialize users into and deserialize users out of the session. this will show up in every request object
passport.serializeUser(function (user, done){
	console.log('----------------serialize----------------');
	done(null, user);
});
passport.deserializeUser(function (user, done){
	console.log('----------------deserialize----------------');
	done(null, user);
});

// use uberStrategy within passport. passport strategies require a 'verify' callback which accepts OAuth 2.0 tokens and calls done providing a user, as well as options specifying a consumerKey, consumerSecret, and callback URL
passport.use(new uberStrategy({
		clientID: clientID,
		clientSecret: clientSecret,
		callbackURL: 'http://localhost:5000/auth/uber/callback'
	},
	function (accessToken, refreshToken, user, done) {
		console.log(user.first_name, user.last_name, 'logged in to your app');
		console.log('access token:', accessToken);
		console.log('refresh token:', refreshToken);

		/*

			Write your own database logic here. User.findOne() and, if none, create and save.

		 */

		 // Save the accessToken for user-specific (and authorized) requests
		 user.accessToken = accessToken;

		return done(null, user);
	}
));

// landing page for unauthorized users
app.get('/login', function (request, response) {
	response.render('login');
});

// use passport.authenticate() as route middleware to authenticate the request by first redirecting to Uber
app.get('/auth/uber',
	passport.authenticate('uber',
		{ scope: ['profile', 'history', 'history_lite', 'request', 'request_receipt']
		}
	)
);

// if authentication fails, redirect home. otherwise, direct to app.get '/login'
app.get('/auth/uber/callback',
	passport.authenticate('uber', {
		successRedirect: '/',
		failureRedirect: '/login'
	})
);

// authenticated view
app.get('/', ensureAuthenticated, function (request, response) {
	response.render('index');
});

// profile request (example of secure API call for endpoint)
app.get('/profile', ensureAuthenticated, function (request, response) {
	getRequest('https://api.uber.com/v1/me', request.user.accessToken, function (error, res) {
		if (error) { console.log(error); }
		response.json(JSON.parse(res));
	});
});

// history request (example of secure API call for endpoint)
app.get('/history', ensureAuthenticated, function (request, response) {
	getRequest('https://api.uber.com/v1.2/history', request.user.accessToken, function (error, res) {
		if (error) { console.log(error); }
		response.json(JSON.parse(res));
	});
});

// ride request (example of secure API call for endpoint)
app.get('/request', ensureAuthenticated, function (request, response) {
	// NOTE! Keep in mind that, although this link is a GET request, the actual ride request must be a POST, as shown below
	var parameters = {
		start_latitude : "37.334381",
		start_longitude: "-121.89432",
		end_latitude: "37.77703",
		end_longitude: "-122.419571",
		product_id: "a1111c8c-c720-46c3-8534-2fcdd730040d"
	};

	postRequest('https://sandbox-api.uber.com/v1/requests', request.user.accessToken, parameters, function (error, res) {
		if (error) { console.log(error); }
		response.json(res);
	});
});

// logout
app.get('/logout', function (request, response) {
	request.logout();
	response.redirect('/login');
});

//	Use this route middleware on any resource that needs to be protected. authenticated via a persistent login session
function ensureAuthenticated (request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	response.redirect('/login');
}

// Use this function in order to send https GET requests with correct authorization using the accessToken. Keep in mind that any routes using this function should use ensureAuthenticated first. On the callback function, we also use JSON.parse() since the body payload is a string
function getRequest(endpointURL, accessToken, actionCallback) {
	var sendRequest = request.get({
		url: endpointURL,
		headers: {
			Authorization: 'Bearer ' + accessToken
		}
	},
	function (error, response, body){
		if (error) {
			actionCallback('error from endpoint GET ' + endpointURL + ' => ' + error);
		} else {
			actionCallback(null, body);
		}
	});
}

// Use this function in order to send https POST requests with parameters in JSON format and correct authorization using the accessToken. Keep in mind that any routes using this function should use ensureAuthenticated first. The callback function does not requres JSON.parse() since the body payload is JSON
function postRequest(endpointURL, accessToken, parameters, actionCallback) {
	var sendRequest = request.post({
		url: endpointURL,
		headers: {
			Authorization: 'Bearer ' + accessToken,
			'Content-Type': 'application/json'
		},
		json: parameters
	},
	function (error, response, body){
		if (error) {
			actionCallback('error from endpoint POST ' + endpointURL + ' => ' + error);
		} else {
			actionCallback(null, body);
		}
	});
}

// set port and start server
var port = process.env.PORT || 5000;
var server = app.listen(port, function(){
	console.log('listening to port:', port);
});