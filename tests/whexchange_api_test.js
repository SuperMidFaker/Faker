'use strict';
var assert = require('assert');
var request = require('supertest');
describe('#warehouse exchange v1 api', function () {
  request = request('http://localhost:3024');
  var log = console.log;
  it('-- should redirect to sso login url without appid or appsecret', function (done) {
    request.post('/v1/whexchange/customers')
    .send([{
      wh_no: 'xx'
    }])
    .end(function(err, res){
      assert.equal(res.status, 302);
      done(err);
    });
  });
  it('-- should response error code msg with unknown appid and appsecret', function (done) {
    request.post('/v1/whexchange/customers?app_id=unknown&app_secret=unknown')
    .send([{
      wh_no: 'xx'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.notEqual(data.msg, '');
      assert.equal(data.code, 5003);
      done(err);
    });
  });
  it('-- should create customers with appid and appsecret', function (done) {
    request.post('/v1/whexchange/customers?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh2',
      customer_no: 'cust1',
      mobile: '15977776665'
    }, {
      wh_no: 'wh3',
      customer_no: 'cust10',
      mobile: '15977756665'
    }])
    .end(function(err, res){
      const data = res.body;
      log(data);
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create customer suppliers with appid and appsecret', function (done) {
    request.post('/v1/whexchange/supplies?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh2',
      customer_no: 'cust1',
      name: 'product1'
    }, {
      wh_no: 'wh3',
      customer_no: 'cust1',
      name: 'product2'
    }])
    .end(function(err, res){
      const data = res.body;
      log(data);
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create warehouses with appid and appsecret', function (done) {
    request.post('/v1/whexchange/warehouses?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      wh_mode: 'free',
      wh_name: 'ware20'
    }, {
      wh_no: 'wh30',
      wh_mode: 'paid',
      wh_name: 'ware30'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create products with appid and appsecret', function (done) {
    request.post('/v1/whexchange/products?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      customer_no: 'cust10',
      goods_no: 'good1'
    }, {
      wh_no: 'wh20',
      customer_no: 'cust1',
      goods_no: 'good2'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create inbounds with appid and appsecret', function (done) {
    request.post('/v1/whexchange/inbound?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      customer_no: 'cust10',
      trans_no: 'tr1'
    }, {
      wh_no: 'wh20',
      customer_no: 'cust1',
      trans_no: 'tr2'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create outbounds with appid and appsecret', function (done) {
    request.post('/v1/whexchange/outbound?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      customer_no: 'cust10',
      trans_no: 'otr1'
    }, {
      wh_no: 'wh20',
      customer_no: 'cust1',
      trans_no: 'otr2'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create inventory with appid and appsecret', function (done) {
    request.post('/v1/whexchange/inventory?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      customer_no: 'cust10',
      goods_no: 'good1'
    }, {
      wh_no: 'wh20',
      customer_no: 'cust1',
      goods_no: 'good2'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should create fees with appid and appsecret', function (done) {
    request.post('/v1/whexchange/fees?app_id=30276b5e9d0984bca13ffa3e11f61a4e&app_secret=lAkcegrVax5plJUCgK5tZEucnPg9s//FOi1mu9BgfC4=')
    .send([{
      wh_no: 'wh20',
      customer_no: 'cust10',
      fee_name: 'fee1'
    }])
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
});
