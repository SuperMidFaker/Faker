/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Card, Col, Row, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
export default class SiderForm extends Component {
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
          <Col sm={24}>
            <FormItem label={this.msg('visibleWarehouses')}>
              {getFieldDecorator('owner_code', {
              })(
                <Select multiple
                  optionFilterProp="search"
                  placeholder="选择可见仓库"
                >
                  <Option value="0961">恩诺-物流大道仓库</Option>
                  <Option value="0962">恩诺-富特路仓库</Option>
                </Select>
                )}
            </FormItem>
          </Col>
        </Card>
        <Card title="Trade Classification" className="aside-card">
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('hsCode')} >
                {getFieldDecorator('hs_code', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('chineseDescription')} >
                {getFieldDecorator('chinese_desc', {
                })(<Input />)}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('model')} >
                {getFieldDecorator('model', {
                })(<Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
