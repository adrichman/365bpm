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

  users : bookshelf.model('User',{ 
    tableName   : 'users',
    playlists   : function(){ return this.hasMany(this['Playlist']) },
    entries     : function(){ return this.hasMany(this['Entry']) }
  }),

  playlists : bookshelf.model('Playlist',{ 
    tableName   : 'playlists',
    user        : function(){ return this.belongsTo(this['User']) },
    songs       : function(){ return this.hasMany(this['Song']) }
  }),

  artists : bookshelf.model('Artist',{ 
    tableName   : 'artists',
    songs       : function(){ return this.hasMany(this['Song']) }
  }),

  songs : bookshelf.model('Song',{ 
    tableName   : 'songs',
    artists     : function(){ return this.hasMany(this['Artist']) },
    playlists   : function(){ return this.belongsToMany(this['Playlist'], 'song_id') }
  }),

  artists_Songs : bookshelf.model('Artists_Songs',{ 
    tableName   : 'artists_songs'
  }),

  playlists_Songs : bookshelf.model('Playlist_Songs',{ 
    tableName   : 'playlists_songs',
  }),

  entries : bookshelf.model('Entry',{ 
    tableName   : 'entries',
    song        : function(){ return this.hasOne(this['Song'], 'song_id') },
    artist      : function(){ return this.hasOne(this['Artist']).through(this['Song'], 'song_id') },
    user        : function(){ return this.hasOne(this['User']).through(this['Playlist'], 'user_id') },
    playlist    : function(){ return this.belongsTo(this['Playlist'], 'playlist_id') }
  })

};
