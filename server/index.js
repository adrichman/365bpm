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
    db              = require('./models.js'),
    port            = process.env.PORT || 8000,
    beatsSecret     = process.env.BEATS_SWITCHR_SECRET,
    beatsClientId   = process.env.BEATS_SWITCHR_CLIENT_ID,
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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//////////////////////////////////////////////
// Passport Authentication Middleware       //
//////////////////////////////////////////////
// require('./passportPolicy.js')(app, passport);
// app.use(passport.initialize());
// app.use(passport.session());

//////////////////////////////////////////////
// CSRF middleware                          //
//////////////////////////////////////////////
// app.use(csrf());
// app.use(function(req, res, next){
  // res.locals.token = req.session._csrf || req.csrfToken();
  // next();
// });
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
              client_id     :  beatsClientId,
              redirect_uri  :  'http://www.fakehost.com:8000/home',
              code          :  beatsCode,
              grant_type    :  'authorization_code'
            }
          }
};

app.post('/api/v1/sync', function(req, res){  
  var currentUser = JSON.parse(req.query.currentUser);
  var userData = JSON.parse(req.query.userData);
  var playlists = req.query.playlists;
  if (userData.id !== undefined) {
    var User = new db.User();
    User.fetch({ id :userData.id })
    .then(function(data){
      if (!data) {
        var params = {
          id : userData.id,
          name: userData['full_name'],
          username: userData.username,
          email: 'fake@fakehost.com',
          last_login: new Date().toISOString(),
          beats_token: currentUser.expires
        };

        User.save(params ,{ method: 'insert'} ).then(function(db_response){
          console.log('db_response',arguments);
          res.send(db_response)
        });
      }
       else {
        res.send('got it already');
      }
    })
    .catch(function(){
      console.log('catch',arguments);
      res.send(arguments);
    })
    // .finally(function(){
      var Playlist = new db.Playlist();

      playlists.forEach(function(playlist){
        Playlist.fetch({ id : playlist.id }).then(function(data){
          playlist = JSON.parse(playlist);
          if (!data){
            var params = {
              id : playlist.id,
              name: playlist.name,
              user_id: playlist.refs.author.id
            };
            Playlist.save(params, { method: 'insert' }).then(function(db_response){
              console.log('db_playlist_response', db_response);
            });
          }
          
          var Song = new db.Song();
          playlist.refs.tracks.forEach(function(track){
            Song.fetch({ id : track.id }).then(function(data){
              if (!data){
                var params = {
                  id : track.id,
                  title : track.display
                }
                Song.save(params, { method: 'insert' }).then(function(db_response){
                  console.log('db_song_response', db_response);
                });
              }
            })
          })
        })
        .catch(function(){
          console.log('catch',arguments);
        })
      })
    // })
  }
});

app.get('/api/v1/:model/:id', function(req,res){

  if (req.params.id !== undefined) {
    var model = new Model(req.params.model);

    model.fetch(req.params.id).then(function(data){
      res.json(data);
    })

  } else if (req.params.model){
    
    db[req.params.model].fetchAll().then(function(data){
      console.log(data.models);
      res.json(data.models);
    })

  }
});

app.get('/beats', function(req, res){
  if (req.query && req.query.code) {
    console.log(req.query);
    var beatsCode = req.query.code;
    var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token?client_secret=' + beatsSecret +'&client_id=' + beatsClientId +'&redirect_uri=http://www.fakehost.com:8000/home&code='+ beatsCode + '&grant_type=authorization_code';
    var tokenRequestParams = formRdioTokenReq(beatsCode);
    console.log("tokenRequestURI", tokenRequestURI, "tokenRequestParams", tokenRequestParams);
    request.post(tokenRequestURI, function(err, httpResponse, body){
      console.log(err, httpResponse, body);
      res.send(body);
    })
  }
});

app.use(express.static(path.resolve(__dirname + '/../app/')));

app.get('*', function(req, res){
  res.sendfile(path.resolve(__dirname + '/../app/index.html'));
});