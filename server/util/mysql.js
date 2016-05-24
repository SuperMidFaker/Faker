/**
 * Copyright (c) 2012-2013 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 13-10-29
 * Time: 下午2:06
 * Version: 1.0
 * Description:
 */
'use strict';
var mysql = module.exports;
var _poolModule = require('generic-pool');
var config = require('../../config/db.config');

mysql.init = function(config) {
  this.getSqlClient(DEFAULT, config);
};

mysql.insert = function (sql, args, trans) {
  return this.getSqlClient().query(sql, args, trans);
};

mysql.query = function (sql, args, trans) {
  return this.getSqlClient().query(sql, args, trans);
};

mysql.update = function (sql, args, trans) {
  return this.getSqlClient().query(sql, args, trans);
};

mysql.delete = function (sql, args, trans) {
  return this.getSqlClient().query(sql, args, trans);
};

mysql.beginTransaction = function () {
  return this.getSqlClient().beginTransaction();
};

mysql.rollback = function(trans) {
  return this.getSqlClient().rollback(trans);
};

mysql.commit = function(trans) {
  return this.getSqlClient().commit(trans);
}

mysql.shutdown = function () {
  this.clearSqlClient(DEFAULT);
};

mysql.safeShutdown = function() {
  this.clearSqlClient(DEFAULT);
};


function SqlClient(config) {
    if (!config) {
        throw new Error('mysql config must not null!');
    }
    if (!(this instanceof SqlClient)) {
        return new SqlClient(config);
    }
    this.pool = createMysqlPool(config);
}

/**
 * mysql查询
 * @param sql
 * @param args
 */
SqlClient.prototype.query = function (sql, args, trans) {
  var pool = this.pool;
  return function (done) {
    if (trans) {
      trans.query(sql, args, function(err, res) {
        if (err) {
          err.sql = true;
          console.error(err.stack, sql, args);
        }
        done(err, res);
      });
    } else {
      pool.acquire(function(err, client) {
        if (!!err) {
          err.sql = true;
          console.error(err.stack, sql, args);
          return done(err);
        }
        client.query(sql, args, function(err, res) {
          if (err) {
            err.sql = true;
            console.error(err.stack, sql, args);
          }
          pool.release(client);
          done(err, res);
        });
      });
    }
  };
};

SqlClient.prototype.beginTransaction = function () {
  var self = this;
  return function (done) {
    var pool = self.pool;
    pool.acquire(function(err, client) {
      if (!!err) {
        console.error('[sqlerror transactionFun] error message:' + err.stack + ']');
        return done(err);
      }
      client.beginTransaction(function(err) {
        if (!!err) {
          return done(err);
        }
        return done(null, client);
      });
    });
  };
};

SqlClient.prototype.rollback = function (trans) {
  var pool = this.pool;
  return function (done) {
    trans ?
    trans.rollback(function () {
      pool.release(trans);
      done();
    }) : done();
  };
};

SqlClient.prototype.commit = function (trans) {
  var pool = this.pool;
  return function (done) {
    trans ?
    trans.commit(function (err) {
      pool.release(trans);
      if (err) {
        done(err);
      } else {
        done();
      }
    }) : done();
  };
};

SqlClient.prototype.shutdown = function () {
    this.pool.destroyAllNow();
};

SqlClient.prototype.safeShutdown = function() {
    var spool = this.pool;
    spool.drain(function(){
        spool.destroyAllNow();
    });
};
/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(mysqlConfig) {
    return _poolModule.Pool({
        name: 'mysql',
        create: function(callback) {
            var mysql = require('mysql');
            var client = mysql.createConnection({
                host: mysqlConfig.host,
                user: mysqlConfig.user,
                password: mysqlConfig.password,
                database: mysqlConfig.database,
                multipleStatements: true,
                charset: 'UTF8MB4_BIN'
            });
            client.insert = client.query;
            client.update = client.query;
            client.delete = client.query;
            client.select = client.query;
            callback(null, client);
        },
        destroy: function(client) {
            client.end();
        },
        max: 10,
        idleTimeoutMillis : 30000,
        log : false
    });
};

var clients = {};
var DEFAULT = 'default';
/**
 * 获取SqlClient实例
 * @param  {String} key         sqlClient对应的key
 * @param  {Object} config      mysql连接配置
 * @return {Object} SqlClient
 */
mysql.getSqlClient = function (key, config) {
    if (arguments.length == 1) {
        config = key;
        key = null;
    }
    if (!!key) {
        var client = clients[key];
        if (!!client) {
            return client;
        } else {
            clients[key] = new SqlClient(config);
            return clients[key];
        }
    } else {
        var keyArr = Object.keys(clients);
        if (keyArr.length > 0) {
            return clients[keyArr[0]];
        } else {
            clients[DEFAULT] = new SqlClient(config);
            return clients[DEFAULT];
        }
    }
};

function clearKey (key) {
    var client = clients[key];
    client.safeShutdown();
    delete clients[key];
}
/**
 * 清理不需要的sqlClient
 * @param  {String} key
 */
mysql.clearSqlClient = function (key) {
    if (!!key) {
        clearKey(key);
    } else {
        var keyArr = Object.keys(clients);
        for (var i = 0; i < keyArr.length; i++) {
            var k = keyArr[i];
            clearKey(k);
        }
    }
};

var inited = false;
if (!inited) {
    inited = true;
    mysql.init(config.mysql);
}
