/* eslint react/no-multi-comp: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select, Tooltip } from 'antd';
import FormInput from '../../../form/formInput';
import { FormLocalSearchSelect, FormRemoteSearchSelect } from '../../../form/formSelect';
import FormDatePicker from '../../../form/formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_FEE_UNIT, CMS_CONFIRM } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

export function IEPort(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, ietype, required } = props;
  const customsProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_port',
    rules: [{ required }],
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };

  return (
    <FormLocalSearchSelect {...customsProps} />
  );
}
IEPort.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export function IEDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, ietype } = props;
  const ieDateProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    disabled,
    rules: [{ required: false }],
    formData,
    getFieldDecorator,
  };
  return (
    <FormDatePicker {...ieDateProps} />
  );
}
IEDate.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function DeclDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData } = props;
  const dDateProps = {
    outercol: 24,
    col: 8,
    field: 'd_date',
    label: msg('ddate'),
    disabled,
    rules: [{ required: false }],
    formData,
    getFieldDecorator,
  };
  return (
    <FormDatePicker {...dDateProps} />
  );
}
DeclDate.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};


// 进出口口岸、进出口日期、申报日期
export function PortDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, ietype, required } = props;
  const customsProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_port',
    rules: [{ required }],
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const ieDateProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    disabled,
    rules: [{ required: false }],
    formData,
    getFieldDecorator,
  };
  const dDateProps = {
    outercol: 24,
    col: 8,
    field: 'd_date',
    label: msg('ddate'),
    disabled,
    rules: [{ required: false }],
    formData,
    getFieldDecorator,
  };
  return (
    <Col span={15}>
      <Col span={8}>
        <FormLocalSearchSelect {...customsProps} />
      </Col>
      <Col span={8}>
        <FormDatePicker {...ieDateProps} />
      </Col>
      <Col span={8}>
        <FormDatePicker {...dDateProps} />
      </Col>
    </Col>
  );
}
PortDate.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

// 关联单位
export class RelationAutoCompSelect extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    codeField: PropTypes.string.isRequired,
    custCodeField: PropTypes.string.isRequired,
    nameField: PropTypes.string.isRequired,
    formData: PropTypes.object,
    disabled: PropTypes.bool,
    getFieldDecorator: PropTypes.func.isRequired,
    codeRules: PropTypes.array,
    nameRules: PropTypes.array,
    onSelect: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  handleSelect = (value) => {
    const { onSelect, codeField, custCodeField, nameField } = this.props;
    if (onSelect) {
      onSelect(codeField, custCodeField, nameField, value);
    }
  }
  handleInputChange = (value) => {
    const { onChange, codeField, custCodeField, nameField } = this.props;
    if (onChange) {
      onChange(codeField, custCodeField, nameField, value);
    }
  }
  render() {
    const {
      label, codeField, custCodeField, nameField, formData, disabled, options,
      getFieldDecorator, codeRules, nameRules,
    } = this.props;
    const initialCodeValue = formData && formData[codeField] || '';
    const initialCustCodeValue = formData && formData[custCodeField] || '';
    const initialNameValue = formData && formData[nameField];
    const custOpt = options.filter(op => op.custcode !== null && op.custcode.length > 0);
    const compOpt = options.filter(op => op.code !== null && op.code.length > 0);
    return (
      <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={label} required>
        <Row gutter={8}>
          <Col span="6">
            <FormItem style={{ marginBottom: 0 }}>
              {disabled ?
                <Input disabled value={initialCustCodeValue} />
                  : getFieldDecorator(custCodeField, {
                    initialValue: initialCustCodeValue,
                    rules: codeRules,
                    onChange: this.handleInputChange,
                  })(<Select
                    size="large"
                    mode="combobox"
                    showArrow={false}
                    allowClear
                    optionFilterProp="search"
                    placeholder={this.msg('customsCode')}
                    onSelect={this.handleSelect}
                    dropdownMatchSelectWidth={false}
                  >
                    {
                    custOpt.map(opt => <Option key={opt.custcode} search={opt.custcode}><Tooltip placement="right" title={opt.name}>{opt.custcode}|{opt.name}</Tooltip></Option>)
                  }
                  </Select>)}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem style={{ marginBottom: 0 }}>
              {disabled ?
                <Input disabled value={initialCodeValue} />
                  : getFieldDecorator(codeField, {
                    initialValue: initialCodeValue,
                    onChange: this.handleInputChange,
                  })(<Select
                    size="large"
                    mode="combobox"
                    showArrow={false}
                    allowClear
                    optionFilterProp="search"
                    placeholder={this.msg('scc')}
                    onSelect={this.handleSelect}
                    dropdownMatchSelectWidth={false}
                  >
                    {
                    compOpt.map(opt => <Option key={opt.code} search={opt.code}><Tooltip placement="right" title={opt.name}>{opt.code}|{opt.name}</Tooltip></Option>)
                  }
                  </Select>)}
            </FormItem>
          </Col>
          <Col span="10">
            <FormItem style={{ marginBottom: 0 }} >
              {disabled ?
                <Input disabled value={initialNameValue} /> :
                  getFieldDecorator(nameField, {
                    rules: nameRules,
                    initialValue: initialNameValue,
                  })(<Input placeholder={this.msg('relationName')} disabled={disabled} />)}
            </FormItem>
          </Col>
        </Row>
      </FormItem>
    );
  }
}

// 申报地海关、许可证号、合同协议号
export function DeclCustoms(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, required } = props;
  const declPortProps = {
    outercol: 24,
    col: 4,
    field: 'decl_port',
    label: msg('declPort'),
    rules: [{ required }],
    disabled,
    formData,
    getFieldDecorator,
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    searchKeyFn: opt => opt.value,
  };

  return (
    <FormLocalSearchSelect {...declPortProps} />
  );
}
DeclCustoms.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function LicenseNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData } = props;
  const licenseNoProps = {
    outercol: 24,
    col: 8,
    field: 'license_no',
    label: msg('licenseNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <FormInput {...licenseNoProps} />
  );
}
LicenseNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};
export function ContractNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData } = props;
  const contractNoProps = {
    outercol: 24,
    col: 8,
    field: 'contr_no',
    label: msg('contractNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <FormInput {...contractNoProps} />
  );
}
ContractNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

export function ManualNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData } = props;
  const emsNoProps = {
    outercol: 24,
    col: 8,
    field: 'manual_no',
    label: msg('emsNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <FormInput {...emsNoProps} />
  );
}
ManualNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 运输方式、运输名称
export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, getFieldValue, disabled, formData, formRequire, required } = props;
  const trafMode = getFieldValue('traf_mode') === '2' || getFieldValue('traf_mode') === '5';
  const modeProps = {
    outercol: 24,
    col: 8,
    field: 'traf_mode',
    options: formRequire.transModes.map(tm => ({
      value: tm.trans_code,
      text: `${tm.trans_code} | ${tm.trans_spec}`,
    })),
    label: msg('transMode'),
    disabled,
    formData,
    rules: [{ required }],
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const modeNameProps = {
    outercol: 24,
    col: 8,
    field: 'traf_name',
    label: msg('transModeName'),
    rules: getFieldValue('traf_mode') === '2' ? [{ required }] : [{ required: false }],
    disabled,
    formData,
    getFieldDecorator,
  };
  const blwbProps = {
    outercol: 24,
    col: 8,
    field: 'bl_wb_no',
    label: msg('ladingWayBill'),
    disabled,
    formData,
    rules: trafMode ? [{ required }] : [{ required: false }],
    getFieldDecorator,
  };
  return (
    <Col span={16}>
      <Col span={8}>
        <FormLocalSearchSelect {...modeProps} />
      </Col>
      <Col span={8}>
        <FormInput {...modeNameProps} />
      </Col>
      <Col span={8}>
        <FormInput {...blwbProps} />
      </Col>
    </Col>
  );
}
Transport.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 提运单号、航次号
export function DelVoyageNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, getFieldValue, disabled, formData, required } = props;
  const voyageNoProps = {
    outercol: 24,
    col: 8,
    field: 'voyage_no',
    label: msg('voyageNo'),
    disabled,
    formData,
    rules: getFieldValue('traf_mode') === '2' ? [{ required }] : [{ required: false }],
    getFieldDecorator,
  };
  return (
    <Col span={12}>
      <Col span={12}>
        <FormInput {...voyageNoProps} />
      </Col>
    </Col>
  );
}
DelVoyageNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 监管方式、征免性质、备案号
export function TradeRemission(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, required } = props;
  const emsNoProps = {
    outercol: 24,
    col: 8,
    field: 'manual_no',
    label: msg('emsNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  const tradeModeProps = {
    outercol: 24,
    col: 8,
    field: 'trade_mode',
    options: formRequire.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: `${tm.trade_mode} | ${tm.trade_abbr}`,
    })),
    label: msg('tradeMode'),
    rules: [{ required }],
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const declWay = formData.decl_way_code !== '0102' && formData.decl_way_code !== '0103';
  const remissionProps = {
    outercol: 24,
    col: 8,
    field: 'cut_mode',
    options: formRequire.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: `${rm.rm_mode} | ${rm.rm_spec}`,
    })),
    rules: declWay ? [{ required }] : [{ required: false }],
    label: msg('rmModeName'),
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Col span={16}>
      <Col span={8}>
        <FormLocalSearchSelect {...tradeModeProps} />
      </Col>
      <Col span={8}>
        <FormLocalSearchSelect {...remissionProps} />
      </Col>
      <Col span={8}>
        <FormInput {...emsNoProps} />
      </Col>
    </Col>
  );
}
TradeRemission.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 贸易国、起运国
export function CountryAttr(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, onSearch, ietype, required } = props;
  const tradeCountryProps = {
    outercol: 24,
    col: 4,
    field: 'trade_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    label: msg('tradeCountry'),
    disabled,
    formData,
    rules: [{ required }],
    getFieldDecorator,
    searchKeyFn: opt => opt.search,
  };
  const departCountryProps = {
    outercol: 24,
    col: 8,
    field: 'dept_dest_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    label: ietype === 'import' ? msg('departCountry') : msg('destinateCountry'),
    disabled,
    formData,
    rules: [{ required }],
    getFieldDecorator,
    searchKeyFn: opt => opt.search,
  };
  const destPortProps = {
    outercol: 24,
    col: 8,
    field: 'dept_dest_port',
    options: formRequire.ports.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_c_cod}`,
    })),
    label: ietype === 'import' ? msg('iDestinatePort') : msg('eDestinatePort'),
    rules: [{ required }],
    disabled,
    formData,
    getFieldDecorator,
    onSearch,
  };
  const districtProps = {
    outercol: 24,
    col: 8,
    field: 'district_code',
    options: formRequire.districts.map(dist => ({
      value: dist.district_code,
      text: `${dist.district_code} | ${dist.district_name}`,
    })),
    label: ietype === 'import' ? msg('iDistrict') : msg('eDistrict'),
    rules: [{ required }],
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Row>
      <Col span={8}>
        <FormLocalSearchSelect {...tradeCountryProps} />
      </Col>
      <Col span={16}>
        <Col span={8}>
          <FormLocalSearchSelect {...departCountryProps} />
        </Col>
        <Col span={8}>
          <FormRemoteSearchSelect {...destPortProps} />
        </Col>
        <Col span={8}>
          <FormLocalSearchSelect {...districtProps} />
        </Col>
      </Col>
    </Row>
  );
}

CountryAttr.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function TradeMode(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, required } = props;
  const trxModeProps = {
    outercol: 24,
    col: 8,
    field: 'trxn_mode',
    options: formRequire.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
      search: `${tm.trx_mode}${tm.trx_spec}`,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    rules: [{ required }],
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <FormLocalSearchSelect {...trxModeProps} />
  );
}

TradeMode.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 用途、成交方式
export function UsageTrade(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, required } = props;
  const usageProps = {
    outercol: 24,
    col: 8,
    field: 'usage',
    label: msg('usage'),
    disabled,
    formData,
    getFieldDecorator,
  };
  const trxModeProps = {
    outercol: 24,
    col: 8,
    field: 'trxn_mode',
    options: formRequire.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
      search: `${tm.trx_mode}${tm.trx_spec}`,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    rules: [{ required }],
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Col span={9}>
      <Col span={12}>
        <FormInput {...usageProps} />
      </Col>
      <Col span={12}>
        <FormLocalSearchSelect {...trxModeProps} />
      </Col>
    </Col>
  );
}

UsageTrade.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 费用
function FeeFormItem(props) {
  const { feeField, currencyField, markField, label, disabled, formData,
    getFieldDecorator, formRequire, require, feeCurrReq, insurCurrReq, required } = props;
  let currReq = false;
  if (currencyField === 'fee_curr') {
    currReq = feeCurrReq && require;
  } else if (currencyField === 'insur_curr') {
    currReq = insurCurrReq && require;
  }
  formRequire.currencies.unshift({ curr_code: -1, curr_name: '[空]' });
  const feeProps = {
    field: feeField,
    disabled,
    formData,
    rules: require ? [{ required }] : [{ required: false }],
    getFieldDecorator,
  };
  const currencyProps = {
    field: currencyField,
    options: formRequire.currencies.map(curr => ({
      value: curr.curr_code,
      text: `${curr.curr_code} | ${curr.curr_name}`,
      search: `${curr.curr_code}${curr.curr_symb}${curr.curr_name}`,
    })),
    disabled,
    formData,
    rules: currReq ? [{ required }] : [{ required: false }],
    getFieldDecorator,
    searchKeyFn: opt => opt.search,
  };
  const markProps = {
    field: markField,
    disabled,
    formData,
    rules: require ? [{ required }] : [{ required: false }],
    getFieldDecorator,
    options: CMS_FEE_UNIT.map(fu => ({
      value: fu.value,
      text: `${fu.value} | ${fu.text}`,
      search: `${fu.value}${fu.text}`,
    })),
    searchKeyFn: opt => opt.search,
  };
  return (
    <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={label}>
      <Row>
        <Col span={10} style={{ paddingLeft: 2 }}>
          <FormLocalSearchSelect {...currencyProps} placeholder="币制" style={{ marginBottom: 0 }} />
        </Col>
        <Col span={6}>
          <FormInput {...feeProps} />
        </Col>
        <Col span={8}>
          <FormLocalSearchSelect {...markProps} />
        </Col>
      </Row>
    </FormItem>
  );
}

FeeFormItem.propTypes = {
  feeField: PropTypes.string.isRequired,
  currencyField: PropTypes.string.isRequired,
  markField: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function Fee(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldValue } = props;
  const fobRequire = getFieldValue('trxn_mode') === '3';
  const ciRequire = getFieldValue('trxn_mode') === '4';
  const feeCurrReq = getFieldValue('fee_mark') !== '1';
  const insurCurrReq = getFieldValue('insur_mark') !== '1';
  return (
    <Col span={16}>
      <Col span={8}>
        <FeeFormItem {...props} label={msg('freightCharge')} feeField="fee_rate"
          currencyField="fee_curr" markField="fee_mark" require={fobRequire || ciRequire} feeCurrReq={feeCurrReq}
        />
      </Col>
      <Col span={8}>
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr" markField="insur_mark" require={fobRequire} insurCurrReq={insurCurrReq}
        />
      </Col>
      <Col span={8}>
        <FeeFormItem {...props} label={msg('sundry')} feeField="other_rate"
          currencyField="other_curr" markField="other_mark" require={false}
        />
      </Col>
    </Col>
  );
}

Fee.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 集装箱号、件数
export function ContainerNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData } = props;
  const containerNoProps = {
    outercol: 24,
    col: 4,
    field: 'container_no',
    label: msg('containerNo'),
    disabled: true,
    formData,
    getFieldDecorator,
  };
  return (
    <FormInput {...containerNoProps} />
  );
}

ContainerNo.propTypes = {
  intl: intlShape.isRequired,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

export function Pieces(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { formData, getFieldDecorator, required } = props;
  const packCountProps = {
    outercol: 24,
    col: 8,
    field: 'pack_count',
    label: msg('packCount'),
    disabled: true,
    formData,
    rules: [{ required }],
    getFieldDecorator,
  };
  return (
    <FormInput {...packCountProps} />
  );
}
Pieces.propTypes = {
  intl: intlShape.isRequired,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 包装、毛重、净重
export function PackWeight(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { formData, getFieldDecorator, formRequire, required } = props;
  const packProps = {
    outercol: 24,
    col: 8,
    label: msg('packType'),
    field: 'wrap_type',
    options: formRequire.packs,
    disabled: true,
    formData,
    rules: [{ required }],
    getFieldDecorator,
  };
  const grosswtProps = {
    outercol: 24,
    col: 8,
    field: 'gross_wt',
    label: msg('grosswt'),
    rules: [{ required: true }],
    addonAfter: 'KG',
    disabled: true,
    formData,
    getFieldDecorator,
  };
  const netwtProps = {
    outercol: 24,
    col: 8,
    field: 'net_wt',
    label: msg('netwt'),
    addonAfter: 'KG',
    disabled: true,
    formData,
    getFieldDecorator,
  };
  return (
    <Col span={16}>
      <Col span={8}>
        <FormLocalSearchSelect {...packProps} />
      </Col>
      <Col span={8}>
        <FormInput {...grosswtProps} />
      </Col>
      <Col span={8}>
        <FormInput {...netwtProps} />
      </Col>
    </Col>
  );
}

PackWeight.propTypes = {
  intl: intlShape.isRequired,
  required: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 特殊关系确认、价格影响确认、支付特许权使用费确认
export function TermConfirm(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { formData, getFieldDecorator } = props;
  const specialProps = {
    outercol: 24,
    col: 8,
    label: msg('specialRelation'),
    field: 'special_relation',
    disabled: true,
    formData,
    options: CMS_CONFIRM,
    getFieldDecorator,
  };
  const priceEffectProps = {
    outercol: 24,
    col: 8,
    label: msg('priceEffect'),
    field: 'price_effect',
    disabled: true,
    formData,
    getFieldDecorator,
    options: CMS_CONFIRM,
  };
  const paymentProps = {
    outercol: 24,
    col: 8,
    label: msg('paymentRoyalty'),
    field: 'payment_royalty',
    disabled: true,
    formData,
    getFieldDecorator,
    options: CMS_CONFIRM,
  };
  return (
    <Col span={24}>
      <Col span={6}>
        <FormLocalSearchSelect {...specialProps} />
      </Col>
      <Col span={6}>
        <FormLocalSearchSelect {...priceEffectProps} />
      </Col>
      <Col span={6}>
        <FormLocalSearchSelect {...paymentProps} />
      </Col>
    </Col>
  );
}

TermConfirm.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 关联报关单号 关联备案号
export function RaDeclManulNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData } = props;
  const raDeclNoProps = {
    outercol: 24,
    col: 8,
    field: 'ra_decl_no',
    label: msg('raDeclNo'),
    disabled: true,
    formData,
    getFieldDecorator,
  };
  const raManualNoProps = {
    outercol: 24,
    col: 8,
    field: 'ra_manual_no',
    label: msg('raManualNo'),
    disabled: true,
    formData,
    getFieldDecorator,
  };

  return (
    <Col span={12}>
      <Col span={12}>
        <FormInput {...raDeclNoProps} />
      </Col>
      <Col span={12}>
        <FormInput {...raManualNoProps} />
      </Col>
    </Col>
  );
}

RaDeclManulNo.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 保税/监管场所 货场代码
export function StoreYard(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { formData, getFieldDecorator } = props;
  const storeNoProps = {
    outercol: 24,
    col: 8,
    field: 'store_no',
    label: msg('storeNo'),
    disabled: true,
    formData,
    getFieldDecorator,
  };
  const yardCodeProps = {
    outercol: 24,
    col: 8,
    field: 'yard_code',
    label: msg('yardCode'),
    disabled: true,
    formData,
    getFieldDecorator,
  };
  return (
    <Col span={12}>
      <Col span={12}>
        <FormInput {...storeNoProps} />
      </Col>
      <Col span={12}>
        <FormInput {...yardCodeProps} />
      </Col>
    </Col>
  );
}

StoreYard.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};
