import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import { Col } from 'ant-ui';
import FormInput from './formInput';
import FormSelect from './formSelect';
import FormDatePicker from './formDatepicker';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

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

export function Transport(props) {
  const msg = (descriptor, values) => formatMsg(props.intl, descriptor, values);
  const { getFieldProps, disabled, formData, formRequire } = props;
  const modeProps = {
    outercol: 8,
    col: 4,
    field: 'trans_mode',
    options: formRequire.transModes,
    label: msg('transMode'),
    disabled,
    formData,
    getFieldProps,
  };
  const modeNameProps = {
    outercol: 8,
    col: 4,
    field: 'trans_mode_name',
    label: msg('transModeName'),
    disabled,
    formData,
    getFieldProps,
  };
  const blwbProps = {
    outercol: 8,
    col: 4,
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
