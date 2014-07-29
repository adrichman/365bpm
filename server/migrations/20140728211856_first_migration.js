'use strict';

exports.up = function(knex, Promise) {

  return Promise.all([
    
   knex.schema.hasTable('users', function(exists){ 
      if (!exists){
        knex.schema.createTable('users', function(t){
          t.string('id').primary();
          t.string('name');
          t.string('username');
          t.string('email');
          t.timestamp('last_login');
          t.string('beats_token');
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('playlists', function(exists){
      if (!exists){
        knex.schema.createTable('playlists', function(t){
          t.string('id').primary();
          t.string('name');
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('artists', function(exists){
      if (!exists){
        knex.schema.createTable('artists', function(t){
          t.string('id').primary();
          t.string('name');
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('songs', function(exists){
      if (!exists){
        knex.schema.createTable('songs', function(t){
          t.string('id').primary();
          t.string('title');
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('entries', function(exists){
      if (!exists){
        knex.schema.createTable('entries', function(t){
          t.increments('id').primary();
          t.string('title');
          t.text('body', 'longtext');
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('artists_songs', function(exists){
      if (!exists){
        knex.schema.createTable('artists_songs', function(t){
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('playlists_songs', function(exists){
      if (!exists){
        knex.schema.createTable('users', function(t){
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('entries_playlists', function(exists){
      if (!exists){
        knex.schema.createTable('users', function(t){
          t.timestamps('created_at', 'updated_at');
        })
      }
    }),
    knex.schema.hasTable('entries', function(exists){
      if (exists){
        t.string('playlists_id').references('id').inTable('playlists');
        t.string('users_id').references('id').inTable('users');
        t.string('songs_id').references('id').inTable('songs');
      }
    }),
    knex.schema.hasTable('playlists', function(exists){
      if (exists){
        t.string('users_id').references('id').inTable('users');
        t.string('entries_id').references('id').inTable('entries');
      }
    })
  ])
}
  

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('playlists_songs'),
    knex.schema.dropTable('entries_playlists'),
    knex.schema.dropTable('entries'),
    knex.schema.dropTable('artists_songs'),
    knex.schema.dropTable('songs'),
    knex.schema.dropTable('artists'),
    knex.schema.dropTable('playlists'),
    knex.schema.dropTable('users')
  ])
};
