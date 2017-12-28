import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, DatePicker, Form, Icon, Input, Select, Switch, Radio, Row, Upload, Col, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import { loadPermit } from 'common/reducers/cmsPermit';
import { CIQ_LICENCE_TYPE } from 'common/constants';
import messages from '../message.i18n';


const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    clients: state.partner.partners,
    certParams: state.cmsPermit.certParams,
  }),
  { loadPermit }
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
  state = {
    permitCategory: 'customs',
    formData: {},
    usageControl: '',
    expiryControl: '',
  }
  componentDidMount() {
    if (this.props.action === 'edit') {
      this.props.loadPermit(this.context.router.params.id).then((result) => {
        if (!result.error) {
          this.setState({
            formData: result.data,
            usageControl: !!result.data.usage_control,
            expiryControl: !!result.data.expiry_control,
          });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCategoryChange = (e) => {
    this.setState({
      permitCategory: e.target.value,
    });
  }
  handleUsageChange = (checked) => {
    this.setState({
      usageControl: checked,
    });
  }
  handleExpiryChange = (checked) => {
    this.setState({
      expiryControl: checked,
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, action, clients, certParams,
    } = this.props;
    const {
      permitCategory, formData, usageControl, expiryControl,
    } = this.state;
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
    const props = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      multiple: false,
      showUploadList: false,
      withCredentials: true,
      onChange(info) {
        if (info.file.response && info.file.response.status === 200) {
          message.success('上传成功');
        }
      },
    };
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <Card bodyStyle={{ padding: 16, paddingBottom: 0 }} hoverable={false}>
          <Row>
            <Col span={16}>
              <FormItem {...formItemSpan2Layout} label={this.msg('permitOwner')}>
                {getFieldDecorator('owner_partner_id', {
                    rules: [{ required: true, message: '所属企业必选' }],
                    initialValue: action === 'edit' && formData.owner_partner_id,
                  })(<Select
                    showSearch
                    placeholder="选择关联货主"
                    optionFilterProp="children"
                    onChange={this.handleSelectChange}
                    disabled={action !== 'create'}
                  >
                    {clients.map(data => (<Option key={data.partner_id} value={data.partner_id}>
                      {data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
                    </Option>))}
                  </Select>)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitFile')}>
                {getFieldDecorator('permit_file', {
                  initialValue: action === 'edit' && formData.permit_file,
                  })(<Upload {...props}>
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
                    initialValue: action === 'edit' ? formData.permit_category : permitCategory,
                    })(<RadioGroup disabled={action !== 'create'} onChange={this.handleCategoryChange}>
                      <RadioButton value="customs">海关标准</RadioButton>
                      <RadioButton value="ciq">国检标准</RadioButton>
                    </RadioGroup>)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              {permitCategory === 'customs' ?
              (<FormItem {...formItemLayout} label={this.msg('permitType')}>
                {getFieldDecorator('permit_code', {
                  initialValue: action === 'edit' && formData.permit_code,
                  })(<Select disabled={action !== 'create'} style={{ width: '100%' }}>
                    {
                    certParams.map(cert => <Option value={cert.cert_code} key={cert.cert_code}>{`${cert.cert_code}|${cert.cert_spec}`}</Option>)
                  }
                  </Select>)}
              </FormItem>) :
              (<FormItem {...formItemLayout} label={this.msg('permitType')}>
                {getFieldDecorator('permit_code', {
                  initialValue: action === 'edit' && formData.permit_code,
                  })(<Select disabled={action !== 'create'} style={{ width: '100%' }}>
                    {
                    CIQ_LICENCE_TYPE.map(type => <Option value={type.value} key={type.text}>{`${type.value}|${type.text}`}</Option>)
                  }
                  </Select>)}
              </FormItem>)}
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('permitNo')}>
                {getFieldDecorator('permit_no', {
                  initialValue: action === 'edit' && formData.permit_no,
                  rules: [{ required: true, message: '证书编号必填' }],
                  })(<Input disabled={action !== 'create'} />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('usageControl')}>
                {getFieldDecorator('usage_control', {
                  })(<Switch checked={usageControl} onChange={this.handleUsageChange} checkedChildren="开启" unCheckedChildren="关闭" />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('maxUsage')}>
                {getFieldDecorator('max_usage', {
                  initialValue: action === 'edit' && formData.max_usage,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('availUsage')}>
                {getFieldDecorator('ava_usage', {
                  initialValue: action === 'edit' && formData.ava_usage,
                  })(<Input />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('expiryControl')}>
                {getFieldDecorator('expiry_control', {
                  })(<Switch checked={expiryControl} onChange={this.handleExpiryChange} checkedChildren="开启" unCheckedChildren="关闭" />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('startDate')}>
                {getFieldDecorator('start_date', {
                  initialValue: action === 'edit' && moment(formData.start_date),
                  })(<DatePicker format="YYYY/MM/DD" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col {...colSpan}>
              <FormItem {...formItemLayout} label={this.msg('stopDate')}>
                {getFieldDecorator('stop_date', {
                  initialValue: action === 'edit' && moment(formData.stop_date),
                  })(<DatePicker format="YYYY/MM/DD" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </FormPane>
    );
  }
}
