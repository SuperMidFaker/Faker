'use strict';
var assert = require('assert');
var request = require('supertest');
describe('#warehouse query v1 api', function () {
  const authReq = request('http://localhost:3020');
  const apiReq = request('http://localhost:3024');
  it('-- should get warehouses with since_id', function (done) {
    authReq.post('/public/v1/login')
    .send({
      username: '15977776665',
      password: '123456'
    })
    .end((err, resp) => {
      apiReq.get('/v1/wms/app/warehouses?since_id=24')
      .set({ Authorization: 'Bearer ' + resp.body.data.token })
      .end(function(err, res){
        console.log(res.body);
        assert.equal(res.body.status, 200);
        done(err);
      });
    });
  });
  it('-- should get inbounds with date and all other query', function (done) {
    authReq.post('/public/v1/login')
    .send({
      username: '15977776665',
      password: '123456'
    })
    .end((err, resp) => {
      apiReq.post('/v1/wms/customer/inbound')
      .set({ Authorization: 'Bearer ' + resp.body.data.token })
      .send({
        wh_no: 'wh12',
        date: 1449715874,
        goods_name: '产品',
        max_id: 3
      })
      .end(function(err, res){
        console.log(res.body);
        assert.equal(res.body.status, 200);
        done(err);
      });
    });
  });
  it('-- should get inbounds with date_start and date_end', function (done) {
    authReq.post('/public/v1/login')
    .send({
      username: '15977776665',
      password: '123456'
    })
    .end((err, resp) => {
      apiReq.post('/v1/wms/customer/inbound')
      .set({ Authorization: 'Bearer ' + resp.body.data.token })
      .send({
        date_start: 1449715074,
        date_end:  14497158777,
        max_id: 6
      })
      .end(function(err, res){
        console.log(res.body);
        assert.equal(res.body.status, 200);
        done(err);
      });
    });
  });
});
