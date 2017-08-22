/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Col, Row, Select, Input, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import Cascader from 'client/components/RegionCascader';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { loadReceivers } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadReceivers }
)
export default class ReceiverPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    soHead: PropTypes.object,
  }
  componentWillMount() {
    this.props.loadReceivers(this.props.whseCode, this.props.whseTenantId);
  }
  msg = key => formatMsg(this.props.intl, key)
  handleRegionChange = () => {
    // const [code, province, city, district, street] = value;
    // const region = Object.assign({}, { region_code: code, province, city, district, street });
    // this.props.changeRegion(region);
  }
  render() {
    const { form: { getFieldDecorator }, soHead } = this.props;
    const receivers = [];
    const regionValues = [];
    return (
      <div style={{ padding: 24 }}>
        <Row>
          <Col span={6}>
            <FormItem label="收货人名称">
              {getFieldDecorator('receiver_name', {
                rules: [{ message: 'Please select customer!' }],
                initialValue: soHead && soHead.receiver_name,
              })(
                <Select placeholder="选择收货人" onSelect={this.handleSelect}>
                  {receivers.map(item => (<Option value={item}>{item}</Option>))}
                </Select>
                )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系人">
              {getFieldDecorator('receiver_contact', {
                initialValue: soHead && soHead.receiver_contact,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="联系方式">
              <Col span={12}><Input prefix={<Icon type="phone" />} placeholder="电话" value={soHead && soHead.receiver_phone} /></Col>
              <Col span={12}><Input prefix={<Icon type="mobile" />} placeholder="手机" value={soHead && soHead.receiver_number} /></Col>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label="省/市/县区">
              <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} />
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="详细地址">
              {getFieldDecorator('receiver_address', {
                initialValue: soHead && soHead.receiver_address,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6} offset={2}>
            <FormItem label="邮政编码">
              {getFieldDecorator('receiver_post_code', {
                initialValue: soHead && soHead.receiver_post_code,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
