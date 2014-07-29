'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.hasTable('playlists', function(exists){
      if (exists){
        knex.schema.table('playlists', function(){
          t.string('songs_id').references('id').inTable('songs');
        })
      }
    })
};

exports.down = function(knex, Promise) {
  knex.schema.table('playlists', function(t){
    t.dropColumn('songs_id');
  })
};
