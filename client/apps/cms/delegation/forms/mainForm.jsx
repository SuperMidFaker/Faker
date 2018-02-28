/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Select, Icon, Input, InputNumber, Card, Col, Row, Radio, Tooltip } from 'antd';
import { setClientForm } from 'common/reducers/cmsDelegation';
import { GOODSTYPES, TRANS_MODE, DECL_TYPE, WRAP_TYPE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';

import { formatMsg } from '../message.i18n';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

function getFieldInits(aspect, formData) {
  const init = {};
  if (formData) {
    [
      'customer_name', 'invoice_no', 'contract_no', 'bl_wb_no', 'pieces', 'weight',
      'trans_mode', 'traf_name', 'voyage_no', 'trade_mode', 'decl_port', 'decl_way_code',
      'goods_type', 'order_no', 'swb_no', 'wrap_type',
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
    customs: state.cmsDelegation.formRequire.customs.map(cus => ({
      value: cus.customs_code,
      text: `${cus.customs_code} | ${cus.customs_name}`,
    })),
    fieldInits: getFieldInits(state.account.aspect, state.cmsDelegation.formData),
  }),
  { setClientForm }
)
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    fieldInits: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    customs: PropTypes.array.isRequired,
    setClientForm: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
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
    const {
      form: { getFieldDecorator, getFieldValue }, fieldInits, clients, partnershipType,
    } = this.props;
    // const DECL_TYPE = ieType === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    const transMode = getFieldValue('trans_mode');
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
      label: '提运单号',
      title: '',
    };
    let voyageNoLabel = {
      label: '运输工具名称',
      placeholder: '',
    };
    if (transMode === '2' || fieldInits.trans_mode === '2') {
      transModeLabel = {
        label: formatMsg(this.props.intl, 'bLNo'),
        title: '填报提单号。如有分提单的，填报提单号*分提单号',
      };
      voyageNoLabel = {
        label: '运输工具名称/航次号',
        placeholder: '填写船舶英文名称',
      };
    } else if (transMode === '5' || fieldInits.trans_mode === '5') {
      transModeLabel = {
        label: formatMsg(this.props.intl, 'deliveryNo'),
        title: '填报总运单号_分运单号，无分运单的填报总运单号',
      };
      voyageNoLabel = {
        label: '运输工具名称',
        placeholder: '填写航班号',
      };
    }
    return (
      <div>
        <Card bodyStyle={{ padding: 16 }}>
          <Row gutter={16}>
            <Col sm={24} lg={16}>
              <FormItem label={this.msg('declareWay')} >
                {getFieldDecorator('decl_way_code', {
                  rules: [{ required: true, message: '报关类型必选' }],
                  initialValue: fieldInits.decl_way_code,
                })(<RadioGroup>
                  <RadioButton value={DECL_TYPE[0].key}>{DECL_TYPE[0].value}</RadioButton>
                  <RadioButton value={DECL_TYPE[1].key}>{DECL_TYPE[1].value}</RadioButton>
                  <RadioButton value={DECL_TYPE[2].key}>{DECL_TYPE[2].value}</RadioButton>
                  <RadioButton value={DECL_TYPE[3].key}>{DECL_TYPE[3].value}</RadioButton>
                </RadioGroup>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('declareCustoms')} >
                {getFieldDecorator('decl_port', {
                  initialValue: fieldInits.decl_port,
                })(<Select showSearch>
                  {
                    this.props.customs.map(dw =>
                      <Option value={dw.value} key={dw.value}>{dw.text}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('customer')} style={{ display: customerName.display }}>
                {getFieldDecorator('customer_name', {
                  rules: [{
                    required: customerName.required, message: '客户名称必填',
                  }],
                  getValueFromEvent: this.handleClientChange,
                  initialValue: fieldInits.customer_name,
                })(<Select
                  mode="combobox"
                  showArrow={false}
                  optionFilterProp="search"
                  placeholder="输入客户代码或名称"
                >
                  {
                      clients.map(data => (<Option
                        key={data.partner_id}
                        value={data.partner_id}
                        search={`${data.partner_code}${data.name}`}
                      >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
                      </Option>))}
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('orderNo')} >
                {getFieldDecorator('order_no', {
                  initialValue: fieldInits.order_no,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('contractNo')} >
                {getFieldDecorator('contract_no', {
                  initialValue: fieldInits.contract_no,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 16 }}>
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('transMode')} >
                {getFieldDecorator('trans_mode', {
                  initialValue: fieldInits.trans_mode,
                  rules: [{ required: true, message: '运输方式必选' }],
                })(<Select>
                  {
                      TRANS_MODE.map(tr =>
                        <Option value={tr.value} key={tr.value}>{tr.text}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>

            <Col sm={24} lg={8}>
              <FormItem label={voyageNoLabel.label} >
                <InputGroup compact>
                  {getFieldDecorator('traf_name', {
                    initialValue: fieldInits.traf_name,
                  })(<Input style={{ width: transMode === '2' ? '60%' : '100%' }} />)}
                  {transMode === '2' && getFieldDecorator('voyage_no', {
                    initialValue: fieldInits.voyage_no,
                  })(<Input style={{ width: '40%' }} placeholder="航次号" />)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={(
                <span>
                  {transModeLabel.label}&nbsp;
                  <Tooltip title={transModeLabel.title}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>)}
              >
                {getFieldDecorator('bl_wb_no', {
                  initialValue: fieldInits.bl_wb_no,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('goodsType')} >
                {getFieldDecorator('goods_type', {
                  initialValue: fieldInits.goods_type,
                  rules: [{ required: true, message: '货物类型必选', type: 'number' }],
                })(<Select>
                  {
                    GOODSTYPES.map(gt =>
                      <Option value={gt.value} key={gt.value}>{gt.text}</Option>)
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('packageNum')} >
                <InputGroup compact>
                  {getFieldDecorator('pieces', {
                    initialValue: fieldInits.pieces || 1,
                  })(<InputNumber min={1} max={100000} style={{ width: '50%' }} />)}
                  {getFieldDecorator('wrap_type', {
                    initialValue: fieldInits.wrap_type,
                  })(<Select style={{ width: '50%' }} placeholder="选择包装方式">
                    {
                    WRAP_TYPE.map(wt =>
                      <Option value={wt.value} key={wt.value}>{wt.text}</Option>)
                  }
                  </Select>)}
                </InputGroup>
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('delgGrossWt')} >
                {getFieldDecorator('weight', {
                  initialValue: fieldInits.weight,
                  rules: [{
                    required: customerName.required, message: '毛重必填',
                  }],
                })(<Input addonAfter="千克" />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
