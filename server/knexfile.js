// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_365BPM_DB,
      user:     process.env.DB_365BPM_USER,
      password: process.env.DB_365BPM_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_365BPM_DB,
      user:     process.env.DB_365BPM_USER,
      password: process.env.DB_365BPM_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_365BPM_DB,
      user:     process.env.DB_365BPM_USER,
      password: process.env.DB_365BPM_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }

};