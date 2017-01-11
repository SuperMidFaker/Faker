/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select } from 'antd';
import FormInput from './formInput';
import { FormLocalSearchSelect, FormRemoteSearchSelect } from './formSelect';
import FormDatePicker from './formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

// 进出口口岸、进出口日期、申报日期
export function PortDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, ietype } = props;
  const customsProps = {
    outercol: 24,
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
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const ieDateProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    disabled,
    formData,
    getFieldDecorator,
  };
  const dDateProps = {
    outercol: 24,
    col: 8,
    field: 'd_date',
    label: msg('ddate'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...customsProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormDatePicker {...ieDateProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormDatePicker {...dDateProps} />
      </Col>
    </Col>
  );
}
PortDate.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
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
      getFieldDecorator, codeRules, nameRules,
    } = this.props;
    const initialCodeValue = formData && formData[codeField] || '';
    const initialNameValue = formData && formData[nameField];
    return (
      <Col md={24} lg={9}>
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={label} required>
          <Row>
            <Col span="8">
              <FormItem>
                {disabled ?
                  <Input disabled value={initialCodeValue} />
                  : getFieldDecorator(codeField, {
                    rules: codeRules,
                    onChange: this.handleInputChange,
                  })(<Select
                    size="large"
                    combobox
                    showArrow={false}
                    allowClear
                    optionFilterProp="search"
                    placeholder={this.msg('relationCodeSearch')}
                    onSelect={this.handleSelect}
                  >
                    {
                    options.map(opt => <Option key={opt.code} search={opt.code}>{opt.code}</Option>)
                  }
                  </Select>)}
              </FormItem>
            </Col>
            <Col span="16">
              <FormItem style={{ marginBottom: 0 }} >
                {disabled ?
                  <Input disabled value={initialNameValue} /> :
                  getFieldDecorator(nameField, {
                    rules: nameRules,
                  })(<Input placeholder={this.msg('relationName')} disabled={disabled} />)}
              </FormItem>
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
  const { getFieldDecorator, disabled, formData, formRequire } = props;
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
    getFieldDecorator,
  };
  const modeNameProps = {
    outercol: 24,
    col: 8,
    field: 'traf_name',
    label: msg('transModeName'),
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
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...modeProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...modeNameProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...blwbProps} />
      </Col>
    </Col>
  );
}
Transport.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 监管方式、征免性质、备案号
export function TradeRemission(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire } = props;
  const tradeModeProps = {
    outercol: 24,
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
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const remissionProps = {
    outercol: 24,
    col: 8,
    field: 'cut_mode',
    options: formRequire.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: `${rm.rm_mode} | ${rm.rm_spec}`,
    })),
    label: msg('rmModeName'),
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
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
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...tradeModeProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...remissionProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...emsNoProps} />
      </Col>
    </Col>
  );
}
TradeRemission.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 贸易国、起运国、许可证号、成交方式、合同号、件数、集装箱号、用途
export function CountryAttr(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, ietype } = props;
  const tradeCountryProps = {
    outercol: 24,
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
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const departCountryProps = {
    outercol: 24,
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
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormLocalSearchSelect {...tradeCountryProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormLocalSearchSelect {...departCountryProps} />
      </Col>
    </Col>
  );
}

CountryAttr.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 装货港、境内目的地、发票号
export function DestInvoice(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire, type, ietype, onSearch } = props;
  const destPortProps = {
    outercol: 24,
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
    rules: [{ required: false }],
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const invoiceNoProps = {
    outercol: 24,
    col: 8,
    field: 'invoice_no',
    label: msg('invoiceNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormRemoteSearchSelect {...destPortProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...districtProps} />
      </Col>
      {type === 'bill' && <Col sm={24} md={8}><FormInput {...invoiceNoProps} /></Col>}
    </Col>
  );
}

DestInvoice.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  type: PropTypes.oneOf(['bill', 'entry']),
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export function LicenseTrade(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire } = props;
  const licenseNoProps = {
    outercol: 24,
    col: 8,
    field: 'license_no',
    label: msg('licenseNo'),
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
      text: tm.trx_spec,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormInput {...licenseNoProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormLocalSearchSelect {...trxModeProps} />
      </Col>
    </Col>
  );
}

LicenseTrade.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 费用
function FeeFormItem(props) {
  const { feeField, currencyField, label, disabled, formData, getFieldDecorator, formRequire } = props;
  const feeProps = {
    field: feeField,
    disabled,
    formData,
    getFieldDecorator,
  };
  const currencyProps = {
    field: currencyField,
    options: formRequire.currencies.map(curr => ({
      value: curr.curr_code,
      text: curr.curr_name,
    })),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label={label}>
      <Row>
        <Col sm={24} md={12}>
          <FormInput {...feeProps} style={{ marginBottom: 0 }} />
        </Col>
        <Col sm={24} md={12} style={{ paddingLeft: 2 }}>
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
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function Fee(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('freightCharge')} feeField="fee_rate"
          currencyField="fee_curr"
        />
      </Col>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr"
        />
      </Col>
      <Col sm={24} md={8}>
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
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
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
  const packCountProps = {
    outercol: 24,
    col: 8,
    field: 'pack_count',
    label: msg('packCount'),
    disabled,
    formData,
    getFieldDecorator,
  };

  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormInput {...contractNoProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormInput {...packCountProps} />
      </Col>
    </Col>
  );
}

ContractNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 包装、毛重、净重
export function PackWeight(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { disabled, formData, getFieldDecorator, formRequire } = props;
  const packProps = {
    outercol: 24,
    col: 8,
    label: msg('packType'),
    field: 'wrap_type',
    options: formRequire.packs,
    disabled,
    formData,
    getFieldDecorator,
  };
  const grosswtProps = {
    outercol: 24,
    col: 8,
    field: 'gross_wt',
    label: msg('grosswt'),
    rules: [{ required: true }],
    addonAfter: 'KG',
    disabled,
    formData,
    getFieldDecorator,
  };
  const netwtProps = {
    outercol: 24,
    col: 8,
    field: 'net_wt',
    label: msg('netwt'),
    rules: [{ required: true }],
    addonAfter: 'KG',
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} lg={8}>
        <FormLocalSearchSelect {...packProps} />
      </Col>
      <Col sm={24} lg={8}>
        <FormInput {...grosswtProps} />
      </Col>
      <Col sm={24} lg={8}>
        <FormInput {...netwtProps} />
      </Col>
    </Col>
  );
}

PackWeight.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 贸易国、起运国、许可证号、成交方式、合同号、件数、集装箱号、用途
export function ContainerUsage(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData } = props;


  const containerNoProps = {
    outercol: 24,
    col: 8,
    field: 'container_no',
    label: msg('containerNo'),
    disabled,
    formData,
    getFieldDecorator,
  };
  const usageProps = {
    outercol: 24,
    col: 8,
    field: 'usage',
    label: msg('usage'),
    disabled,
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormInput {...containerNoProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormInput {...usageProps} />
      </Col>
    </Col>
  );
}

ContainerUsage.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};
