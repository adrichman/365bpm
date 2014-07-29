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
    Promise         = require('bluebird'),
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

var syncPlaylists = function(playlistSongs, promises, playlists, cb){
  var count = 0;
  var playlistModels = [];
  var promises = [];
  var savePromises = [];
  var playlistsHash = {};
  playlists.forEach(function(playlist){
    var Playlist = new db.playlists({ id : playlist.id });
    playlistsHash[playlist.id] = playlist;
    Playlist.fetch().then(function(model){
      var method = 'insert';
      console.log('return data from playist fetch', model);
      var params =  {
        id : playlist.id,
        name: playlist.name,
        users_id: playlist.refs.author.id
      };
      if (model && model.id){
        method = 'update';
      }
      count++
      var Playlist = new db.playlists({ id : playlist.id });
      savePromises.push(Playlist.save(params, { method: method }));
      if (count === playlists.length){
        Promise.all(savePromises).then(function(models){
          syncSongs(playlist.refs.tracks, playlistSongs, function(playlistSongs){
            var playlistCount = 0;
            playlists.forEach(function(playlist){
              var Playlist = new db.playlists();
              Playlist.fetch({ id : playlist.id }).then(function(model){
                model.songs().attach(playlistSongs).then(function(model){      
                  playlistCount++;
                  if (playlistCount >= playlists.length) {
                    cb(model, playlistSongs)
                  };
                })
              })
            })
          });
        })
      }
    });
  }) 
};

var syncSongs = function(tracks, playlistSongs, cb){        
  var promises = [];
  var songPromises = [];
  var songsHash = {};
  var count = 0;
  tracks.forEach(function(track){
    // console.log('TRACK ID', track.id, track)
    songsHash[track.id] = track.display;

    var Song = new db.songs();

    Song.fetch({ id : track.id }).then(function(return_song){
      if (return_song){ 
        // console.log('return_song', return_song,songsHash[return_song.attributes.id])
        var song = return_song;
        var method = 'insert';
        var params =  {
          id : return_song.attributes.id,
          title : songsHash[return_song.attributes.id]
        };
        // console.log('SONG ID', song && song.id)
        song && playlistSongs.push(song.id);
        songPromises.push(Song.save(params, { method: 'update' }));
      }

      count++;

      if (tracks.length === count) {
        Promise.all(songPromises).then(function(){
          // console.log('promises', arguments)
          cb(playlistSongs)
        })
      }
    });
  })
}


app.post('/api/v1/sync', function(req, res){
  console.log(req.body.params)
  var currentUser = req.body.params.currentUser;
  var userData = req.body.params.userData;
  var playlists = req.body.params.playlists;
  var playlistSongs = [];
  var promises = [];
  var method = 'insert';

  if (userData.id !== undefined) {
    var User = new db.users({ id :userData.id });
    User.fetch()
    .then(function(user){
      // console.log('fetched user', user);
      method = 'insert';
      if (user && user.id && !user.isNew()) {
        method = 'update';
        console.log('update', user)
      }
      var params =  {
        id : userData.id,
        name: userData['full_name'],
        username: userData.username,
        email: 'fake@fakehost.com',
        last_login: new Date().toISOString(),
        beats_token: currentUser.expires
      };
      return params;
    })
    .then(function(params){
      // console.log('SAVING');
      User.save(params, { method: method })
      .catch(function(){
        // console.log('CATCH', arguments);
      })
      .finally(function(db_response){
        // console.log('user save response', db_response)
        syncPlaylists(playlistSongs, promises, playlists, function(model, playlistSongs){      
          // console.log('saved attach??', arguments);
          res.send(204);
        })
      })
    })
  } else {
    res.send(400);
  }
});

app.get('/api/v1/:model', function(req,res){
  var model = new db[req.params.model.toLowerCase()]();
  model.fetchAll().then(function(data){
    res.json(data.models);
  })
});
app.get('/api/v1/:model/:id', function(req,res){
  var model = new db[req.params.model.toLowerCase()]();
  model.where({ id : req.params.id }).fetch().then(function(data){
    res.json(data);
  })
});
app.get('/api/v1/:model/:id/playlists', function(req,res){
  var model = new db['playlists']();
  
  var params = {};
  params[req.params.model + '_id'] = req.params.id;
  
  model.where(params).fetchAll().then(function(data){
    res.json(data);
  })
});
app.get('/api/v1/:model/:id/songs', function(req,res){
  var model = new db['songs']();
  
  var params = {};
  params[req.params.model + '_id'] = req.params.id;
  
  model.where(params).fetchAll().then(function(data){
    res.json(data);
  })
});
app.get('/api/v1/:model/:id/entries', function(req,res){
  var model = new db['entries']();
  
  var params = {};
  params[req.params.model + '_id'] = req.params.id;
  
  model.where(params).fetchAll().then(function(data){
    res.json(data);
  })
});
app.post('/api/v1/:model/:id/entries', function(req,res){
  console.log(req.body)
  var model = new db['entries']();
  model.save(req.body ,{ method: 'insert'} ).then(function(db_response){
    res.send(db_response)
  });
});
app.patch('/api/v1/:model/:id/entries/:entry_id', function(req,res){
  var model = new db['entries']();
  model.where({ id: req.params.entry_id }).save(req.body ,{ method: 'update'} ).then(function(db_response){
    res.send(db_response)
  });
});
app.get('/api/v1/:model/:id/entries/:entry_id', function(req,res){
  var model = new db['entries']();
  model.fetch({ id : req.body.entry_id }).then(function(data){
    res.json(data);
  })
});

app.get('/beats', function(req, res){
  if (req.query && req.query.code) {
    var beatsCode = req.query.code;
    console.log('BEATS CODE', beatsCode);

    // var tokenRequestURI = 'https://partner.api.beatsmusic.com/oauth2/token?client_secret=' + beatsSecret +'&client_id=' + beatsClientId +'&redirect_uri=http://beats-365bpm.herokuapp.com/home&code='+ beatsCode + '&grant_type=authorization_code';
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