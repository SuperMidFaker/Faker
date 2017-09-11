import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Select, Row, Col, Radio } from 'antd';
import { loadBrokers } from 'common/reducers/cwmWarehouse';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    brokers: state.cwmWarehouse.brokers,
    trxModes: state.cwmShFtz.params.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: tm.trx_spec,
    })),
  }),
  { loadBrokers }
)
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    handleOwnerChange: PropTypes.func.isRequired,
  }
  componentWillMount() {
    this.props.loadBrokers(this.props.defaultWhse.code, this.props.tenantId);
  }
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  handleOwnerChange = (ownerCusCode) => {
    this.props.handleOwnerChange(ownerCusCode);
  }
  handleIetypeChange = (ev) => {
    this.setState({ ietype: ev.target.value });
  }
  render() {
    const { form: { getFieldDecorator }, owners, ownerCusCode, brokers } = this.props;
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={5}>
            <FormItem label="提货单位">
              {getFieldDecorator('owner', { initialValue: ownerCusCode,
                rules: [{ required: true, message: '提货单位必选' }],
              })(
                <Select placeholder="请选择提货单位" showSearch optionFilterProp="children" onChange={this.handleOwnerChange} style={{ width: 200 }}>
                  {owners.map(owner => (<Option value={owner.customs_code} key={owner.customs_code}>{owner.name}</Option>))}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="报关代理">
              {getFieldDecorator('broker', {
                rules: [{ required: true, message: '报关代理必选' }],
              })(
                <Select placeholder="请选择报关代理" style={{ width: 200 }} >
                  {brokers.map(broker => (<Option value={broker.customs_code} key={broker.customs_code}>{broker.name}</Option>))}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="成交方式">
              {getFieldDecorator('trxn_mode', {
                rules: [{ required: true, message: '成交方式必选' }],
              })(
                <Select placeholder="请选择成交方式" style={{ width: 200 }}>
                  {this.props.trxModes.map(data => (
                    <Option key={data.value} value={data.value}>
                      {data.text}
                    </Option>))}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="类型">
              {getFieldDecorator('ietype', { initialValue: 'import' })(
                <RadioGroup onChange={this.handleIetypeChange} >
                  <RadioButton value="import">进口</RadioButton>
                  <RadioButton value="export">出口</RadioButton>
                </RadioGroup>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
