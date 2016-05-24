/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-29
 * Time: 14:07
 * Version: 1.0
 * Description:
 */
'use strict';

const util = require('util');
const db = require('./mysql');
/*
type define

/a   auto increment
/v_54   varchar(54)
/i_11   int(11)
/f_10   float(10)
/d_10   double(10)
/e_9_5   decimal(9,5)
/dtt datetime
/dt  date
/dtn new Date() -> now datetime

/nn  not null  -> /v_4/nn
/def_... default value -> /v_4/nn/def_hell
 */

/*
col = {
  type,    // string type name
  minLen,   // int
  maxLen,  // int
  def,   // function   default function to parse value
  nullable, // boolean default true
  val // value   column value
}
 */
// asalias tbname as asalias
// indexs table index like primary_key,unique_key,index_key
class OrmObject {
  constructor(columns, tbname) {
    this.tbname = tbname;
    this.mapping = {};
    this.indexs = {};
    this.asalias = tbname;

    this.build(columns);
  }

  get db() {
    return db;
  }

  parse(s) {
    const ss = s.split('_');
    let type;
    let maxLen = 0;
    let minLen = 0;
    let def = aa => { return aa; };
    switch (ss[0]) {
    case 'a':
      type = 'auto_increment';
      break;
    case 'v':
      type = 'varchar';
      def = str => {
        if (!str) return '';
        if (typeof str === 'string') return str;
        if (typeof str === 'object') return JSON.stringify(str);
        if (typeof str !== 'string') {
          return String(str);
        }
      };
      break;
    case 'i':
      type = 'int';
      def = (i) => {
        if (!i || isNaN(i)) {
          return 0;
        }
        return parseInt(i, 10) || 0;
      };
      break;
    case 'f':
      type = 'float';
      def = (i) => {
        if (!i || isNaN(i)) {
          return 0;
        }
        return parseFloat(i) || 0;
      };
      break;
    case 'd':
      type = 'double';
      def = (i) => {
        if (!i || isNaN(i)) {
          return 0;
        }
        return parseFloat(i) || 0;
      };
      break;
    case 'e':
      type = 'decimal';
      def = (i) => {
        if (!i || isNaN(i)) {
          return 0;
        }
        return parseFloat(i) || 0;
      };
      break;
    case 'dt':
      type = 'date';
      def = (d) => {
        if (!d) {
          return null;
        }
        if (d instanceof Date) {
          return d;
        }
        return new Date(d);
      };
      break;
    case 'dtt':
      type = 'datetime';
      def = (d) => {
        if (!d) {
          return null;
        }
        if (d instanceof Date) {
          return d;
        }
        return new Date(d);
      };
      break;
    case 'dtn':
      type = 'datetime';
      def = () => {
        return new Date();
      };
      break;
    default:
      type = 'varchar';
      def = str => {
        if (!str) return '';
        if (typeof str === 'string') return str;
        if (typeof str === 'object') return JSON.stringify(str);
        if (typeof str !== 'string') {
          return String(str);
        }
      };
      break;
    }
    if (ss.length > 1) {
      maxLen = parseInt(ss[1], 10);
      if (ss.length === 3) {
        minLen = parseInt(ss[2], 10);
      }
    }
    return {type, maxLen, minLen, nullable: true, def, val: def()};
  }

