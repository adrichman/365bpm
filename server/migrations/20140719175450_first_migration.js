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
      t.string('users_id').references('id').inTable('users');
      t.string('entries_id').references('id').inTable('entries');
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
      t.string('artists_id').references('id').inTable('artists');
      t.string('songs_id').references('id').inTable('songs');
      t.primary(['artists_id', 'songs_id']);
    }),

    knex.schema.createTable('entries', function(t){
      t.increments('id').primary();
      t.string('title');
      t.text('body', 'longtext');
      t.string('users_id').references('id').inTable('users');
      t.string('songs_id').references('id').inTable('songs');
      t.string('playlists_id').references('id').inTable('playlists');
      t.timestamps();
    }),
    
    knex.schema.createTable('playlists_songs', function(t){
      t.string('playlists_id').references('id').inTable('playlists');
      t.string('songs_id').references('id').inTable('songs');
      t.primary(['playlists_id','song_id']);
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