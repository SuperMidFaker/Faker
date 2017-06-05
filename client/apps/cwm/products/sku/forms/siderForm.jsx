/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Card, Col, Row, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

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
        <Card title="仓库控制属性" className="secondary-card">
          <Row gutter={16}>
            <Col sm={24}>
              <FormItem label={this.msg('packingCode')}>
                {getFieldDecorator('packing_code', {
                })(
                  <Select showSearch
                    optionFilterProp="search"
                    placeholder="选择包装代码"
                  >
                    <Option value="HumanScale">HumanScale</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('lottingRule')}>
                {getFieldDecorator('lotting_rule', {
                })(
                  <Select showSearch
                    optionFilterProp="search"
                    placeholder="选择批次属性"
                  >
                    <Option value="HumanScale">HumanScale</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24}>
              <FormItem label={this.msg('ftzMappingRule')}>
                {getFieldDecorator('ftz_mapping_rule', {
                })(
                  <Select showSearch
                    optionFilterProp="search"
                    placeholder="选择保税备案映射规则"
                  >
                    <Option value="HumanScale">HumanScale</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="海关归类属性" className="secondary-card">
          <Col sm={24}>
            <FormItem label={this.msg('classification')}>
              {getFieldDecorator('hs_code', {
              })(
                <Input placeholder="海关商品编码" />
                )}
            </FormItem>
          </Col>
        </Card>
      </div>
    );
  }
}
