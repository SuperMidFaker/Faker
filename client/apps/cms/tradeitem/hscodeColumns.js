import React from 'react';
const Customs = {
  A: '入境货物通关单',
  B: '出境货物通关单',
  D: '毛坯钻石用出/入境货物通关单',
  E: '濒危物种允许出口证明书',
  F: '濒危物种允许进口证明书',
  G: '两用物项和技术出口许可证（定向）',
  H: '香港工业贸易署发《内地加工纺织品OPA证明》,澳门经济局签发《内地加工纺织品证明》',
  I: '精神药物进出口准许证',
  J: '黄金及其制品进出口准许证或批件',
  K: '深加工结转申请表',
  L: '药品进/出口准许证(蛋白同化剂、肽类激素）',
  M: '密码产品和含有密码技术设备进口许可证',
  O: '自动进口许可证（机电产品）',
  P: '固体废物进口许可证',
  Q: '进口药品通关单',
  R: '进口兽药通关单',
  S: '进出口农药登记证明',
  T: '银行调运外币/人民币现钞进出境许可证',
  U: '合法捕劳产品通关证明',
  W: '麻醉药品进出口准许证',
  X: '有毒化学品进出口环境管理放行通知单',
  Y: '原产地证明',
  Z: '音像制品进口批准单或节目提取单',
  c: '内销征税联系单',
  e: '关税配额外优惠税率进口棉花配额证',
  q: '国别关税配额证明',
  r: '预归类标志',
  s: '适用ITA税率的商品用途认定证明',
  t: '关税配额证明',
  v: '自动进口许可证（加工贸易）',
  x: '出口许可证（加工贸易）',
  y: '出口许可证（边境小额贸易）',
  1: '进口许可证',
  2: '两用物项和技术进口许可证',
  3: '两用物项和技术出口许可证',
  4: '出口许可证',
  5: '纺织品临时出口许可证',
  6: '旧机电产品禁止进口',
  7: '自动进口许可证',
  8: '禁止出口商品',
  9: '禁止进口商品' };

const Inspections = {
  M: '进口商品检验',
  N: '出口商品检验',
  P: '进境动植物、动植物产品检疫',
  Q: '出境动植物、动植物产品检疫',
  R: '进口食品卫生监督检验',
  S: '出口食品卫生监督检验',
  L: '民用商品入境验证' };

function buildTipItems(str, b) {
  if (!str || str === '-') {
    return (<span>{str}</span>);
  }
  const cs = [];
  for (let i = 0; i < str.length; i++) {
    const s = !b ? Customs[str[i]] : Inspections[str[i]];
    const k = str[i];
    cs.push(<span>{k}:{s} <br /></span>);
  }
  return (<a>{cs}</a>); // (<Tooltip title={cs}><a>{str}</a></Tooltip>);
}

export const hscodeColumns = () => [{
  title: '商品编码',
  dataIndex: 'hscode',
  width: 120,
  fixed: 'left',
  className: 'hscode-list-left',
}, {
  title: '商品名称',
  dataIndex: 'product_name',
  width: 200,
}, {
  title: '商品描述',
  dataIndex: 'product_remark',
  width: 100,
}, {
  title: '申报要素',
  dataIndex: 'declared_elements',
  width: 300,
}, {
  title: '法定第一单位',
  dataIndex: 'first_unit',
  width: 120,
}, {
  title: '法定第二单位',
  dataIndex: 'second_unit',
  width: 120,
}, {
  title: '最惠国进口税率',
  dataIndex: 'mfn_rates',
  width: 120,
}, {
  title: '普通进口税率',
  dataIndex: 'general_rates',
  width: 100,
}, {
  title: '暂定进口税率',
  dataIndex: 'provisional_rates',
  width: 100,
}, {
  title: '消费税率',
  dataIndex: 'gst_rates',
  width: 60,
}, {
  title: '出口关税率',
  dataIndex: 'export_rates',
  width: 80,
}, {
  title: '出口退税率',
  dataIndex: 'export_rebate_rates',
  width: 80,
}, {
  title: '增值税率',
  dataIndex: 'vat_rates',
  width: 60,
}, {
  title: '海关监管条件',
  dataIndex: 'customs',
  width: 180,
  render: col => buildTipItems(col),
}, {
  title: '检验检疫类别',
  dataIndex: 'inspection',
  width: 180,
  render: col => buildTipItems(col, true),
}];
