'use strict';

var express         = require('express'),
    request         = require('request'),
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
// express logging, content security policy //
//////////////////////////////////////////////
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
//   res.locals.token = req.session._csrf || req.csrfToken();
//   next();
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
    var User = new db.users();
    User.fetch({ id :userData.id })
    .then(function(data){
      if (!data) {
        var params =  {
                        id : userData.id,
                        name: userData['full_name'],
                        username: userData.username,
                        email: 'fake@fakehost.com',
                        last_login: new Date().toISOString(),
                        beats_token: currentUser.expires
                      };

        User.save(params ,{ method: 'insert'} ).then(function(db_response){
          res.send(db_response)
        });
      } else {
        res.send('got it already');
      }
    })
    .catch(function(){
      console.log('catch',arguments);
    })

    var Playlist = new db.playlists();

    playlists.forEach(function(playlist){
      playlist = JSON.parse(playlist);
      Playlist.fetch({ id : playlist.id }).then(function(data){
        if (!data){
          var params =  {
                          id : playlist.id,
                          name: playlist.name,
                          user_id: playlist.refs.author.id
                        };

          Playlist.save(params, { method: 'insert' }).then(function(db_response){
            console.log('db_playlist_response', db_response);
          });
        }
        
        var Song = new db.songs();
        playlist.refs.tracks.forEach(function(track){
          Song.fetch({ id : track.id }).then(function(data){
            if (!data){
              var params =  {
                              id : track.id,
                              title : track.display
                            };

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
  }
});

app.get('/api/v1/:model', function(req,res){
  console.log(req.query);
  var model = new db[req.params.model.toLowerCase()]();
  model.fetchAll().then(function(data){
    console.log(data.models);
    res.json(data.models);
  })
});
app.get('/api/v1/:model/:id', function(req,res){
  console.log(req.params);
  var model = new db[req.params.model.toLowerCase()]();
  model.where({ id : req.params.id }).fetch().then(function(data){
    res.json(data);
  })
});
app.get('/api/v1/:model/:id/entries', function(req,res){
  console.log(req.params);
  var model = new db['entries']();
  model.where({ user_id : req.params.id }).fetchAll().then(function(data){
    res.json(data);
  })
});
app.post('/api/v1/:model/:id/entries', function(req,res){
  console.log(req.body, req.query);
  var model = new db['entries']();
  model.save(req.body ,{ method: 'insert'} ).then(function(db_response){
    res.send(db_response)
  });
});
app.get('/api/v1/:model/:id/entries/:entry_id', function(req,res){
  console.log(req.body);
  var model = new db['entries']();
  model.fetch({ id : req.body.entry_id }).then(function(data){
    res.json(data);
  })
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