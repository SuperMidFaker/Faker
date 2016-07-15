/* eslint-disable */
// nodemon server/sboot --port=3024 --api=true */
'use strict';
const assert = require('assert');
const supertest = require('supertest');
describe('#partner get/post v1 api', function () {
  const request = supertest('http://localhost:3024');
  var log = console.log;
  it('-- should get partnership with tenant_id 33 and type_code TRS', function (done) {
    request.get('/v1/saas/partners')
      .query({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
        tenant_id: 33,
        type_code: 'TRS',
      })
      .end(function(err, res){
        assert.equal(res.body.status, 200);
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
        assert.equal(res.body.status, 400);
        assert.equal(res.body.err_code, 40001);
        done(err);
      });
  });
  it('-- should create partners with online and offline tenants', function (done) {
    request.post('/v1/saas/partners')
      .send({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
      })
      .send({
        partners: [{
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
            type_code: 'CCB',
          }],
        }]
      }
      ).end(function(err, res){
        const data = res.body;
        log(data);
        assert.equal(data.status, 200);
        done(err);
      });
  });
  it('-- should get bills', function (done) {
    request.get('/v1/cms/bills')
      .query({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
        delg_no: 'NLOCI16070760003',
      })
      .end(function(err, res){
        const data = res.body;
        log(data);
        assert.equal(data.status, 200);
        done(err);
      });
  });
  it('-- should response error when delg_no is wrong', function (done) {
    request.post('/v1/cms/bills')
      .send({ access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862' })
      .send({
        bills: [{
          head: {
            bill_source: 1,
            delg_no: 'DEMOCI1607086005',
          }
        }],
      }).end((err, res) => {
        console.log(res.body);
        assert(res.body.err_code === 3001);
        done(err);
      })
  });
  it('-- should response error when delg_no and external_no mismatch', function (done) {
    request.post('/v1/cms/bills')
      .send({ access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862' })
      .send({
        bills: [{
          head: {
            bill_source: 0,
            delg_no: 'DEMOCI16070860005',
            external_no: 'i230027',
          }
        }],
      }).end((err, res) => {
        assert(res.body.err_code === 3002);
        done(err);
      })
  });
  it('-- should create bills under specified external_no & skip when bill is finished', function (done) {
    request.post('/v1/cms/bills')
      .send({ access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862' })
      .send({
        bills: [{
          head: {
            bill_source: 0,
          external_no: 'I00000000000000736',
          delg_type: 0,
          i_e_port: '2211',
          owner_code: '3122460170',
          owner_name: '上海恩诺物流有限公司',
          trade_co: '3122460170',
          trade_name: '上海恩诺物流有限公司',
          agent_code: '3109980169',
          agent_name: '上海茂鸿国际货运有限公司',
          trans_mode: 5,
          bl_wb_no: 'TYD201607082002',
          trade_mode: '0214',
          dest_port: '1933',
          contract_no: 'HT2016070800003',
          district_code: '31224',
          pack_count: 1,
          pack_type: '5',
          gross_wt: 638,
          net_wt: 606.6,
          container_no: '',
          note: '1托盘/0961/',
          cont_lcl: 0.0,
          jzx_type: '',
          mawb_no: '04363649751',
          hawb_no: '00347669',
          created_date: '2015-09-17 00:00:00',
          }, lists: [{
            list_g_no: 1,
            em_g_no : 1,
            cop_g_no : 'L001',
            code_t : '01012100',
            code_s : '10',
            g_name : '板材',
            g_model : '5.5长',
            country_code: '102',
            element : '申报要素',
            qty : '50.00000',
            unit  : '007',
            dec_total : 600.00,
            dec_price : 12.00,
            curr  : '142',
            gross_wt  : 2.0,
            wet_wt  : 2.0,
            duty_mode : '1',
          }, {
            list_g_no: 2,
            em_g_no : 1,
            cop_g_no : 'L001',
            code_t : '01012100',
            code_s : '10',
            g_name : '板材',
            g_model : '5.5长',
            country_code: '102',
            element : '申报要素',
            qty : '50.00000',
            unit  : '007',
            dec_total : 600.00,
            dec_price : 12.00,
            curr  : '142',
            gross_wt  : 12.0,
            wet_wt  : 12.0,
            duty_mode : '1',
          },
          ]}, {
            head: {
              bill_source: 1,
              delg_no: 'DEMOCI16070860007', // bill_status 2
              external_no: 'I010747',
            },
          }],
      })
        .end(function(err, res){
          const data = res.body;
          console.log(data);
          assert.equal(data.status, 200);
          done(err);
        });
  });
  it('-- should create entry and delg with no delgNo and external_no not found', function (done) {
    request.post('/v1/cms/entries')
      .send({ access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862' })
    .send({
      entries: [{
        head: {
          entry_source: 1,
          partner_code: '3097',
          partner_name: '勋豪呒',
          delg_type: 0,
          comp_entry_id: '312245d016',
          external_no: '3122410f160426008',
          i_e_port: '2211',
          owner_code: '3122460170',
          owner_name: '上海恩诺物流有限公司',
          trade_co: '3122460170',
          trade_name: '上海恩诺物流有限公司',
          agent_code: '3109980169',
          agent_name: '上海茂鸿国际货运有限公司',
          trans_mode: 5,
          bl_wb_no: 'TYD201607082002',
          trade_mode: '0214',
          dest_port: '1933',
          contract_no: 'HT2016070800003',
          district_code: '31224',
          pack_count: 1,
          pack_type: '5',
          gross_wt: 638,
          net_wt: 606.6,
          container_no: '',
          note: '1托盘/0961/',
          cont_lcl: 0.0,
          jzx_type: '',
          mawb_no: '04363649751',
          hawb_no: '00347669',
          created_date: '2015-09-17 00:00:00',
        },
        lists: [{
            list_g_no: 1,
            em_g_no : 1,
            cop_g_no : 'L001',
            code_t : '01012100',
            code_s : '10',
            g_name : '板材',
            g_model : '5.5长',
            country_code: '102',
            element : '申报要素',
            qty : '50.00000',
            unit  : '007',
            dec_total : 600.00,
            dec_price : 12.00,
            curr  : '142',
            gross_wt  : 2.0,
            wet_wt  : 2.0,
            duty_mode : '1',
          }, {
            list_g_no: 2,
            em_g_no : 1,
            cop_g_no : 'L001',
            code_t : '01012100',
            code_s : '10',
            g_name : '板材',
            g_model : '5.5长',
            country_code: '102',
            element : '申报要素',
            qty : '50.00000',
            unit  : '007',
            dec_total : 600.00,
            dec_price : 12.00,
            curr  : '142',
            gross_wt  : 12.0,
            wet_wt  : 12.0,
            duty_mode : '1',
        }],
      }],
    })
    .end(function(err, res){
      const data = res.body;
      log(data);
      assert.equal(data.status, 200);
      done(err);
    });
  });
  it('-- should update entry no with comp_entry_id', function (done) {
    request.post('/v1/cms/entrynos')
      .send({
        access_token: '14ebb0993859fd1c5ab3c0a5b280ae1a82ead67c581f5dbace6e4a6d70f9e862',
      })
    .send({
      entry_id: '221820161180264722,221020161100039230',
      comp_entry_id: '312245d016,IL16000003-1'
    })
    .end(function(err, res){
      const data = res.body;
      assert.equal(data.status, 200);
      done(err);
    });
  });
  /*
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
  */
});
/* eslint-disable */
