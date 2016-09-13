/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select } from 'antd';
import FormInput from './formInput';
import { FormLocalSearchSelect, FormRemoteSearchSelect } from './formSelect';
import FormDatePicker from './formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const Option = Select.Option;

// 进出口口岸、进出口日期、申报日期
export function PortDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, ietype } = props;
  const customsProps = {
    outercol: 8,
    col: 8,
    field: 'i_e_port',
    rules: [{ required: false }],
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const ieDateProps = {
    outercol: 8,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    rules: [{ required: false, type: 'date' }],
    disabled,
    formData,
    getFieldProps,
  };
  const dDateProps = {
    outercol: 8,
    col: 8,
    field: 'd_date',
    label: msg('ddate'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="15">
      <FormLocalSearchSelect {...customsProps} />
      <FormDatePicker {...ieDateProps} />
      <FormDatePicker {...dDateProps} />
    </Col>
  );
}
PortDate.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

// 关联单位
export class RelationAutoCompSelect extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    codeField: PropTypes.string.isRequired,
    nameField: PropTypes.string.isRequired,
    formData: PropTypes.object,
    disabled: PropTypes.bool,
    getFieldProps: PropTypes.func.isRequired,
    codeRules: PropTypes.array,
    nameRules: PropTypes.array,
    onSelect: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  handleSelect = (value) => {
    const { onSelect, codeField, nameField } = this.props;
    if (onSelect) {
      onSelect(codeField, nameField, value);
    }
  }
  handleInputChange = (value) => {
    const { onChange, codeField, nameField } = this.props;
    if (onChange) {
      onChange(codeField, nameField, value);
    }
  }
  render() {
    const {
      label, codeField, nameField, formData, disabled, options,
      getFieldProps, codeRules, nameRules,
    } = this.props;
    return (
      <Col span="9">
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={label} required>
          <Row>
            <Col span="12" style={{ paddingRight: 2 }}>
              <Select size="large" combobox showArrow={false} disabled={disabled}
                allowClear optionFilterProp="search"
                placeholder={this.msg('relationCodeSearch')} {
                  ...getFieldProps(codeField, {
                    rules: codeRules,
                    onChange: this.handleInputChange,
                    initialValue: formData && formData[codeField] || '',
                  })
                } onSelect={this.handleSelect}
              >
                {
                  options.map(opt => <Option key={opt.code} search={opt.code}>{opt.code}</Option>)
                }
              </Select>
            </Col>
            <Col span="12">
              <Input placeholder={this.msg('relationName')} disabled={disabled}
                {...getFieldProps(nameField, {
                  rules: nameRules,
                  initialValue: formData && formData[nameField],
                })}
              />
            </Col>
          </Row>
        </FormItem>
      </Col>
    );
  }
}

