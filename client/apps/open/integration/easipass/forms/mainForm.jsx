/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Card, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

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
                    showSearch
                    multiple
                    optionFilterProp="search"
                    placeholder="选择适用范围（可多选）"
                  >
                    <Option value="ALL">全局</Option>
                    <OptGroup label="Customer">
                      <Option value="0961">物流大道仓库</Option>
                      <Option value="0962">希雅路仓库</Option>
                      <Option value="0963">富特路仓库</Option>
                    </OptGroup>
                    <OptGroup label="Provider">
                      <Option value="0964">希雅路仓库</Option>
                      <Option value="0965">富特路仓库</Option>
                    </OptGroup>
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Easipass parameters">
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('发送方协同ID号')} >
                {getFieldDecorator('sender_id', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('接收方协同ID号')} >
                {getFieldDecorator('receiver_id', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('接收方用户ID')} >
                {getFieldDecorator('receiver_user_id', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('EDI用户名')} >
                {getFieldDecorator('edi_username', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <FormItem label={this.msg('FTPserver')} >
                {getFieldDecorator('ftp_server', {
                })(<Input readOnly />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('FTPusername')} >
                {getFieldDecorator('username', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('FTPpassword')} >
                {getFieldDecorator('password', {
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
