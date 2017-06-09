/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Select, DatePicker, Card, Col, Radio, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadwhseOwners } from 'common/reducers/cwmWarehouse';

const dateFormat = 'YYYY/MM/DD';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    currentWarehouse: state.cwmWarehouse.currentWarehouse,
    whseOwners: state.cwmWarehouse.whseOwners,
  }),
  { loadwhseOwners }
)
export default class HeadForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
  }
  state = {
    bonded: 0,
  }
  componentWillMount() {
    const { tenantId } = this.props;
    const whseCode = this.props.currentWarehouse.whse_code;
    this.props.loadwhseOwners(whseCode, tenantId);
  }
  msg = key => formatMsg(this.props.intl, key);
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
  render() {
    const { form: { getFieldDecorator }, whseOwners } = this.props;
    const { bonded } = this.state;
    return (
      <Card>
        <Row gutter={16}>
          <Col sm={24} lg={8}>
            <FormItem label="货主">
              {getFieldDecorator('owner_code', {
                rules: [{ required: true, message: 'Please select customer!' }],
              })(
                <Select
                  placeholder="选择货主"
                >
                  {
                    whseOwners.map(owner => <Option key={owner.owner_tenant_id} value={owner.owner_tenant_id}>{owner.owner_name}</Option>)
                  }
                </Select>
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="采购订单号">
              {getFieldDecorator('po_no', {
                rules: [{ required: true, message: 'Please input po_no!' }],
              })(
                <Input />
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="预期到货日期" >
              {getFieldDecorator('expect_receive_date', { rules: [{ type: 'object', required: true, message: 'Please select time!' }],
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="ASN类型">
              {getFieldDecorator('asn_type', {
              })(
                <Select
                  placeholder="ASN类型"
                >
                  <Option value="0">采购入库</Option>
                  <Option value="1">调拨入库</Option>
                  <Option value="2">退货入库</Option>
                </Select>
                  )}
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem label="货物属性">
              {getFieldDecorator('bonded', {
                initialValue: bonded,
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
              <FormItem label="保税入库类型">
                {getFieldDecorator('reg_type', {
                  rules: [{ required: true, message: 'Please select reg_type!' }],
                })(
                  <RadioGroup>
                    <RadioButton value={0}>先报关后入库</RadioButton>
                    <RadioButton value={1}>先入库后报关</RadioButton>
                    <RadioButton value={2}>不报关</RadioButton>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          }
        </Row>
      </Card>
    );
  }
}
