import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Row, Col, notification } from 'antd';
import { compareFtzStocks } from 'common/reducers/cwmShFtz';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { compareFtzStocks }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
    filter: PropTypes.object,
  }
  state = {
    expandForm: false,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse !== this.props.defaultWhse) {
      this.props.form.resetFields();
    }
  }
  msg = formatMsg(this.props.intl);
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }
  handleCompareTask = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const owner = this.props.owners.filter(own => own.customs_code === values.ownerCode)[0];
        const formData = {
          ftz_ent_no: values.entNo,
          owner: { name: owner.name, customs_code: owner.customs_code },
          ftz_whse_code: this.props.defaultWhse.ftz_whse_code,
          whse_code: this.props.defaultWhse.code,
        };
        this.props.compareFtzStocks(formData).then((result) => {
          if (result.error) {
            if (result.error.message === 'WHSE_FTZ_UNEXIST') {
              notification.error({
                message: '操作失败',
                description: '仓库监管系统未配置',
              });
            } else {
              notification.error({
                message: '操作失败',
                description: result.error.message,
                duration: 15,
              });
            }
          } else {
            notification.success({
              message: '添加任务成功',
              description: '请至侧边栏查看任务对比进度',
            });
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('owner')}>
              {getFieldDecorator('ownerCode', {
                initialValue: filter.ownerCode,
                rules: [{ required: true }],
              })(<Select showSearch optionFilterProp="children" allowClear>
                {owners.map(owner => (<Option value={owner.customs_code} key={owner.id}>{owner.name}</Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('ftzEntNo')}>
              {getFieldDecorator('entNo')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('ftzRelNo')}>
              {getFieldDecorator('relNo')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem>
              <Button type="primary" onClick={this.handleStockSearch}>{this.msg('inquiry')}</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>{this.msg('reset')}</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
