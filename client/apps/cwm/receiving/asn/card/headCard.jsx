/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, DatePicker, Card, Col, Radio, Row } from 'antd';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import moment from 'moment';
import { loadSkuParams } from 'common/reducers/cwmSku';
import { formatMsg } from '../../message.i18n';

const dateFormat = 'YYYY/MM/DD';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadSkuParams }
)
export default class HeadCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    handleOwnerChange: PropTypes.func,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.asnHead !== this.props.asnHead) {
      const { asnHead } = nextProps;
      if (asnHead) {
        this.props.loadSkuParams(asnHead.owner_partner_id);
      }
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('seq'),
    width: 50,
  }, {
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 300,
  }, {
    title: this.msg('unit'),
    width: 60,
    dataIndex: 'unit',
  }, {
    title: this.msg('qty'),
    width: 50,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  handleBondedChange = (ev) => {
    if (ev.target.value === 0) {
      this.props.form.setFieldsValue({ reg_type: null });
    }
  }
  handleSelect = (value) => {
    this.props.handleOwnerChange(true, value);
    this.props.loadSkuParams(value);
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, owners, asnHead, defaultWhse } = this.props;
    return (
      <Card bodyStyle={{ paddingBottom: 8 }} noHovering>
        <Row>
          <Col span={5}>
            <FormItem label="货主">
              {getFieldDecorator('owner_partner_id', {
                rules: [{ required: true, message: 'Please select customer!' }],
                initialValue: asnHead && asnHead.owner_partner_id,
              })(
                <Select placeholder="选择货主" onSelect={this.handleSelect}>
                  {
                    owners.map(owner => <Option value={owner.id} key={owner.id}>{owner.name}</Option>)
                  }
                </Select>
                  )}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="预期到货日期" >
              {getFieldDecorator('expect_receive_date', { rules: [{ type: 'object', required: true, message: 'Please select time!' }],
                initialValue: asnHead ? moment(new Date(asnHead.expect_receive_date)) : moment(new Date()),
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="供货商">
              {getFieldDecorator('seller_name', {
                initialValue: asnHead && asnHead.seller_name,
              })(<Select mode="combobox" showSearch />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="采购订单号">
              {getFieldDecorator('po_no', {
                initialValue: asnHead && asnHead.po_no,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <FormItem label="ASN类型">
              {getFieldDecorator('asn_type', {
                initialValue: asnHead ? asnHead.asn_type : CWM_ASN_TYPES[0].value,
              })(
                <Select placeholder="ASN类型">
                  {CWM_ASN_TYPES.map(cat => <Option value={cat.value} key={cat.value}>{cat.text}</Option>)}
                </Select>
                  )}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="货物属性">
              {getFieldDecorator('bonded', {
                initialValue: asnHead ? asnHead.bonded : 0,
              })(
                <RadioGroup onChange={this.handleBondedChange}>
                  <RadioButton value={0}>非保税</RadioButton>
                  { defaultWhse.bonded === 1 && <RadioButton value={1}>保税</RadioButton> }
                </RadioGroup>
                  )}
            </FormItem>
          </Col>
          {
            getFieldValue('bonded') === 1 && <Col span={5} offset={1}>
              <FormItem label="保税监管方式">
                {getFieldDecorator('reg_type', {
                  rules: [{ required: true, message: 'Please select reg_type!' }],
                  initialValue: asnHead && asnHead.bonded_intype,
                })(
                  <RadioGroup>
                    {CWM_ASN_BONDED_REGTYPES.map(cabr => <RadioButton value={cabr.value} key={cabr.value}>{cabr.ftztext}</RadioButton>)}
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          }
          {
            getFieldValue('reg_type') === CWM_ASN_BONDED_REGTYPES[2].value && <Col span={5} offset={1}>
              <FormItem label="区内转入单">
                {getFieldDecorator('transfer_in_bills', {
                  initialValue: asnHead && asnHead.transfer_in_bills,
                })(<Input placeholder="多个转入入库单以逗号分隔" />)}
              </FormItem>
            </Col>
          }
        </Row>
      </Card>
    );
  }
}
