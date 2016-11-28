/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Icon, Input, InputNumber, Card, Col, Row, Radio, Tooltip } from 'antd';
import { setClientForm } from 'common/reducers/cmsDelegation';
import { GOODSTYPES, TRANS_MODE, CLAIM_DO_AWB } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
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
      'goods_type', 'order_no', 'remark', 'ref_external_no',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
  }
  init.claim_do_awb = formData.claim_do_awb || 1;
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
    const { form: { getFieldDecorator, getFieldValue }, fieldInits, clients, tenantName, partnershipType } = this.props;
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
              {getFieldDecorator('customer_name', {
                rules: [{
                  required: customerName.required, message: '客户名称必填',
                }],
                getValueFromEvent: this.handleClientChange,
                initialValue: fieldInits.customer_name,
              })(
                <Select size="large" combobox showArrow={false} optionFilterProp="search"
                  placeholder="输入客户代码或名称"
                >
                  {
                    clients.map(data => (<Option key={data.partner_id} value={data.partner_id}
                      search={`${data.partner_code}${data.name}`}
                    >{data.partner_unique_code ? `${data.partner_unique_code} | ${data.name}` : data.name}</Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('orderNo')} {...formItemLayout}>
              {getFieldDecorator('order_no', {
                initialValue: fieldInits.order_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('invoiceNo')} {...formItemLayout}>
              {getFieldDecorator('invoice_no', {
                initialValue: fieldInits.invoice_no,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('transMode')} {...formItemLayout}>
              {getFieldDecorator('trans_mode', {
                initialValue: fieldInits.trans_mode,
                rules: [{ required: true, message: '运输方式必选' }],
              })(
                <Select>
                  {
                    TRANS_MODE.map(tr =>
                      <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                    )
                  }
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={8}>
            {getFieldValue('trans_mode') === '2' &&
              <FormItem label={(
                <span>
                  {this.msg('bLNo')}&nbsp;
                  <Tooltip title="如有分提单填报：提单号*分提单号">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>)} {...formItemLayout}
              >
                {getFieldDecorator('bl_wb_no', {
                  initialValue: fieldInits.bl_wb_no,
                })(<Input />)}
              </FormItem>
            }
            {getFieldValue('trans_mode') === '5' &&
              <FormItem label={(
                <span>
                  {this.msg('deliveryNo')}&nbsp;
                  <Tooltip title="填报总运单号_分运单号，无分运单的填报总运单号">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>)} {...formItemLayout}
              >
                {getFieldDecorator('bl_wb_no', {
                  initialValue: fieldInits.bl_wb_no,
                })(<Input />)}
              </FormItem>
            }
          </Col>
          <Col sm={8}>
            {getFieldValue('trans_mode') === '2' &&
              <FormItem label={this.msg('voyageNo')} {...formItemLayout}>
                {getFieldDecorator('voyage_no', {
                  initialValue: fieldInits.voyage_no,
                })(<Input placeholder="填写船舶英文名称" />)}
              </FormItem>
            }
            {getFieldValue('trans_mode') === '5' &&
              <FormItem label={this.msg('flightNo')} {...formItemLayout}>
                {getFieldDecorator('voyage_no', {
                  initialValue: fieldInits.voyage_no,
                })(<Input placeholder="填写航班号" />)}
              </FormItem>
            }
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('goodsType')} {...formItemLayout}>
              {getFieldDecorator('goods_type', {
                initialValue: fieldInits.goods_type,
                rules: [{ required: true, message: '货物类型必选', type: 'number' }],
              })(<Select>
                {
                  GOODSTYPES.map(gt =>
                    <Option value={gt.value} key={gt.value}>{gt.text}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgPieces')} {...formItemLayout}>
              {getFieldDecorator('pieces', {
                initialValue: fieldInits.pieces,
              })(<InputNumber min={1} max={100000} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgWeight')} {...formItemLayout}>
              {getFieldDecorator('weight', {
                initialValue: fieldInits.weight,
              })(<Input addonAfter="千克" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label={this.msg('broker')} {...formItemLayout}>
              {getFieldDecorator('ccb_name', {
                initialValue: tenantName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label={this.msg('delgInternalNo')} {...formItemLayout}>
              {getFieldDecorator('ref_external_no', {
                initialValue: fieldInits.ref_external_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={8}>
            {getFieldValue('trans_mode') === '2' &&
              <FormItem label="换单" {...formItemLayout}>
                {getFieldDecorator('claim_do_awb', { initialValue: fieldInits.claim_do_awb })(<RadioGroup>
                  <RadioButton value={CLAIM_DO_AWB.claimDO.key}>{CLAIM_DO_AWB.claimDO.value}</RadioButton>
                  <RadioButton value={CLAIM_DO_AWB.notClaimDO.key}>{CLAIM_DO_AWB.notClaimDO.value}</RadioButton>
                </RadioGroup>)}
              </FormItem>
            }
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem label="备注" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
              {getFieldDecorator('remark', {
                initialValue: fieldInits.remark,
              })(<Input type="textarea" autosize={{ minRows: 1, maxRows: 16 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
