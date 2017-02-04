/* eslint react/no-multi-comp: 0 */
import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Row, Col, Form, Input, Select } from 'antd';
import FormInput from './formInput';
import { FormLocalSearchSelect, FormRemoteSearchSelect } from './formSelect';
import FormDatePicker from './formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_FEE_UNIT, CMS_CONFIRM } from 'common/constants';

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
    rules: [{ required: true }],
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
              <FormItem style={{ marginBottom: 0 }}>
                {disabled ?
                  <Input disabled value={initialCodeValue} />
                  : getFieldDecorator(codeField, {
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
                    initialValue: initialNameValue,
                  })(<Input placeholder={this.msg('relationName')} disabled={disabled} />)}
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
  const { getFieldDecorator, disabled, formData, formRequire } = props;
  const declPortProps = {
    outercol: 24,
    col: 8,
    field: 'decl_port',
    label: msg('declPort'),
    rules: [{ required: true }],
    disabled,
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
    disabled,
    formData,
    getFieldDecorator,
  };
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
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 运输方式、运输名称
export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, getFieldValue, disabled, formData, formRequire } = props;
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
    rules: [{ required: true }],
    getFieldDecorator,
  };
  const modeNameProps = {
    outercol: 24,
    col: 8,
    field: 'traf_name',
    label: msg('transModeName'),
    rules: getFieldValue('traf_mode') === '2' ? [{ required: true }] : [{ required: false }],
    disabled,
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
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 提运单号、航次号
export function DelVoyageNo(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, getFieldValue, disabled, formData } = props;
  const trafMode = getFieldValue('traf_mode') === '2' || getFieldValue('traf_mode') === '5';
  const blwbProps = {
    outercol: 24,
    col: 8,
    field: 'bl_wb_no',
    label: msg('ladingWayBill'),
    disabled,
    formData,
    rules: trafMode ? [{ required: true }] : [{ required: false }],
    getFieldDecorator,
  };
  const voyageNoProps = {
    outercol: 24,
    col: 8,
    field: 'voyage_no',
    label: msg('voyageNo'),
    disabled,
    formData,
    rules: getFieldValue('traf_mode') === '2' ? [{ required: true }] : [{ required: false }],
    getFieldDecorator,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FormInput {...blwbProps} />
      </Col>
      <Col sm={24} md={8}>
        <FormInput {...voyageNoProps} />
      </Col>
    </Col>
  );
}
DelVoyageNo.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  getFieldValue: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
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
  const declWay = formData.decl_way_code !== '0102' && formData.decl_way_code !== '0103';
  const remissionProps = {
    outercol: 24,
    col: 8,
    field: 'cut_mode',
    options: formRequire.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: `${rm.rm_mode} | ${rm.rm_spec}`,
    })),
    rules: declWay ? [{ required: true }] : [{ required: false }],
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

// 贸易国、起运国
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
    disabled,
    formData,
    rules: [{ required: true }],
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
    disabled,
    formData,
    rules: [{ required: true }],
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
    rules: [{ required: true }],
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
    rules: [{ required: true }],
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

// 用途、成交方式
export function UsageTrade(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldDecorator, disabled, formData, formRequire } = props;
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
      text: tm.trx_spec,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    rules: [{ required: true }],
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
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

// 费用
function FeeFormItem(props) {
  const { feeField, currencyField, markField, label, disabled, formData,
    getFieldDecorator, formRequire, require, feeCurrReq, insurCurrReq } = props;
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
    rules: require ? [{ required: true }] : [{ required: false }],
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
    rules: currReq ? [{ required: true }] : [{ required: false }],
    getFieldDecorator,
  };
  const markProps = {
    field: markField,
    disabled,
    formData,
    rules: require ? [{ required: true }] : [{ required: false }],
    getFieldDecorator,
    options: CMS_FEE_UNIT,
  };
  return (
    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label={label}>
      <Row>
        <Col sm={24} md={8} style={{ paddingLeft: 2 }}>
          <FormLocalSearchSelect {...currencyProps} placeholder="币制" style={{ marginBottom: 0 }} />
        </Col>
        <Col sm={24} md={8}>
          <FormInput {...feeProps} />
        </Col>
        <Col sm={24} md={8}>
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
    <Col md={24} lg={15}>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('freightCharge')} feeField="fee_rate"
          currencyField="fee_curr" markField="fee_mark" require={fobRequire || ciRequire} feeCurrReq={feeCurrReq}
        />
      </Col>
      <Col sm={24} md={8}>
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr" markField="insur_mark" require={fobRequire} insurCurrReq={insurCurrReq}
        />
      </Col>
      <Col sm={24} md={8}>
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
  const packCountProps = {
    outercol: 24,
    col: 8,
    field: 'pack_count',
    label: msg('packCount'),
    disabled,
    formData,
    rules: [{ required: true }],
    getFieldDecorator,
  };

  return (
    <Col md={24} lg={9}>
      <Col sm={24} md={12}>
        <FormInput {...containerNoProps} />
      </Col>
      <Col sm={24} md={12}>
        <FormInput {...packCountProps} />
      </Col>
    </Col>
  );
}

ContainerNo.propTypes = {
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
    rules: [{ required: true }],
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

// 特殊关系确认、价格影响确认、支付特许权使用费确认
export function TermConfirm(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { disabled, formData, getFieldDecorator } = props;
  const specialProps = {
    outercol: 24,
    col: 8,
    label: msg('specialRelation'),
    field: 'special_relation',
    disabled,
    formData,
    options: CMS_CONFIRM,
    getFieldDecorator,
  };
  const priceEffectProps = {
    outercol: 24,
    col: 8,
    label: msg('priceEffect'),
    field: 'price_effect',
    disabled,
    formData,
    getFieldDecorator,
    options: CMS_CONFIRM,
  };
  const paymentProps = {
    outercol: 24,
    col: 8,
    label: msg('paymentRoyalty'),
    field: 'payment_royalty',
    disabled,
    formData,
    getFieldDecorator,
    options: CMS_CONFIRM,
  };
  return (
    <Col md={24} lg={15}>
      <Col sm={24} lg={8}>
        <FormLocalSearchSelect {...specialProps} />
      </Col>
      <Col sm={24} lg={8}>
        <FormLocalSearchSelect {...priceEffectProps} />
      </Col>
      <Col sm={24} lg={8}>
        <FormLocalSearchSelect {...paymentProps} />
      </Col>
    </Col>
  );
}

TermConfirm.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  getFieldDecorator: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};
