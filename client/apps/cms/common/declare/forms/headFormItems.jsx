import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Col, Form, Input, Select } from 'ant-ui';
import FormInput from './formInput';
import FormSelect from './formSelect';
import FormDatePicker from './formDatePicker';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

export function PortDate(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, ietype } = props;
  const portProps = {
    outercol: 8,
    col: 8,
    field: 'i_e_port',
    rules: [{ required: true }],
    options: formRequire.ports.map(port => ({
      value: port.port_code,
      text: port.port_c_cod,
    })),
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    disabled,
    formData,
    getFieldProps,
  };
  const ieDateProps = {
    outercol: 8,
    col: 8,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    rules: [{ required: true, type: 'date' }],
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
    <Col span="12">
      <FormSelect {...portProps} />
      <FormDatePicker { ...ieDateProps } />
      <FormDatePicker { ...dDateProps } />
    </Col>
  );
}
PortDate.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf([ 'import', 'export' ]),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function RelationAutoCompSelect(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const {
    label, codeField, nameField, formData, disabled, options,
    getFieldProps, codeRules, nameRules, onSearch, onSelect,
  } = props;
  function handleSearch(value) {
    if (onSearch) {
      onSearch(codeField, value);
    }
  }
  function handleSelect(value) {
    if (onSelect) {
      onSelect(codeField, nameField, value);
    }
  }
  return (
    <Col span="12">
      <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={label} required>
        <InputGroup { ...getFieldProps(codeField, { rules: codeRules })}>
          <Col span="12">
            <Select combobox showArrow={false} filterOption={false} disabled={disabled}
              defaultActiveFirstOption={false} allowClear
              placeholder={msg('relationCodeSearch')} {
                ...getFieldProps(codeField, {
                  rules: codeRules,
                  initialValue: formData && formData[codeField],
                })
              } onSearch={handleSearch} onSelect={handleSelect}>
              {
                options.map(opt => <Option key={opt.code}>{opt.code}</Option>)
              }
            </Select>
          </Col>
          <Col span="12">
            <Input placeholder={msg('relationName')} disabled={disabled}
            {...getFieldProps(nameField, {
              rules: nameRules,
              initialValue: formData && formData[nameField],
            })} disabled={disabled} />
          </Col>
        </InputGroup>
      </FormItem>
    </Col>
  );
}

RelationAutoCompSelect.propTypes = {
  label: PropTypes.string.isRequired,
  codeField: PropTypes.string.isRequired,
  nameField: PropTypes.string.isRequired,
  formData: PropTypes.object,
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  codeRules: PropTypes.array,
  nameRules: PropTypes.array,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
};

