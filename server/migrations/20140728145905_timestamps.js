'use strict';

exports.up = function(knex, Promise) {
  knex.schema.table('artists', function(t){
    t.timestamps();
  }),
  knex.schema.table('songs', function(t){
    t.timestamps();
  }),
  knex.schema.table('artists_songs', function(t){
    t.timestamps();
  }),
  knex.schema.table('playlists_songs', function(t){
    t.timestamps();
  })
};

exports.down = function(knex, Promise) {
  knex.schema.table('artists', function(t){
    t.dropColumn('timestamps');
  }),
  knex.schema.table('songs', function(t){
    t.dropColumn('timestamps');
  }),
  knex.schema.table('artists_songs', function(t){
    t.dropColumn('timestamps');
  }),
  knex.schema.table('playlists_songs', function(t){
    t.dropColumn('timestamps');
  })
};
