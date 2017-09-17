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
    customsCode: state.account.customsCode,
    tenantName: state.account.tenantName,
    owners: state.cwmContext.whseAttrs.owners.filter(owner => owner.portion_enabled),
    defaultWhse: state.cwmContext.defaultWhse,
    brokers: state.cwmWarehouse.brokers,
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
  render() {
    const { form: { getFieldDecorator }, owners, ownerCusCode, brokers, customsCode, tenantName } = this.props;
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={5}>
            <FormItem label="收货单位">
              {getFieldDecorator('owner', { initialValue: ownerCusCode,
                rules: [{ required: true, message: '收货单位必选' }],
              })(
                <Select placeholder="请选择收货单位" onChange={this.handleOwnerChange} showSearch optionFilterProp="children" style={{ width: 200 }}>
                  {owners.map(owner => (<Option value={owner.customs_code} key={owner.customs_code}>{owner.name}</Option>))}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="报关代理">
              {getFieldDecorator('broker', { rules: [{ required: true, message: '报关代理必选' }] })(
                <Select placeholder="请选择报关代理" style={{ width: 200 }} >
                  {brokers.map(broker => (<Option value={broker.customs_code} key={broker.customs_code}>{broker.name}</Option>)).concat(
                    <Option value={customsCode} key={customsCode}>{tenantName}</Option>
                  )}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="类型">
              {getFieldDecorator('apply_type', {
                initialValue: '0',
              })(
                <Select placeholder="请选择报关申请类型" style={{ width: 200 }}>
                  <Option value="0" key="0">普通报关申请单</Option>
                  <Option value="1" key="1">跨关区报关申请单</Option>
                  <Option value="2" key="2">保展报关申请单</Option>
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem label="进出口标识">
              {getFieldDecorator('ietype', { initialValue: 'import' })(
                <RadioGroup>
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
