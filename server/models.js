'user strict';

var knex = require('knex')({
  client: 'postgres',
  connection: process.env.DATABASE_URL + '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory'
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

console.log('connected to database', process.env.DATABASE_URL);

  var User = bookshelf.model('User',{ 
    tableName   : 'users',
    hasTimestamps: true,
    playlists   : function(){ return this.hasMany(Playlist) },
    entries     : function(){ return this.hasMany(Entry) }
  });

  var Playlist = bookshelf.model('Playlist',{ 
    tableName   : 'playlists',
    hasTimestamps: true,
    user        : function(){ return this.belongsTo(User) },
    songs       : function(){ return this.belongsToMany(Song).through('playlists_songs', 'playlists_id', 'songs_id') }
  });

  var Artist = bookshelf.model('Artist',{ 
    tableName   : 'artists',
    songs       : function(){ return this.belongsToMany(Song).through('artists_songs', 'artists_id', 'songs_id') }
  });

  var Song = bookshelf.model('Song',{ 
    tableName   : 'songs',
    artists     : function(){ return this.belongsToMany(Artist).through('Artist_Song', 'artists_id', 'songs_id') },
    playlists   : function(){ return this.belongsToMany(Playlist).through('Playlist_Song', 'playlists_id', 'songs_id') }
  });

  var Entry = bookshelf.model('Entry',{ 
    tableName   : 'entries',
    hasTimestamps: true,
    song        : function(){ return this.hasOne(Song, 'song_id') },
    artist      : function(){ return this.hasMany(Artist).through(Song, 'song_id') },
    user        : function(){ return this.hasOne(User).through(Playlist, 'user_id') },
    playlist    : function(){ return this.belongsTo(Playlist, 'playlist_id') }
  });

  var Artist_Song = bookshelf.model('artists_songs',{
    tableName: 'artists_songs',
    artists     : function () { return this.hasMany('Artist') },
    songs       : function () { return this.hasMany('Song') }
  });

  var Playlist_Song = bookshelf.model('playlists_songs',{
    tableName: 'playlists_songs',
    playlists   : function () { return this.hasMany('Playlist') },
    songs       : function () { return this.hasMany('Song') }
  });

module.exports = {
  users          : User,
  playlists      : Playlist,
  artists        : Artist,
  songs          : Song,
  entries        : Entry,
  artists_songs  : Artist_Song,
  playlists_songs: Playlist_Song,
};
