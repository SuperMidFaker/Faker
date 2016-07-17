import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Form, InputNumber, Card } from 'antd';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@connect(
  state => ({
    fieldDefaults: {
      ref_waybill_no: state.shipment.formData.ref_waybill_no,
      ref_entry_no: state.shipment.formData.ref_entry_no,
      remark: state.shipment.formData.remark,
      freight_charge: state.shipment.formData.freight_charge,
      lsp_name: state.shipment.formData.lsp_name,
    },
  })
)
export default class CorrelInfo extends React.Component {
  static propTypes = {
    tenantName: PropTypes.string,
    fieldDefaults: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const { tenantName, formhoc, fieldDefaults: {
      ref_waybill_no, ref_entry_no, remark, freight_charge, lsp_name: lsp,
    } } = this.props;
    return (
      <Col span="8" className="right-side-col">
        <Card title={this.msg('correlativeInfo')} bodyStyle={{ padding: 16 }}>
          <InputItem formhoc={formhoc} placeholder={this.msg('lsp')} colSpan={0}
            fieldProps={{ initialValue: tenantName || lsp }} disabled rules={[{
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
        <Card title={this.msg('freightCharge')} bodyStyle={{ padding: 8 }}>
          <FormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.1}
              {...formhoc.getFieldProps('freight_charge', {
              initialValue: freight_charge,
            })}
            />
          </FormItem>
        </Card>
      </Col>
    );
  }
}
