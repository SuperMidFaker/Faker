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
