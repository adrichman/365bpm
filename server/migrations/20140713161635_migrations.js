'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(t) {
    t.increments('id').primary();
    t.string('username');
    t.string('beats_token');
    t.string('rdio_token');
    t.dateTime('created_at').notNull();
    t.dateTime('updated_at').nullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};