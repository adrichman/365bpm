'use strict';

var express         = require('express'),
    request         = require('request'),
    flash           = require('connect-flash'),
    cookieParser    = require('cookie-parser'),
    cookieSession   = require('cookie-session'),
    bodyParser      = require('body-parser'),
    csrf            = require('csurf'),
    helmet          = require('helmet'),
    helpers         = require('./helpers'),
    port            = process.env.PORT || 8000,
    beatsSecret     = process.env.BEATS_SWITCHR_SECRET,
    rdioSecret      = process.env.RDIO_SWITCHR_SECRET,
    env             = process.env.NODE_ENV || 'development',
    path            = require('path'),
    secretKey       = 'plantlife',
    app             = exports.app = express();

//////////////////////////////////////////////
// Start Me Up                              //
//////////////////////////////////////////////
app.listen(port);
console.log('Server listening on port: ' + port);

//////////////////////////////////////////////
// Fake DB                                  //
//////////////////////////////////////////////
// app.fakeDb = helpers.fakeDb;
app.cookieSession = cookieSession;

//////////////////////////////////////////////
// express logging, content security policy //
//////////////////////////////////////////////
// app.use(morgan({ format: 'dev', immediate: true }));
app.use(helpers.cors);
app.use(helmet());

//////////////////////////////////////////////
// cookie and session middleware            //
//////////////////////////////////////////////
app.use(cookieParser());
app.use(cookieSession({ secret: secretKey, cookie: { maxAge: 60 * 60 * 1000 }}));
app.use(bodyParser());


//////////////////////////////////////////////
// Passport Authentication Middleware       //
//////////////////////////////////////////////
// require('./passportPolicy.js')(app, passport);
// app.use(passport.initialize());
// app.use(passport.session());

//////////////////////////////////////////////
// CSRF middleware                          //
//////////////////////////////////////////////
app.use(csrf());
app.use(function(req, res, next){
  res.locals.token = req.session._csrf || req.csrfToken();
  next();
});
//////////////////////////////////////////////
// Error handling                           //
//////////////////////////////////////////////
// app.use(flash());
// app.use(function(req, res, next) {
//   res.locals.messages = req.session.messages
//   next();
// })
// app.use(function(err, req, res, next) {
//     if(!err) { return next(); }
    
//     // log out users that have received an authentication error
//     if (err.status === 403 && req.user) { 
//       // app.fakeDb.users[req.user.id].loggedIn = false; 
//     }
//     // res.render('_error', { error : err });
// });

//////////////////////////////////////////////
// serve static assets and route handlers   //
//////////////////////////////////////////////
var formBeatsTokenReq = function(beatsCode){
  return  { params :  
            {
              client_secret :  beatsSecret,
              client_id     :  'eunjtjg4755smmz8q942e9kp',
              redirect_uri  :  'http://www.fakehost.com:8000/home',
              code          :  beatsCode,
              grant_type    :  'authorization_code'
            }
          }
};
var formRdioTokenReq = function(rdioCode){
  return  { params :  
            {
              client_secret :  beatsSecret,
              client_id     :  'eunjtjg4755smmz8q942e9kp',
              redirect_uri  :  'http://www.fakehost.com:8000/home',
              code          :  rdioCode,
              grant_type    :  'authorization_code'
            }
          }
};

app.get('/beats', function(req, res){
  if (req.query && req.query.code) {
    console.log(req.query);
    var beatsCode = req.query.code;
    var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token?client_secret=' + beatsSecret +'&client_id=eunjtjg4755smmz8q942e9kp&redirect_uri=http://www.fakehost.com:8000/home&code='+ beatsCode + '&grant_type=authorization_code';
    var tokenRequestParams = formRdioTokenReq(beatsCode);
    console.log("tokenRequestURI", tokenRequestURI, "tokenRequestParams", tokenRequestParams);
    request.post(tokenRequestURI, function(err, httpResponse, body){
      console.log(err, httpResponse, body);
      res.send(body);
    })
  }
});

// app.get('/rdio', function(req, res){
//   if (req.query && req.query.code) {
//     console.log(req.query);
//     var rdioCode = req.query.code;
//     var tokenRequestParams = formBeatsTokenReq(rdioCode);
//     request.post('https://partner.api.beatsmusic.com/oauth2/token', tokenRequestParams, function(err, httpResponse, body){
//       console.log('1', httpResponse);
//       res.send(body);
//     })
//   }
// });

app.use(express.static(path.resolve(__dirname + '/../app/')));

app.get('*', function(req, res){
  if (req.query) {
    console.log('query', req.query);
  }
  res.sendfile(path.resolve(__dirname + '/../app/index.html'));
});