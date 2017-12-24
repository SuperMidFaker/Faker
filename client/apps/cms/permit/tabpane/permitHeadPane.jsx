import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Switch, Radio, Row, Upload, Col } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import messages from '../message.i18n';


const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    customers: state.crmCustomers.customers,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class PermitHeadPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const {
      form: { getFieldDecorator }, action, customers,
    } = this.props;
    const colSpan = {
      span: 8,
    };
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const formItemSpan2Layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      colon: false,
    };
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col span={16}>
              <FormItem {...formItemSpan2Layout} label={this.msg('owner')}>
                {getFieldDecorator('owner', {
                      rules: [{ required: true, message: '关联货主必选' }],
                    })(<Select
                      showSearch
                      placeholder="选择关联货主"
                      optionFilterProp="children"
                      onChange={this.handleSelectChange}
                      disabled={action !== 'create'}
                    >
                      {customers.map(data => (<Option
                        key={data.id}
                        value={data.id}
                        search={`${data.partner_code}${data.name}`}
                      >{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
                      </Option>))}
                    </Select>)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitFile')}>
                {getFieldDecorator('permit_file', {
                    })(<Upload>
                      <Button>
                        <Icon type="upload" /> 上传
                      </Button>
                    </Upload>)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitCategory')}>
                {getFieldDecorator('permit_category', {
                    })(<RadioGroup disabled={action !== 'create'}>
                      <RadioButton value="customs">海关标准</RadioButton>
                      <RadioButton value="ciq">国检标准</RadioButton>
                    </RadioGroup>)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitType')}>
                {getFieldDecorator('permit_type', {
                    })(<Select disabled={action !== 'create'} />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitNo')}>
                {getFieldDecorator('permit_no', {
                      rules: [{ required: true, message: '证书编号必填' }],
                    })(<Input disabled={action !== 'create'} />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('usageControl')}>
                {getFieldDecorator('usage_control', {
                    })(<Switch checkedChildren="开启" unCheckedChildren="关闭" />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('maxUsage')}>
                {getFieldDecorator('max_usage', {
                    })(<Input />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('availUsage')}>
                {getFieldDecorator('avail_usage', {
                    })(<Input />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('expiryControl')}>
                {getFieldDecorator('expiry_control', {
                    })(<Switch checkedChildren="开启" unCheckedChildren="关闭" />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('startDate')}>
                {getFieldDecorator('start_date', {
                    })(<DatePicker format="YYYY/MM/DD" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('stopDate')}>
                {getFieldDecorator('stop_date', {
                    })(<DatePicker format="YYYY/MM/DD" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </FormPane>
    );
  }
}
