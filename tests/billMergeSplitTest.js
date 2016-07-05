/* eslint no-console: 0 */
import mergeSplit from '../server/api/_utils/billMergeSplit';

const billHead = {
  id: 20,
  bill_no: 'IL16000020',
  delg_no: 'CI16062200001',
  ems_no: 'ems1',
  fee_rate: 200,
  insur_rate: 300,
  other_rate: 100,
  pack_count: 20,
  gross_wt: 100,
  wet_wt: 80,
};
const entryNumSoFar = 2;
const billList = [{
  qty: 2,
  dec_total: 20,
  gross_wt: 20,
  wet_wt: 15,
  special_hscode: 0,
  custom_control: 1,
  cop_g_no: 'cop2',
  em_g_no: 'emg1',
  code_t: 't2',
  code_s: 's1',
  g_name: 'name2',
  g_model: 'model1',
  country_code: '102',
  curr: '142',
}, {
  qty: 3,
  dec_total: 25,
  gross_wt: 25,
  wet_wt: 20,
  special_hscode: 1,
  custom_control: 0,
  cop_g_no: 'cop1',
  em_g_no: 'emg1',
  code_t: 't3',
  code_s: 's1',
  g_name: 'name1',
  g_model: 'model2',
  country_code: '102',
  curr: '142',
}, {
  qty: 5,
  dec_total: 35,
  gross_wt: 35,
  wet_wt: 25,
  special_hscode: 0,
  custom_control: 0,
  cop_g_no: 'cop3',
  em_g_no: 'emg2',
  code_t: 't1',
  code_s: 's2',
  g_name: 'name3',
  g_model: 'model2',
  country_code: '102',
  curr: '307',
}, {
  qty: 1.5,
  dec_total: 20,
  gross_wt: 15,
  wet_wt: 15,
  special_hscode: 1,
  custom_control: 0,
  cop_g_no: 'cop1',
  em_g_no: 'emg1',
  code_t: 't2',
  code_s: 's1',
  g_name: 'name1',
  g_model: 'model2',
  country_code: '102',
  curr: '142',
}, {
  qty: 1,
  dec_total: 20,
  gross_wt: 5,
  wet_wt: 5,
  special_hscode: 1,
  custom_control: 0,
  cop_g_no: 'cop1',
  em_g_no: 'emg1',
  code_t: 't2',
  code_s: 's1',
  g_name: 'name1',
  g_model: 'model2',
  country_code: '102',
  curr: '142',
},
];
const splitOpt = {
  byHsCode: true,
  byCustom: true,
  perCount: 2,
};

const mergeOpt = {
  checked: true,
  byHsCode: true,
  byGName: true,
  byCurr: true,
  byCountry: true,
  byCopGNo: true,
  byEmGNo: true,
};

const sortOpt = {
  customControl: true,
  decTotal: true,
  decPriceDesc: true,
  hsCodeAsc: true,
};

const msed = mergeSplit(billHead, entryNumSoFar, billList, splitOpt, mergeOpt, sortOpt);
msed.forEach(ms => {
  console.log(ms.head);
  console.log(ms.bodies);
});
/*
 * name1  t2 gross 20 dec_total 40 wet 20
 *        t3 gross 25 dec_total 25 wet 20
 *    other_rate: 45,
 *    fee_rate: 90,
 *    insur_rate: 162.5,
 *    pack_count: 9
 *
 * name2 gross 20 dec_toal 20 wet 15
 *    other_rate: 20,
 *    fee_rate: 40,
 *    insur_rate: 50,
 *    pack_count: 4
 *
 * name3 gross 35 dec_toal 35 wet 25
 *    other_rate: 35,
 *    fee_rate: 70,
 *    insur_rate: 87.5,
 *    pack_count: 7
 */
