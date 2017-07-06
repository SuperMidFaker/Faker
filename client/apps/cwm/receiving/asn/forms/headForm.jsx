/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, DatePicker, Card, Col, Radio, Row } from 'antd';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import moment from 'moment';
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
  })
)
export default class HeadForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    handleOwnerChange: PropTypes.func,
  }
  state = {
    bonded: 0,
  }
  componentWillMount() {
    const { asnHead } = this.props;
    if (asnHead) {
      this.setState({
        bonded: asnHead.bonded,
      });
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
  handleBondedChange = (e) => {
    this.setState({
      bonded: e.target.value,
    });
  }
  handleSelect = (value) => {
    this.props.handleOwnerChange(true, value);
  }
  render() {
    const { form: { getFieldDecorator }, owners, asnHead } = this.props;
    const { bonded } = this.state;
    return (
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
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
          <Col sm={24} lg={8}>
            <FormItem label="货物属性">
              {getFieldDecorator('bonded', {
                initialValue: asnHead ? asnHead.bonded : bonded,
              })(
                <RadioGroup onChange={this.handleBondedChange}>
                  <RadioButton value={0}>非保税</RadioButton>
                  <RadioButton value={1}>保税</RadioButton>
                </RadioGroup>
                  )}
            </FormItem>
          </Col>
          {
            bonded && <Col sm={24} lg={8} >
              <FormItem label="保税监管方式">
                {getFieldDecorator('reg_type', {
                  rules: [{ required: true, message: 'Please select reg_type!' }],
                  initialValue: asnHead && asnHead.bonded_intype,
                })(
                  <RadioGroup>
                    {CWM_ASN_BONDED_REGTYPES.map(cabr => <RadioButton value={cabr.value} key={cabr.value}>{cabr.text}</RadioButton>)}
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          }
        </Row>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <FormItem label="预期到货日期" >
              {getFieldDecorator('expect_receive_date', { rules: [{ type: 'object', required: true, message: 'Please select time!' }],
                initialValue: asnHead && moment(new Date(asnHead.expect_receive_date)),
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="采购订单号">
              {getFieldDecorator('po_no', {
                initialValue: asnHead && asnHead.po_no,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
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
        </Row>
      </Card>
    );
  }
}
