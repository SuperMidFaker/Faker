import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Tabs, Icon, Input } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
@injectIntl
@connect(
  () => ({

  }),
)
@Form.create()
export default class CustomerMainForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer, form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <InfoItem
                label="客户名称"
                field={customer.name}
              />
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('customerCode')} >
                {getFieldDecorator('customer_code', {
                })(<Input value={customer.partner_code} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('displayName')} >
                {getFieldDecorator('display_name', {
                })(<Input value={customer.display_name} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="recentOrders">
            <TabPane tab={<span><Icon type="message" />最近订单</span>} key="recentOrders" />
            <TabPane tab={<span><Icon type="message" />备注</span>} key="message" />
          </Tabs>
        </Card>
      </div>
    );
  }
}
