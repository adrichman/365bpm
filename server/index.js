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

//////////////////////////////////////////////
// cookie and session middleware            //
//////////////////////////////////////////////
// app.use(cookieParser());
// app.use(cookieSession({ secret: secretKey, cookie: { maxAge: 60 * 60 * 1000 }}));
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());


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
// apiId: beatsClientId
// auth_flow:auth_code
// authorization_code:pcytug8wxc5z2cmekkbucbt5,
var formBeatsTokenReq = function(beatsCode){
  return  { params :  
            { 
              client_secret :  beatsSecret,
              client_id     :  beatsClientId,
              redirect_uri  :  'http://beats-365bpm.herokuapp.com/home',
              code          :  beatsCode,
              grant_type    :  'authorization_code'
            }
          }
};

app.post('/api/v1/sync', function(req, res){ 
console.log(req); 
  var currentUser = JSON.parse(req.body.data.currentUser);
  var userData = JSON.parse(req.body.data.userData);
  var playlists = req.body.data.playlists;
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
      res.send(arguments)
    })

    var Playlist = new db.playlists();

    playlists.forEach(function(playlist){
      playlist = JSON.parse(playlist);
      Playlist.fetch({ id : playlist.id }).then(function(data){
        if (!data){
          var params =  {
                          id : playlist.id,
                          name: playlist.name,
                          users_id: playlist.refs.author.id
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
        res.send(arguments)
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
  
  var params = {};
  params[req.params.model + '_id'] = req.params.id;
  
  model.where(params).fetchAll().then(function(data){
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
app.patch('/api/v1/:model/:id/entries/:entry_id', function(req,res){
  console.log(req.body, req.query);
  var model = new db['entries']();
  model.where({ id: req.params.entry_id }).save(req.body ,{ method: 'update'} ).then(function(db_response){
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
    var beatsCode = req.query.code;
    console.log('BEATS CODE', beatsCode);

    // var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token?client_secret=' + beatsSecret +'&client_id=' + beatsClientId +'&redirect_uri=http://www.fakehost.com:8000/home&code='+ beatsCode + '&grant_type=authorization_code';
    // var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token?apiId=eunjtjg4755smmz8q942e9kp&auth_flow=auth_code&authorization_code=' + beatsCode;
    // var tokenRequestParams = formBeatsTokenReq(beatsCode);
    var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token'
    // console.log("tokenRequestURI", tokenRequestURI, "tokenRequestParams", tokenRequestParams);
    
    // request.post(tokenRequestURI, function(err, httpResponse, body){
    request.post(tokenRequestURI, function(err, httpResponse, body){
      // console.log(err, httpResponse, body);
      res.send(body);
    }).form({
      client_id: beatsClientId,
      client_secret: beatsSecret,
      redirect_uri: 'http://www.google.com',
      code: beatsCode
    });
  }
});

app.get('/scripts/*', function(req, res){
  res.sendfile(path.resolve(__dirname + '/../app' + req.url));
});
app.get('/bower_components/*', function(req, res){
  res.sendfile(path.resolve(__dirname + '/../app' + req.url));
});
app.use(express.static(__dirname + "/../app"));

app.get('/*', function(req, res){
  res.sendfile(path.resolve(__dirname + '/../app/index.html'));
});