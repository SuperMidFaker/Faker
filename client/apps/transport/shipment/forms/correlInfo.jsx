import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Card } from 'antd';
import InputItem from './input-item';
import FreightCharge from './freightCharge';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@connect(
  state => ({
    fieldDefaults: {
      ref_waybill_no: state.shipment.formData.ref_waybill_no,
      ref_entry_no: state.shipment.formData.ref_entry_no,
      remark: state.shipment.formData.remark,
    },
    tenantName: state.account.tenantName,
  })
)
export default class CorrelInfo extends React.Component {
  static propTypes = {
    tenantName: PropTypes.string.isRequired,
    fieldDefaults: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const { tenantName, formhoc, fieldDefaults: {
      ref_waybill_no, ref_entry_no, remark,
    } } = this.props;
    return (
      <Col span="8" className="right-side-col">
        <Card bodyStyle={{ padding: 16 }}>
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
        </Card>
        <FreightCharge formhoc={formhoc} intl={this.props.intl} />
      </Col>
    );
  }
}
