const env = process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
module.exports = {
  home : {
    mysql: {
      host: '127.0.0.1',
      user: 'root',
      password: 'qeemo1234',
      database: 'qm_saas'
    }
  },
  test : {
    mysql: {
      host: '192.168.0.200',
      user: 'root',
      password: 'qeemo1234',
      database: 'qm_saas'
    }
  },
  development : {
    mysql: {
      host: '192.168.0.200',
      user: 'root',
      password: 'qeemo1234',
      database: 'qm_saas'
    }
  },
  production : {
    mysql: {
      host: '10.4.7.114',
      user: 'wetms',
      password: 'wetms1234',
      database: 'qm_saas'
    }
  }
}[env];
