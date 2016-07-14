/* eslint-disable */
'use strict';
const assert = require('assert');
const request = require('supertest');
describe('#partner get/post v1 api', function () {
  request = request('http://localhost:3024');
  var log = console.log;
  it('-- should get partnership with tenant_id 33 and type_code TRS', function (done) {
    request.get('/v1/saas/partners')
      .query({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
        tenant_id: 33,
        type_code: 'TRS',
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert(res.body.data.length > 0);
        done(err);
      });
  });
  it('-- should response param error with no tenant_id', function (done) {
    request.get('/v1/saas/partners')
      .query({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
      })
      .end(function(err, res){
        assert.equal(res.status, 400);
        assert.equal(res.data.error_code, 40001);
        done(err);
      });
  });
  it('-- should create partners with online and offline tenants', function (done) {
    request.post('/v1/saas/partners')
      .send({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
      })
      .send([{
        partner: {
          code: '3122441960',
          sub_code: '22102',
          name: '柏中工业固定器国际贸易(上海)有限公司',
        },
        ships: [{
          type: 4,
          type_code: 'TRS',
        }, {
          type: 1,
          type_code: 'FWD',
        }],
      }, {
        partner: {
          code: '3097',
          name: '勋豪呒',
        },
        ships: [{
          type: 4,
          type_code: 'TRS',
        }],
      }]).end(function(err, res){
        const data = res.body;
        log(data);
        assert.equal(data.status, 200);
        done(err);
      });
  });
  it('-- should get bills', function (done) {
    request.get('/v1/cms/bills')
      .query({
        delg_no: 'NLOCI16070760003',
      })
      .end(function(err, res){
        const data = res.body;
        log(data);
        assert.equal(data.status, 200);
        done(err);
      });
  });
  it('-- should create bills with delg_no and external_no', function (done) {
    request.post('/v1/cms/bills')
      .send({ access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862' })
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
/* eslint-disable */
