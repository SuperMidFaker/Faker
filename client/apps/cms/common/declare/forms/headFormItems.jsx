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
    col: 6,
    field: 'i_e_port',
    options: formRequire.ports,
    label: ietype === 'import' ? msg('iport') : msg('eport'),
    disabled,
    formData,
    getFieldProps,
  };
  const ieDateProps = {
    outercol: 8,
    col: 6,
    field: 'i_e_date',
    label: ietype === 'import' ? msg('idate') : msg('edate'),
    disabled,
    formData,
    getFieldProps,
  };
  const dDateProps = {
    outercol: 8,
    col: 6,
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
      onSelect(value);
    }
  }
  return (
    <Col span="12">
      <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={label}>
        <InputGroup>
          <Col span="12">
            <Select combobox showArrow={false} filterOption={false} disabled={disabled}
              defaultActiveFirstOption={false}
              placeholder={msg('relationCodeSearch')} {
                ...getFieldProps(codeField, {
                  rules: codeRules,
                  initialValue: formData && formData[codeField],
                })
              } onSearch={handleSearch} onSelect={handleSelect}>
              {
                options.map(opt => <Option key={opt.value}>{opt.value}</Option>)
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
    col: 6,
    field: 'trans_mode',
    options: formRequire.transModes,
    label: msg('transMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const modeNameProps = {
    outercol: 8,
    col: 6,
    field: 'trans_mode_name',
    label: msg('transModeName'),
    disabled,
    formData,
    getFieldProps,
  };
  const blwbProps = {
    outercol: 8,
    col: 6,
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
    col: 6,
    field: 'trade_mode',
    options: formRequire.tradeModes,
    label: msg('tradeMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const remissionProps = {
    outercol: 8,
    col: 6,
    field: 'rm_modes',
    options: formRequire.remissionModes,
    label: msg('rmModeName'),
    disabled,
    formData,
    getFieldProps,
  };
  const emsNoProps = {
    outercol: 8,
    col: 6,
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
    options: formRequire.tradeCountries,
    label: msg('tradeCountry'),
    disabled,
    formData,
    getFieldProps,
  };
  return (
    <Col span="12">
      <FormSelect { ...tradeCountryProps } />
    </Col>
  );
}
