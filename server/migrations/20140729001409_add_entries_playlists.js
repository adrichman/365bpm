'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.hasTable('entries_playlists', function(exists){
      if (!exists){
        knex.schema.createTable('entries_playlists', function(){
          t.string('entries_id').references('id').inTable('entries');
          t.string('playlists_id').references('id').inTable('playlists');
          t.primary(['entries_id','playlists_id']);
        })
      }
    })
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('entries_playlists', function(t){
  })
};
