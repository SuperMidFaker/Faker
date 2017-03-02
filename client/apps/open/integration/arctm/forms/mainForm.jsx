import React, { Component, PropTypes } from 'react';
import { Button, Form, Select, Input, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const ButtonGroup = Button.Group;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card title={this.msg('AmberRoadCTMParam')}>
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('customerNo')}>
                {getFieldDecorator('partner_customer', {
                })(<Select optionFilterProp="search" placeholder="选择客户">
                  <Option value="0961">物流大道仓库</Option>
                  <Option value="0962">希雅路仓库</Option>
                  <Option value="0963">富特路仓库</Option>
                </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('username')}>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: '用户名必填' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('password')}>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '密码必填' }],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Incoming">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('hookUrl')} >
                <Input placeholder="https://openapi.welogix.cn/ar/hook/randomuuid" addonAfter={
                  <ButtonGroup size="small"><Button icon="tag" /><Button icon="copy" /></ButtonGroup>
                } readOnly
                />
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Outgoing">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('webserviceUrl')} >
                {getFieldDecorator('webservice_url', {
                  rules: [{ required: true, message: 'webservice url必填' }],
                })(<Input placeholder="https:/stage.easytms.net/webservice/InboundWebService.aspx" />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