  build(columns) {
    const _this = this;
    columns.forEach(c => {
      const ss = c.split('/');
      const o = _this.parse(ss[1]);
      if (ss.length > 1) {
        for (let i = ss.length - 1; i > 0; i--) {
          const s = ss[i];
          if (s.substr(0, 2) === 'nn') {
            o.nullable = false;
          } else if (s.substr(0, 3) === 'def') {
            o.val = o.def(s.split('_')[1]);
          }
        }
      }

      if (o.type === 'auto_increment') {
        _this.indexs[ss[0]] = 'primary_key';
      }

      _this.mapping[ss[0]] = o;
    });
  }
  /**
   * toWhere sql
   * @param  {Object} obj {where:..., ...} where string or object key value to where string
   * @return {Object}     {sqlArr, args}
   */
  toWhere(obj) {
    const sqlArr = [];
    const args = [];

    if (obj._where) {
      sqlArr.push(obj._where);
    } else {
      sqlArr.push(' where ');
      const tmp = Object.keys(obj).map(key => {
        const k = this.mapping[key];
        if (obj[key] === undefined || obj[key] === null) {
          return '1=1';
        }
        if (util.isArray(obj[key])) {
          args.push(obj[key]);
          return `${key} in (?)`;
        }
        if (obj[key] === 'is_null') {
          return `${key} is null`;
        }
        if (obj[key] === 'not_null') {
          return `${key} is not null`;
        }
        if (typeof obj[key] === 'string') {
          if (obj[key].indexOf('max_') === 0) {
            const vs = obj[key].split('max_')[1];
            args.push(k.def(vs));
            return `${key} > ?`;
          }
          if (obj[key].indexOf('min_') === 0) {
            const vs = obj[key].split('min_')[1];
            args.push(k.def(vs));
            return `${key} < ?`;
          }
          if (obj[key].indexOf('like_') === 0) {
            const vs = obj[key].split('like_')[1];
            args.push(vs);
            return `${key} like ?`;
          }
        }
        args.push(obj[key]);
        return `${key} = ?`;
      });

      sqlArr.push(tmp.join(' and '));
    }

    return { sqlArr, args };
  }
  /**
   * insert into or replace into
   * @param  {Object} obj    {...fields}
   * @param  {String} method insert or replace
   */
  insertObj(obj, method, trans) {
    const _this = this;
    const sqlArr = [];
    const args = [];

    sqlArr.push(method || 'insert', ` into ${_this.tbname} (`);

    const keys = Object.keys(_this.mapping);
    const tmp = [];
    keys.forEach(key => {
      const k = _this.mapping[key];
      if (k.type === 'auto_increment') {
        return;
      }
      if (obj.hasOwnProperty(key)) {
        tmp.push(key);
        args.push(k.def(obj[key]));
      }
    });
    sqlArr.push(tmp.join(), ') values (?)');

    return db.insert(sqlArr.join(''), [args], trans);
  }
  /**
   * insert into or replace into array
   * @param  {Array} arr    Array
   * @param  {String} method insert or replace
   * @param  {Object} trans  client object
   */
  insertObjs(arr, method, trans) {
    const _this = this;
    const sqlArr = [];
    const args = [];

    sqlArr.push(method || 'insert', ` into ${_this.tbname} (`);
    const tmp = [];
    const keys = Object.keys(_this.mapping);

    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];
      const subArgs = [];
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];

        const k = _this.mapping[key];
        if (k.type === 'auto_increment') {
          continue;
        }
        if (obj.hasOwnProperty(key)) {
          if (i === 0) {
            tmp.push(key);
          }
          subArgs.push(k.def(obj[key]));
        }
      }

      args.push(subArgs);
    }

    sqlArr.push(tmp.join(), ') values ?');

    return db.insert(sqlArr.join(''), [args], trans);
  }
  /**
   * like insertObj
   * @param  {Object} obj   {...fields}
   */
  replaceObj(obj, trans) {
    return this.insertObj(obj, 'replace', trans);
  }
  /**
   * like insertObjs
   * @param  {Array} arr   Array
   */
  replaceObjs(arr, trans) {
    return this.insertObjs(arr, 'replace', trans);
  }
  /**
   * insert duplicate key update...
   * @param  {Object} obj   {...fields, wheres: {...}}
   */
  upsert(obj, trans) {
    const sqlArr = [];
    const args = [];

    sqlArr.push(`insert into ${this.tbname} (`);

    const keys = Object.keys(this.mapping);
    const tmp = [];
    const sargs = [];
    keys.forEach(key => {
      const k = this.mapping[key];
      if (obj.hasOwnProperty(key)) {
        tmp.push(key);
        sargs.push(k.def(obj[key]));
      }
    });
    args.push(sargs);
    sqlArr.push(tmp.join(), ') values (?) on duplicate key update ');
    Object.keys(obj).forEach(key => {
      const k = this.mapping[key];
      if (k) {
        if (obj.ignores && obj.ignores.indexOf(key) === -1) {
          sqlArr.push(`${k}=?,`);
          args.push(k.def(obj[key]));
        } else {
          sqlArr.push(`${k}=?,`);
          args.push(k.def(obj[key]));
        }
      }
    });
    const str = sqlArr.join('');
    return db.insert(str.substr(0, str.length - 1), args, trans);
  }

  deleteObj(obj, trans) {
    const _this = this;
    const w = _this.toWhere(obj.wheres || obj);
    const sqlArr = [];
    sqlArr.push(`delete from ${_this.tbname} `);
    return db.delete(sqlArr.concat(w.sqlArr).join(''), w.args, trans);
  }
  /**
   * select from ...
   * @param  {Object} obj   {fields: [...], alias: [...], wheres: {}, _limits: {min:, max:}}
   */
  selectObjs(obj, trans) {
    const _this = this;
    const sqlArr = ['select '];
    const w = _this.toWhere(obj.wheres || obj);
    if (obj.fields && util.isArray(obj.fields)) {
      sqlArr.push(obj.fields.join());
    } else if (obj.alias) {
      const tmpArr = Object.keys(_this.mapping).map(key => {
        if (obj.alias[key]) {
          return `${key} as ${obj.alias[key]}`;
        }
        return key;
      });
      sqlArr.push(tmpArr.join());
    }
    sqlArr.push(` from ${_this.tbname} `);
    if (obj._orders) {
      w.sqlArr.push(' order by ', obj._orders);
    }
    if (obj._limits && typeof obj._limits === 'object') {
      w.sqlArr.push(' limit ? ');
      w.args.push(obj._limits.min);

      if (obj._limits.max) {
        w.sqlArr.push(', ?');
        w.args.push(obj._limits.max);
      }
    }

    return db.query(sqlArr.concat(w.sqlArr).join(''), w.args, trans);
  }
  /**
   * update set
   * @param  {Object} obj   {...fields, wheres: {...}}
   * @param  {Object} trans client object
   */
  updateObj(obj, trans) {
    const _this = this;
    const sqlArr = [];
    const args = [];
    sqlArr.push(`update ${_this.tbname} set `);
    const tmp = [];
    Object.keys(obj).forEach(key => {
      const k = _this.mapping[key];
      if (k) {
        tmp.push(`${key} = ? `);
        args.push(k.def(obj[key]));
      }
    });
    sqlArr.push(tmp.join());
    const w = _this.toWhere(obj.wheres);

    return db.update(sqlArr.concat(w.sqlArr).join(''), args.concat(w.args), trans);
  }
  /**
   * insert into select
   * @param  {Object} obj {...fields, wheres: {...}}
   */
  copyWithObj(obj) {
    const sqlArr = [`insert into ${this.tbname}(`];
    const args = [];
    const tmpSql = [];
    const tmpSel = [];
    Object.keys(this.mapping).forEach(key => {
      const k = this.mapping[key];
      if (obj.hasOwnProperty(key)) {
        tmpSql.push(key);
        args.push(k.def(obj[key]));
        tmpSel.push('?');
      } else if (k.type !== 'auto_increment') {
        tmpSql.push(key);
        tmpSel.push(key);
      }
    });

    sqlArr.push(tmpSql.join(','), `) select `, tmpSel.join(','), ` from ${this.tbname} `);
    const w = this.toWhere(obj.wheres);
    return db.query(sqlArr.concat(w.sqlArr).join(''), args.concat(w.args));
  }
  /**
   * left join sql, self => a, orm1 => b, orm2 => c
   * obj {fields: ..., ons1: [...], ons2:..., wheres: {...}}
   * @param  {Orm Class} orm1 Orm Class
   * @param  {Orm Class} orm2 Orm Class
   * @param  {Object} obj  Object params
   * @return {db.query yield function}
   */
  leftJoin(orm1, orm2, obj, method) {
    if (orm2 && typeof orm2 === 'object') {
      method = obj;
      obj = orm2;
      orm2 = null;
    }
    const sqlArr = ['select '];
    const args = [];
    method = method || 'left';
    if (obj.fields) {
      if (util.isArray(obj.fields)) {
        sqlArr.push(obj.fields.join());
      } else {
        sqlArr.push(obj.fields);
      }
    }

    sqlArr.push(` from ${this.tbname} as ${this.asalias}`,
      ` ${method} join ${orm1.tbname} as ${orm1.asalias} `);
    if (obj.ons1) {
      if (util.isArray(obj.ons1)) {
        sqlArr.push(' on ', obj.ons1.join(' and '));
      } else {
        sqlArr.push(' on ', obj.ons1);
      }
    }

    if (orm2 && typeof orm2 === 'function') {
      sqlArr.push(` ${method} join ${orm2.tbname} as ${orm2.asalias} `);
      if (obj.ons2) {
        if (util.isArray(obj.ons2)) {
          sqlArr.push(' on ', obj.ons2.join(' and '));
        } else {
          sqlArr.push(' on ', obj.ons2);
        }
      }
    }

    const w = this.toWhere(obj.wheres);
    if (obj._groups) {
      w.sqlArr.push(' group by ', obj._groups);
    }
    if (obj._orders) {
      w.sqlArr.push(' order by ', obj._orders);
    }
    if (obj._limits && typeof obj._limits === 'object') {
      w.sqlArr.push(' limit ? ');
      w.args.push(obj._limits.min);

      if (obj._limits.max) {
        w.sqlArr.push(' , ?');
        w.args.push(obj._limits.max);
      }
    }

    return db.query(sqlArr.concat(w.sqlArr).join(''), args.concat(w.args));
  }

  rightJoin() {
    const arr = [].slice.call(arguments, 0);
    arr.push('right');
    return this.leftJoin.apply(this, arr);
  }

  innerJoin() {
    const arr = [].slice.call(arguments, 0);
    arr.push('inner');
    return this.leftJoin.apply(this, arr);
  }
}


module.exports = OrmObject;