// 运输方式、运输名称、提运单号
export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire } = props;
  const modeProps = {
    outercol: 8,
    col: 8,
    field: 'traf_mode',
    options: formRequire.transModes.map(tm => ({
      value: tm.trans_code,
      text: `${tm.trans_code} | ${tm.trans_spec}`,
    })),
    label: msg('transMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const modeNameProps = {
    outercol: 8,
    col: 8,
    field: 'traf_name',
    label: msg('transModeName'),
    disabled,
    formData,
    getFieldProps,
  };
  const blwbProps = {
    outercol: 8,
    col: 8,
    field: 'bl_wb_no',
    label: msg('ladingWayBill'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="15">
      <FormLocalSearchSelect {...modeProps} />
      <FormInput {...modeNameProps} />
      <FormInput {...blwbProps} />
    </Col>
  );
}
Transport.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 监管方式、征免性质、备案号
export function TradeRemission(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire } = props;
  const tradeModeProps = {
    outercol: 8,
    col: 8,
    field: 'trade_mode',
    options: formRequire.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: `${tm.trade_mode} | ${tm.trade_abbr}`,
    })),
    label: msg('tradeMode'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const remissionProps = {
    outercol: 8,
    col: 8,
    field: 'cut_mode',
    options: formRequire.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: `${rm.rm_mode} | ${rm.rm_spec}`,
    })),
    label: msg('rmModeName'),
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const emsNoProps = {
    outercol: 8,
    col: 8,
    field: 'manual_no',
    label: msg('emsNo'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="15">
      <FormLocalSearchSelect {...tradeModeProps} />
      <FormLocalSearchSelect {...remissionProps} />
      <FormInput {...emsNoProps} />
    </Col>
  );
}
TradeRemission.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 贸易国、起运国、许可证号、成交方式、合同号、件数、集装箱号、用途
export function CountryAttr(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, ietype } = props;
  const tradeCountryProps = {
    outercol: 12,
    col: 8,
    field: 'trade_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
    })),
    label: msg('tradeCountry'),
    rules: [{ required: false }],
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const departCountryProps = {
    outercol: 12,
    col: 8,
    field: 'dept_dest_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
    })),
    label: ietype === 'import' ? msg('departCountry') : msg('destinateCountry'),
    rules: [{ required: false }],
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const licenseNoProps = {
    outercol: 12,
    col: 8,
    field: 'license_no',
    label: msg('licenseNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const trxModeProps = {
    outercol: 12,
    col: 8,
    field: 'trxn_mode',
    options: formRequire.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: tm.trx_spec,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const contractNoProps = {
    outercol: 12,
    col: 8,
    field: 'contr_no',
    label: msg('contractNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const packCountProps = {
    outercol: 12,
    col: 8,
    field: 'pack_count',
    label: msg('packCount'),
    disabled,
    formData,
    getFieldProps,
  };
  const containerNoProps = {
    outercol: 12,
    col: 8,
    field: 'container_no',
    label: msg('containerNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const usageProps = {
    outercol: 12,
    col: 8,
    field: 'usage',
    label: msg('usage'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="9">
      <FormLocalSearchSelect {...tradeCountryProps} />
      <FormLocalSearchSelect {...departCountryProps} />
      <FormInput {...licenseNoProps} />
      <FormLocalSearchSelect {...trxModeProps} />
      <FormInput {...contractNoProps} />
      <FormInput {...packCountProps} />
      <FormInput {...containerNoProps} />
      <FormInput {...usageProps} />
    </Col>
  );
}

CountryAttr.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 装货港、境内目的地、发票号
export function DestInvoice(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, type, ietype, onSearch } = props;
  const destPortProps = {
    outercol: 8,
    col: 8,
    field: 'dept_dest_port',
    options: formRequire.ports.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_c_cod}`,
    })),
    label: ietype === 'import' ? msg('iDestinatePort') : msg('eDestinatePort'),
    rules: [{ required: false }],
    disabled,
    formData,
    getFieldProps,
    onSearch,
  };
  const districtProps = {
    outercol: 8,
    col: 8,
    field: 'district_code',
    options: formRequire.districts.map(dist => ({
      value: dist.district_code,
      text: `${dist.district_code} | ${dist.district_name}`,
    })),
    label: ietype === 'import' ? msg('iDistrict') : msg('eDistrict'),
    rules: [{ required: false }],
    disabled,
    formData,
    getFieldProps,
    searchKeyFn: opt => opt.value,
  };
  const invoiceNoProps = {
    outercol: 8,
    col: 8,
    field: 'invoice_no',
    label: msg('invoiceNo'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="15">
      <FormRemoteSearchSelect {...destPortProps} />
      <FormLocalSearchSelect {...districtProps} />
      {type === 'bill' && <FormInput {...invoiceNoProps} />}
    </Col>
  );
}

DestInvoice.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  type: PropTypes.oneOf(['bill', 'entry']),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

// 费用
function FeeFormItem(props) {
  const { feeField, currencyField, label, disabled, formData, getFieldProps, formRequire } = props;
  const feeProps = {
    field: feeField,
    disabled,
    formData,
    getFieldProps,
  };
  const currencyProps = {
    field: currencyField,
    options: formRequire.currencies.map(curr => ({
      value: curr.curr_code,
      text: curr.curr_name,
    })),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label={label}>
      <Row>
        <Col span="12">
          <FormInput {...feeProps} style={{ marginBottom: 0 }} />
        </Col>
        <Col span="12" style={{ paddingLeft: 2 }}>
          <FormLocalSearchSelect {...currencyProps} style={{ marginBottom: 0 }} />
        </Col>
      </Row>
    </FormItem>
  );
}

FeeFormItem.propTypes = {
  feeField: PropTypes.string.isRequired,
  currencyField: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function Fee(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  return (
    <Col span="15">
      <Col span="8">
        <FeeFormItem {...props} label={msg('freightCharge')} feeField="fee_rate"
          currencyField="fee_curr"
        />
      </Col>
      <Col span="8">
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr"
        />
      </Col>
      <Col span="8">
        <FeeFormItem {...props} label={msg('sundry')} feeField="other_rate"
          currencyField="other_curr"
        />
      </Col>
    </Col>
  );
}

Fee.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 包装、毛重、净重
export function PackWeight(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { disabled, formData, getFieldProps, formRequire } = props;
  const packProps = {
    outercol: 8,
    col: 8,
    label: msg('packType'),
    field: 'wrap_type',
    options: formRequire.packs,
    disabled,
    formData,
    getFieldProps,
  };
  const grosswtProps = {
    outercol: 8,
    col: 8,
    field: 'gross_wt',
    label: msg('grosswt'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  const netwtProps = {
    outercol: 8,
    col: 8,
    field: 'net_wt',
    label: msg('netwt'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="15">
      <FormLocalSearchSelect {...packProps} />
      <FormInput {...grosswtProps} />
      <FormInput {...netwtProps} />
    </Col>
  );
}

PackWeight.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};
