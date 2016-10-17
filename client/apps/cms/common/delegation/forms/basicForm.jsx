/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Card, Col, Row } from 'antd';
import { setClientForm } from 'common/reducers/cmsDelegation';
import { GOODSTYPES, TRANS_MODE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function getFieldInits(aspect, formData) {
  const init = {};
  if (formData) {
    [
      'customer_name', 'invoice_no', 'contract_no', 'bl_wb_no',
      'pieces', 'weight', 'trans_mode', 'voyage_no', 'trade_mode',
      'goods_type', 'order_no', 'remark',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
    init.internal_no = formData.ref_external_no;
  }
  return init;
}
@injectIntl
@connect(
  state => ({
    clients: state.cmsDelegation.formRequire.clients,
    tenantName: state.account.tenantName,
    fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
  }),
  { setClientForm }
)
export default class BasicForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    setClientForm: PropTypes.func.isRequired,
    tenantName: PropTypes.string.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const clients = this.props.clients.filter(cl => cl.partner_id === selPartnerId);
    if (clients.length === 1) {
      const client = clients[0];
      this.props.setClientForm({ customer_tenant_id: client.tid, customer_partner_id: selPartnerId });
      return client.name;
    }
    return value;
  }
  render() {
    const { form: { getFieldProps, getFieldValue }, fieldInits, clients, tenantName, partnershipType } = this.props;
    let customerName = {
      display: '',
      required: true,
    };
    if (partnershipType === 'CCB') {
      customerName = {
        display: '',
        required: true,
      };
    } else if (partnershipType === 'CUS') {
      customerName = {
        display: 'none',
        required: false,
      };
    }
    return (
      <Card title={this.msg('delgInfo')} bodyStyle={{ padding: 16 }}>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('delgClient')} {...formItemLayout} style={{ display: customerName.display }}>
              <Select size="large" combobox showArrow={false} optionFilterProp="search"
                placeholder="输入客户代码或名称"
                {...getFieldProps('customer_name', { rules: [{
                  required: customerName.required, message: '客户名称必填',
                }],
                  getValueFromEvent: this.handleClientChange,
                  initialValue: fieldInits.customer_name,
                })}
              >
                {
                clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
                  search={`${data.partner_code}${data.name}`}
                >{data.name}</Option>)
              )}
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('orderNo')} {...formItemLayout}>
              <Input {...getFieldProps('order_no', {
                initialValue: fieldInits.order_no,
              })} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('invoiceNo')} {...formItemLayout}>
              <Input {...getFieldProps('invoice_no', {
                initialValue: fieldInits.invoice_no,
              })} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('transMode')} {...formItemLayout}>
              <Select {...getFieldProps('trans_mode', {
                initialValue: fieldInits.trans_mode,
                rules: [{ required: true, message: '运输方式必选' }],
              })}>
                {
                TRANS_MODE.map(tr =>
                  <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            { getFieldValue('trans_mode') === '2' &&
            <FormItem label={this.msg('bLNo')} {...formItemLayout}>
              <Input {...getFieldProps('bl_wb_no', {
                initialValue: fieldInits.bl_wb_no,
              })} />
            </FormItem>
          }
            { getFieldValue('trans_mode') === '5' &&
            <FormItem label={this.msg('deliveryNo')} {...formItemLayout}>
              <Input {...getFieldProps('bl_wb_no', {
                initialValue: fieldInits.bl_wb_no,
              })} />
            </FormItem>
          }
          </Col>
          <Col sm={8}>
            { getFieldValue('trans_mode') === '2' &&
            <FormItem label={this.msg('voyageNo')} {...formItemLayout}>
              <Input {...getFieldProps('voyage_no', {
                initialValue: fieldInits.voyage_no,
              })} />
            </FormItem>
          }
            { getFieldValue('trans_mode') === '5' &&
            <FormItem label={this.msg('flightNo')} {...formItemLayout}>
              <Input {...getFieldProps('voyage_no', {
                initialValue: fieldInits.voyage_no,
              })} />
            </FormItem>
          }
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('goodsType')} {...formItemLayout}>
              <Select {...getFieldProps('goods_type', {
                initialValue: fieldInits.goods_type,
                rules: [{ required: true, message: '货物类型必选', type: 'number' }],
              })}>
                {
                GOODSTYPES.map(gt =>
                  <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                )
              }
              </Select>
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgPieces')} {...formItemLayout}>
              <Input {...getFieldProps('pieces', {
                initialValue: fieldInits.pieces,
              })} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgWeight')} {...formItemLayout}>
              <Input {...getFieldProps('weight', {
                initialValue: fieldInits.weight,
              })} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('broker')} {...formItemLayout}>
              <Input disabled {...getFieldProps('ccb_name', {
                initialValue: tenantName,
              })} />
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgInternalNo')} {...formItemLayout}>
              <Input {...getFieldProps('internal_no', {
                initialValue: fieldInits.internal_no,
              })} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="备注" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              <Input type="textarea" autosize={{ minRows: 3, maxRows: 16 }} {...getFieldProps('remark', {
                initialValue: fieldInits.remark,
              })} />
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
