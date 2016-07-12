import sequelize from './sequelize';
import { STRING, INTEGER } from 'sequelize';

export const CmsParamCustomsDao = sequelize.define('cms_param_customs', {
  customs_code: STRING,
  customs_name: STRING,
});

export const CmsParamTradeDao = sequelize.define('cms_param_trade', {
  trade_mode: STRING,
  trade_abbr: STRING,
  trade_spec: STRING,
  list_type: INTEGER,
});

export const CmsParamTransModeDao = sequelize.define('cms_param_trans_mode', {
  trans_code: STRING,
  trans_spec: STRING,
});

export const CmsParamTrxDao = sequelize.define('cms_param_transaction', {
  trx_mode: STRING,
  trx_spec: STRING,
});

export const CmsParamCountry = sequelize.define('cms_param_country', {
  cntry_co: STRING,
  cntry_name_en: STRING,
  cntry_name_cn: STRING,
});

export const CmsParamRemission = sequelize.define('cms_param_remission', {
  rm_mode: STRING,
  rm_abbr: STRING,
  rm_spec: STRING,
});

export const CmsParamPorts = sequelize.define('cms_param_ports', {
  port_c_cod: STRING,
  port_e_cod: STRING,
  port_line: STRING,
  port_count: STRING,
  port_code: STRING,
});

export const CmsParamDistricts = sequelize.define('cms_param_districts', {
  district_code: STRING,
  district_name: STRING,
  district_type: STRING,
});

export const CmsParamCurrency = sequelize.define('cms_param_currency', {
  curr_code: STRING,
  curr_symb: STRING,
  curr_name: STRING,
});

export const CmsParamUnit = sequelize.define('cms_param_unit', {
  conv_cod: STRING,
  conv_ratio: STRING,
  unit_code: STRING,
  unit_name: STRING,
});

export const CmsParamHsCode = sequelize.define('cms_param_hscode', {
  hscode: STRING,  // 商品编码
  product_name: STRING, // 商品名称
  product_english_name: STRING, //       商品英文名称
  declared_elements: STRING, //       申报要素
  declared_elements_src : STRING, //      申报要素补充
  declared_elements_price : STRING, //
  review  : STRING, //      审单及其他申报要素
  declared_elements_remark: STRING, //       申报要素举例说明
  declared_elements_example: STRING, //       申报要素填报案例
  first_unit  : STRING, //     法定第一单位
  second_unit : STRING, //     法定第二单位
  mfn_rates : STRING, //     最惠国进口税率
  general_rates : STRING, //     普通进口税率
  provisional_rates : STRING, //      暂定进口税率
  vat_rates : STRING, //      增值税率(进口)
  gst_rates : STRING, //      消费税率
  export_rates  : STRING, //     出口关税率
  export_provisional_rates  : STRING, //     出口暂定关税
  export_rebate_rates : STRING, //     出口退税率
  export_vat_rates  : STRING, //     增值税率（出口）
  check_cert  : STRING, //      报检特殊单证
  check_price : STRING, //      报检费率
  check_price_desc  : STRING, //      报检计费说明
  check_remark: STRING, //       报检备注
  customs : STRING, //     海关监管条件
  inspection  : STRING, //     检验检疫类别
  product_remark: STRING, //       商品描述
  product_category: STRING, //       商品类别
  used: STRING,
  verified: STRING,
  used_remark: STRING,
  import_customs  : STRING,
  special_mark: INTEGER, // 特殊商品编码1代表特殊商品编码
});

export const CmsCompDeclareWayDao = sequelize.define('cms_comp_declare_way', {
  i_e_type: INTEGER, // 进出类别 0 进口 1 出口
  decl_way_code: STRING, // 报关类型编码,标识列
  decl_way_name: STRING, // 报关类型名称
  tenant_id: INTEGER, // 所属公司(租户)id
});

export const CmsParamExemptionWayDao = sequelize.define('cms_param_exemptionway', {
  way_code: STRING, // 征免方式编码
  way_name: STRING, // 征免方式名称
});
