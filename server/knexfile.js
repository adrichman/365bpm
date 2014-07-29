// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DATABASE_URL + '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory',
      user: '',
      password: ''
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
      database: process.env.DATABASE_URL + '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory',
      user: '',
      password: ''
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
      database: process.env.DATABASE_URL + '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory',
      user: '',
      password: ''
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