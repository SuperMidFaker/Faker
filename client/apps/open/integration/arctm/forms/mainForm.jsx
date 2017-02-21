/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('integrationName')} >
                {getFieldDecorator('integration_name', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('scope')}>
                {getFieldDecorator('partner_code', {
                })(
                  <Select
                    optionFilterProp="search"
                    placeholder="选择合作伙伴"
                  >
                    <Option value="0961">物流大道仓库</Option>
                    <Option value="0962">希雅路仓库</Option>
                    <Option value="0963">富特路仓库</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="AmberRoadCTM parameters">
          <Row gutter={16}>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('customerNo')} >
                {getFieldDecorator('customer_no', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('username')} >
                {getFieldDecorator('username', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={8}>
              <FormItem label={this.msg('password')} >
                {getFieldDecorator('password', {
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Incoming">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('hookUrl')} >
                {getFieldDecorator('hook_url', {
                })(<Input defaultValue="https://hook.welogix.cn/ar/randomuuid" readOnly />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Outgoing">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('webserviceUrl')} >
                {getFieldDecorator('webservice_url', {
                })(<Input placeholder="https:/stage.easytms.net/webservice/InboundWebService.aspx" />)}
              </FormItem>
            </Col>

          </Row>
        </Card>
      </div>
    );
  }
}