export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire } = props;
  const modeProps = {
    outercol: 8,
    col: 8,
    field: 'trans_mode',
    options: formRequire.transModes.map(tm => ({
      value: tm.trans_code,
      text: tm.trans_spec,
    })),
    label: msg('transMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const modeNameProps = {
    outercol: 8,
    col: 8,
    field: 'trans_mode_name',
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
    <Col span="12">
      <FormSelect { ...modeProps } />
      <FormInput { ...modeNameProps} />
      <FormInput { ...blwbProps} />
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

export function TradeRemission(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire } = props;
  const tradeModeProps = {
    outercol: 8,
    col: 8,
    field: 'trade_mode',
    options: formRequire.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: tm.trade_spec,
    })),
    label: msg('tradeMode'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  const remissionProps = {
    outercol: 8,
    col: 8,
    field: 'rm_modes',
    options: formRequire.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: rm.rm_spec,
    })),
    label: msg('rmModeName'),
    disabled,
    formData,
    getFieldProps,
  };
  const emsNoProps = {
    outercol: 8,
    col: 8,
    field: 'ems_no',
    label: msg('emsNo'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="12">
      <FormSelect { ...tradeModeProps } />
      <FormSelect { ...remissionProps} />
      <FormInput { ...emsNoProps} />
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

export function CountryAttr(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, ietype } = props;
  const tradeCountryProps = {
    outercol: 12,
    col: 6,
    field: 'trade_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    label: msg('tradeCountry'),
    rules: [{ required: true, }],
    disabled,
    formData,
    getFieldProps,
  };
  const departCountryProps = {
    outercol: 12,
    col: 6,
    field: 'depart_country',
    options: formRequire.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    label: ietype === 'import' ? msg('departCountry') : msg('destinateCountry'),
    rules: [{ required: true, }],
    disabled,
    formData,
    getFieldProps,
  };
  const licenseNoProps = {
    outercol: 12,
    col: 6,
    field: 'license_no',
    label: msg('licenseNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const trxModeProps = {
    outercol: 12,
    col: 6,
    field: 'trx_mode',
    options: formRequire.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: tm.trx_spec,
    })),
    label: msg('trxMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const contractNoProps = {
    outercol: 12,
    col: 6,
    field: 'contract_no',
    label: msg('contractNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const packCountProps = {
    outercol: 12,
    col: 6,
    field: 'pack_count',
    label: msg('packCount'),
    disabled,
    formData,
    getFieldProps,
  };
  const containerNoProps = {
    outercol: 12,
    col: 6,
    field: 'container_no',
    label: msg('containerNo'),
    disabled,
    formData,
    getFieldProps,
  };
  const usageProps = {
    outercol: 12,
    col: 6,
    field: 'usage',
    label: msg('usage'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="12">
      <FormSelect { ...tradeCountryProps } />
      <FormSelect { ...departCountryProps } />
      <FormInput { ...licenseNoProps } />
      <FormSelect { ...trxModeProps } />
      <FormInput { ...contractNoProps } />
      <FormInput { ...packCountProps } />
      <FormInput { ...containerNoProps } />
      <FormInput { ...usageProps } />
    </Col>
  );
}

CountryAttr.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf([ 'import', 'export' ]),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

export function DestInvoice(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire, type, ietype } = props;
  const destPortProps = {
    outercol: 12,
    col: 8,
    field: 'dest_port',
    options: formRequire.ports.map(port => ({
      value: port.port_code,
      text: port.port_c_cod,
    })),
    label: ietype === 'import' ? msg('iDestinatePort') : msg('eDestinatePort'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  const districtProps = {
    outercol: 12,
    col: 8,
    field: 'district_code',
    options: formRequire.districts.map(dist => ({
      value: dist.district_code,
      text: dist.district_name,
    })),
    label: ietype === 'import' ? msg('iDistrict') : msg('eDistrict'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
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
    <Col span="12">
      <FormSelect { ...destPortProps } />
      <FormSelect { ...districtProps } />
      { type === 'bill' && <FormInput { ...invoiceNoProps} /> }
    </Col>
  );
}

DestInvoice.propTypes = {
  intl: intlShape.isRequired,
  ietype: PropTypes.oneOf([ 'import', 'export' ]),
  type: PropTypes.oneOf([ 'bill', 'entry' ]),
  disabled: PropTypes.bool,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  formRequire: PropTypes.object.isRequired,
};

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
    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label={label}>
      <InputGroup>
        <Col span="12">
          <FormInput {...feeProps} />
        </Col>
        <Col span="12">
          <FormSelect {...currencyProps} />
        </Col>
      </InputGroup>
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
    <Col span="12">
      <Col span="8">
        <FeeFormItem {...props} label={msg('freightCharge')} feeField="fee_rate"
          currencyField="fee_curr" />
      </Col>
      <Col span="8">
        <FeeFormItem {...props} label={msg('insurance')} feeField="insur_rate"
          currencyField="insur_curr" />
      </Col>
      <Col span="8">
        <FeeFormItem {...props} label={msg('sundry')} feeField="other_rate"
          currencyField="other_curr" />
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

export function PackWeight(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { disabled, formData, getFieldProps, formRequire } = props;
  const packProps = {
    outercol: 8,
    col: 6,
    label: msg('packType'),
    field: 'pack_type',
    options: formRequire.packs,
    disabled,
    formData,
    getFieldProps,
  };
  const grosswtProps = {
    outercol: 8,
    col: 10,
    field: 'gross_wt',
    label: msg('grosswt'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  const netwtProps = {
    outercol: 8,
    col: 10,
    field: 'net_wt',
    label: msg('netwt'),
    rules: [{ required: true }],
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="12">
      <FormSelect {...packProps} />
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
