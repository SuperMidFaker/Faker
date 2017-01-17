/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Icon, Input, InputNumber, Card, Col, Row, Radio, Tooltip } from 'antd';
import { setClientForm } from 'common/reducers/cmsDelegation';
import { GOODSTYPES, TRANS_MODE, CLAIM_DO_AWB, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
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
      'goods_type', 'order_no', 'remark', 'ref_external_no', 'swb_no',
    ].forEach((fd) => {
      init[fd] = formData[fd] === undefined ? '' : formData[fd];
    });
  }
  init.claim_do_awb = formData.claim_do_awb === undefined ? 1 : formData.claim_do_awb;
  return init;
}
@injectIntl
@connect(
  state => ({
    clients: state.cmsDelegation.formRequire.clients,
    fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
    delgBill: state.cmsDelegation.delgBill,
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
    delgBill: PropTypes.object.isRequired,
    ieType: PropTypes.string.isRequired,
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
    const { form: { getFieldDecorator, getFieldValue }, fieldInits, clients, partnershipType, ieType, delgBill } = this.props;
    const DECL_TYPE = ieType === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
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
    let transModeLabel = {
      label: '',
      title: '',
    };
    let voyageNoLabel = {
      label: '',
      placeholder: '',
    };
    if (getFieldValue('trans_mode') === '2' || fieldInits.trans_mode === '2') {
      transModeLabel = {
        label: formatMsg(this.props.intl, 'bLNo'),
        title: '填报提单号。如有分提单的，填报提单号*分提单号',
      };
      voyageNoLabel = {
        label: formatMsg(this.props.intl, 'voyageNo'),
        placeholder: '填写船舶英文名称',
      };
    } else if (getFieldValue('trans_mode') === '5' || fieldInits.trans_mode === '5') {
      transModeLabel = {
        label: formatMsg(this.props.intl, 'deliveryNo'),
        title: '填报总运单号_分运单号，无分运单的填报总运单号',
      };
      voyageNoLabel = {
        label: formatMsg(this.props.intl, 'flightNo'),
        placeholder: '填写航班号',
      };
    }
    return (
      <Card bodyStyle={{ padding: 16 }}>
        <Row>
          <Col sm={24} lg={16}>
            <FormItem label={this.msg('delgClient')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} style={{ display: customerName.display }}>
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
                    >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>)
                    )}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('delgInternalNo')} {...formItemLayout}>
              {getFieldDecorator('ref_external_no', {
                initialValue: fieldInits.ref_external_no,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('orderNo')} {...formItemLayout}>
              {getFieldDecorator('order_no', {
                initialValue: fieldInits.order_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('invoiceNo')} {...formItemLayout}>
              {getFieldDecorator('invoice_no', {
                initialValue: fieldInits.invoice_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('contractNo')} {...formItemLayout}>
              {getFieldDecorator('contract_no', {
                initialValue: fieldInits.contract_no,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
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
          <Col sm={24} lg={8}>
            {(getFieldValue('trans_mode') === '2' || getFieldValue('trans_mode') === '5') &&
              <FormItem label={(
                <span>
                  {transModeLabel.label}&nbsp;
                  <Tooltip title={transModeLabel.title}>
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
          <Col sm={24} lg={8}>
            {(getFieldValue('trans_mode') === '2' || getFieldValue('trans_mode') === '5') &&
              <FormItem label={voyageNoLabel.label} {...formItemLayout}>
                {getFieldDecorator('voyage_no', {
                  initialValue: fieldInits.voyage_no,
                })(<Input placeholder={voyageNoLabel.placeholder} />)}
              </FormItem>
            }
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            {getFieldValue('trans_mode') === '2' &&
              <FormItem label="换单" {...formItemLayout}>
                {getFieldDecorator('claim_do_awb', { initialValue: fieldInits.claim_do_awb })(<RadioGroup>
                  <RadioButton value={CLAIM_DO_AWB.claimDO.key}>{CLAIM_DO_AWB.claimDO.value}</RadioButton>
                  <RadioButton value={CLAIM_DO_AWB.notClaimDO.key}>{CLAIM_DO_AWB.notClaimDO.value}</RadioButton>
                </RadioGroup>)}
              </FormItem>
            }
          </Col>
          <Col sm={24} lg={8}>
            {getFieldValue('trans_mode') === '2' &&
              <FormItem label="海运单号" {...formItemLayout}>
                {getFieldDecorator('swb_no', {
                  initialValue: fieldInits.swb_no,
                })(<Input />)}
              </FormItem>
            }
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
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
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('packageNum')} {...formItemLayout}>
              {getFieldDecorator('pieces', {
                initialValue: fieldInits.pieces || 1,
              })(<InputNumber min={1} max={100000} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('delgGrossWt')} {...formItemLayout}>
              {getFieldDecorator('weight', {
                initialValue: fieldInits.weight,
                rules: [{
                  required: customerName.required, message: '毛重必填',
                }],
              })(<Input addonAfter="千克" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={8}>
            <FormItem label={this.msg('declareWay')} {...formItemLayout}>
              {getFieldDecorator('decl_way_code', {
                rules: [{ required: true, message: '报关类型必选' }],
                initialValue: delgBill.decl_way_code,
              })(<Select>
                {
                  DECL_TYPE.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={16}>
            <FormItem label="备注" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
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
