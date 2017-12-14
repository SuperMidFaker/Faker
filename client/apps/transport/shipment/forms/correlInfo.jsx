import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@connect(state => ({
  fieldDefaults: {
    ref_waybill_no: state.shipment.formData.ref_waybill_no,
    ref_entry_no: state.shipment.formData.ref_entry_no,
    remark: state.shipment.formData.remark,
  },
  tenantName: state.account.tenantName,
}))
export default class CorrelInfo extends React.Component {
  static propTypes = {
    tenantName: PropTypes.string.isRequired,
    fieldDefaults: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    vertical: PropTypes.bool,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const {
      tenantName, formhoc, fieldDefaults: {
        ref_waybill_no, ref_entry_no, remark,
      }, vertical,
    } = this.props;
    let content = '';
    if (vertical) {
      content = (
        <div>
          <InputItem formhoc={formhoc} labelName={this.msg('refWaybillNo')}
            field="ref_waybill_no"
            fieldProps={{ initialValue: ref_waybill_no }}
          />
          <InputItem formhoc={formhoc} labelName={this.msg('refEntryNo')}
            field="ref_entry_no"
            fieldProps={{ initialValue: ref_entry_no }}
          />
          <InputItem type="textarea" formhoc={formhoc} labelName={this.msg('remark')}
            field="remark"
            fieldProps={{ initialValue: remark }}
          />
        </div>
      );
    } else {
      content = (
        <div>
          <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0}
            fieldProps={{ initialValue: tenantName }} disabled rules={[{
              required: true, message: this.msg('lspNameMust'),
            }]} field="lsp"
          />
          <InputItem formhoc={formhoc} placeholder={this.msg('refWaybillNo')}
            colSpan={0} field="ref_waybill_no"
            fieldProps={{ initialValue: ref_waybill_no }}
          />
          <InputItem formhoc={formhoc} placeholder={this.msg('refEntryNo')}
            colSpan={0} field="ref_entry_no"
            fieldProps={{ initialValue: ref_entry_no }}
          />
          <InputItem type="textarea" formhoc={formhoc} placeholder={this.msg('remark')}
            colSpan={0} field="remark"
            fieldProps={{ initialValue: remark }}
          />
        </div>
      );
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}
