'user strict';

var knex = require('knex')({
  client: 'pg',
  connection: {
    database: process.env.DB_365BPM_DB,
    user:     process.env.DB_365BPM_USER,
    password: process.env.DB_365BPM_PWD
  }
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports = {

  User : bookshelf.model('User',{ 
    tableName   : 'users',
    playlists   : function(){ return this.hasMany(this['Playlist']) },
    entries     : function(){ return this.hasMany(this['Entry']) }
  }),

  Playlist : bookshelf.model('Playlist',{ 
    tableName   : 'playlists',
    user        : function(){ return this.belongsTo(this['User']) },
    songs       : function(){ return this.hasMany(this['Song']) }
  }),

  Artist : bookshelf.model('Artist',{ 
    tableName   : 'artists',
    songs       : function(){ return this.hasMany(this['Song']) }
  }),

  Song : bookshelf.model('Song',{ 
    tableName   : 'songs',
    artists     : function(){ return this.hasMany(this['Artist']) },
    playlists   : function(){ return this.belongsToMany(this['Playlist'], 'song_id') }
  }),

  Artists_Songs : bookshelf.model('Artists_Songs',{ 
    tableName   : 'artists_songs'
  }),

  Playlists_Songs : bookshelf.model('Playlist_Songs',{ 
    tableName   : 'playlists_songs',
  }),

  Entry : bookshelf.model('Entry',{ 
    tableName   : 'entries',
    song        : function(){ return this.hasOne(this['Song'], 'song_id') },
    artist      : function(){ return this.hasOne(this['Artist']).through(this['Song'], 'song_id') },
    user        : function(){ return this.hasOne(this['User']).through(this['Playlist'], 'user_id') },
    playlist    : function(){ return this.belongsTo(this['Playlist'], 'playlist_id') }
  }),

  Playlists : bookshelf.Collection.extend({
    model: this['Playlist']
  }),

  Songs : bookshelf.Collection.extend({
    model: this['Song']
  }),

  Artists : bookshelf.Collection.extend({
    model: this['Artist']
  }),

  Entries : bookshelf.Collection.extend({
    model: this['Entry']
  })

};
