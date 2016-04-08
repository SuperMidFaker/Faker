import mysql from '../../reusable/db-util/mysql';
export default {
  // 获取海关基本信息
  getCustomsRel() {
    const sql = `select customs_code \`value\`, concat(customs_code,'|',customs_name) \`text\` from para_customs_rel`;
    return mysql.query(sql);
  },
  // 获取监管方式
  getTrade() {
    const sql = `select trade_mode \`value\`, concat(trade_mode,'|',abbr_trade) \`text\` from para_trade`;
    return mysql.query(sql);
  },
  // 获取成交方式
  getTransac() {
    const sql = `select trans_mode \`value\`, concat(trans_mode,'|',trans_spec) \`text\` from para_transac`;
    return mysql.query(sql);
  },
  // 获取运输方式
  getTransf() {
    const sql = `select traf_code \`value\`, concat(traf_code,'|',traf_spec) \`text\` from para_transf`;
    return mysql.query(sql);
  },
  // 获取国别
  getCountry() {
    const sql = `select country_co \`value\`,concat(country_co,'|',country_na) \`text\` from para_country`;
    return mysql.query(sql);
  },
  // 获取征免性质
  getLevytype() {
    const sql = `select cut_mode \`value\`,concat(cut_mode,'|',abbr_cut) \`text\` from para_levytype`;
    return mysql.query(sql);
  },
  // 获取装货港
  getPort() {
    const sql = `select  port_code \`value\`, concat(port_code,'|',port_c_cod) \`text\` from para_port_lin`;
    return mysql.query(sql);
  },
  // 获取境内目的地
  getDistrict() {
    const sql = `select district_code \`value\`,concat(district_code,'|',district_name) \`text\` from para_district_rel`;
    return mysql.query(sql);
  },
  // 获取币制
  getCurr() {
    const sql = `select curr_code \`value\`,concat(curr_code,'|',curr_name) \`text\`  from para_curr`;
    return mysql.query(sql);
  }
}
