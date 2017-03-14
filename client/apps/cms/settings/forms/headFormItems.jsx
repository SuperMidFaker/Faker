/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select, Tooltip } from 'antd';
import FormInput from './formInput';
import { FormLocalSearchSelect, FormRemoteSearchSelect } from './formSelect';
import FormDatePicker from './formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_FEE_UNIT } from 'common/constants';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

// 进出口口岸、进出口日期、申报日期
export function PortDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire, ietype } = props;
  const customsProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_port',
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const ieDateProps = {
    outercol: 24,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    formData,
    getFieldDecorator,
  };
  const dDateProps = {
    outercol: 24,
    col: 8,
    field: 'd_date',
    label: msg('ddate'),
    rules: [{ required: false }],
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
      label, codeField, nameField, formData, options,
      getFieldDecorator, codeRules, nameRules,
    } = this.props;
    const initialCodeValue = formData && formData[codeField] || '';
    const initialNameValue = formData && formData[nameField];
    return (
      <Col md={24} lg={9}>
        <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={label}>
          <Row>
            <Col span="12">
              <FormItem style={{ marginBottom: 0 }}>
                {getFieldDecorator(codeField, {
                  initialValue: initialCodeValue,
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
                    options.map(opt => <Option key={opt.code} search={opt.code}><Tooltip placement="right" title={opt.name}>{opt.code}|{opt.name}</Tooltip></Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem style={{ marginBottom: 0 }} >
                {getFieldDecorator(nameField, {
                  rules: nameRules,
                  initialValue: initialNameValue,
                })(<Input placeholder={this.msg('relationName')} />)}
              </FormItem>
            </Col>
          </Row>
        </FormItem>
      </Col>
    );
  }
}

// 申报地海关、许可证号、合同协议号
export function DeclCustoms(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire } = props;
  const declPortProps = {
    outercol: 24,
    col: 8,
    field: 'decl_port',
    label: msg('declPort'),
    formData,
    getFieldDecorator,
    options: formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    searchKeyFn: opt => opt.value,
  };
  const licenseNoProps = {
    outercol: 24,
    col: 8,
    field: 'license_no',
    label: msg('licenseNo'),
    formData,
    getFieldDecorator,
  };
  const contractNoProps = {
    outercol: 24,
    col: 8,
    field: 'contr_no',
    label: msg('contractNo'),
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormLocalSearchSelect {...declPortProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...licenseNoProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...contractNoProps} />
      </Col>
    </Col>
  );
}
DeclCustoms.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 运输方式、运输名称
export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire } = props;
  const modeProps = {
    outercol: 24,
    col: 8,
    field: 'traf_mode',
    options: formRequire.transModes.map(tm => ({
      value: tm.trans_code,
      text: `${tm.trans_code} | ${tm.trans_spec}`,
    })),
    label: msg('transMode'),
    formData,
    getFieldDecorator,
  };
  const modeNameProps = {
    outercol: 24,
    col: 8,
    field: 'traf_name',
    label: msg('transModeName'),
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormLocalSearchSelect {...modeProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormInput {...modeNameProps} />
      </Col>
    </Col>
  );
}
Transport.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 提运单号、航次号
export function DelVoyageNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData } = props;
  const blwbProps = {
    outercol: 24,
    col: 8,
    field: 'bl_wb_no',
    label: msg('ladingWayBill'),
    formData,
    getFieldDecorator,
  };
  const voyageNoProps = {
    outercol: 24,
    col: 8,
    field: 'voyage_no',
    label: msg('voyageNo'),
    formData,
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormInput {...voyageNoProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...blwbProps} />
      </Col>
    </Col>
  );
}
DelVoyageNo.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

// 监管方式、征免性质、备案号
export function TradeRemission(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire } = props;
  const tradeModeProps = {
    outercol: 24,
    col: 8,
    field: 'trade_mode',
    options: formRequire.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: `${tm.trade_mode} | ${tm.trade_abbr}`,
    })),
    label: msg('tradeMode'),
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
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const emsNoProps = {
    outercol: 24,
    col: 8,
    field: 'manual_no',
    label: msg('emsNo'),
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
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 贸易国、起运国
export function CountryAttr(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire, ietype } = props;
  const tradeCountryProps = {
    outercol: 24,
    col: 8,
    field: 'trade_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: `${tc.cntry_co} | ${tc.cntry_name_cn}`,
    })),
    label: msg('tradeCountry'),
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
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 装货港、境内目的地、发票号
export function DestInvoice(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire, ietype, onSearch } = props;
  const destPortProps = {
    outercol: 24,
    col: 8,
    field: 'dept_dest_port',
    options: formRequire.ports.map(port => ({
      value: port.port_code,
      text: `${port.port_code} | ${port.port_c_cod}`,
    })),
    label: ietype === 'import' ? msg('iDestinatePort') : msg('eDestinatePort'),
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
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const invoiceNoProps = {
    outercol: 24,
    col: 8,
    field: 'invoice_no',
    label: msg('invoiceNo'),
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
      <Col sm={24} md={8}>
        <FormInput {...invoiceNoProps} />
      </Col>
    </Col>
  );
}

DestInvoice.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf(['import', 'export']),
  type: PropTypes.oneOf(['bill', 'entry']),
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

// 用途、成交方式
export function UsageTrade(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, formData, formRequire } = props;
  const usageProps = {
    outercol: 24,
    col: 8,
    field: 'usage',
    label: msg('usage'),
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
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormInput {...usageProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormLocalSearchSelect {...trxModeProps} />
      </Col>
    </Col>
  );
}

UsageTrade.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 费用
function FeeFormItem(props) {
  const { feeField, currencyField, markField, label, formData,
    getFieldDecorator, formRequire } = props;
  formRequire.currencies.unshift({ curr_code: -1, curr_name: '[空]' });
  const feeProps = {
    field: feeField,
    formData,
    getFieldDecorator,
  };
  const currencyProps = {
    field: currencyField,
    options: formRequire.currencies.map(curr => ({
      value: curr.curr_code,
      text: `${curr.curr_code} | ${curr.curr_name}`,
    })),
    formData,
    getFieldDecorator,
    searchKeyFn: opt => opt.value,
  };
  const markProps = {
    field: markField,
    formData,
    getFieldDecorator,
    options: CMS_FEE_UNIT,
  };
  return (
    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label={label}>
      <Row>
        <Col sm={24} md={12} style={{ paddingLeft: 2 }}>
          <FormLocalSearchSelect {...currencyProps} placeholder="币制" style={{ marginBottom: 0 }} />
        </Col>
        <Col sm={24} md={6}>
          <FormInput {...feeProps} />
        </Col>
        <Col sm={24} md={6}>
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
          currencyField="fee_curr" markField="fee_mark"
        />
      </Col>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr" markField="insur_mark"
        />
      </Col>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('sundry')} feeField="other_rate"
          currencyField="other_curr" markField="other_mark"
        />
      </Col>
    </Col>
  );
}

Fee.propTypes = {
  intl: intlShape.isRequired,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

