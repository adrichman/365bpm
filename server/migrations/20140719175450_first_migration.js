'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([ 
    
    knex.schema.createTable('users', function(t) {
      t.string('id').primary();
      t.string('name');
      t.string('username');
      t.string('email');
      t.timestamp('last_login');
      t.string('beats_token');
      t.timestamps();
    }),
    
    knex.schema.createTable('playlists', function(t){
      t.string('id').primary();
      t.string('name');
      t.string('user_id').references('id').inTable('users');
      t.timestamps();
    }),

    knex.schema.createTable('artists', function(t){
      t.string('id').primary();
      t.string('name');
    }),

    knex.schema.createTable('songs', function(t){
      t.string('id').primary();
      t.string('title');
    }),
    
    knex.schema.createTable('artists_songs', function(t){
      t.string('artist_id').references('id').inTable('artists');
      t.string('song_id').references('id').inTable('songs');
      t.primary(['artist_id', 'song_id']);
    }),

    knex.schema.createTable('entries', function(t){
      t.increments('id').primary();
      t.string('title');
      t.text('body', 'longtext');
      t.string('user_id').references('id').inTable('users');
      t.string('song_id').references('id').inTable('songs');
      t.string('playlist_id').references('id').inTable('playlists');
      t.timestamps();
    }),
    
    knex.schema.createTable('playlists_songs', function(t){
      t.string('playlist_id').references('id').inTable('playlists');
      t.string('song_id').references('id').inTable('songs');
      t.primary(['playlist_id','song_id']);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('playlists_songs'),
    knex.schema.dropTable('entries'),
    knex.schema.dropTable('artists_songs'),
    knex.schema.dropTable('songs'),
    knex.schema.dropTable('artists'),
    knex.schema.dropTable('playlists'),
    knex.schema.dropTable('users')
  ])
};