import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Popover, Button, Form, Input, Row, Col, Checkbox, Select, Icon } from 'antd';
import { updateGoodsLicenceInfo, loadGoodsLicenceInfo } from 'common/reducers/cmsCiqDeclare';
import { CIQ_DANG_PACK_TYPE } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@Form.create()
@connect(
  () => ({}),
  { updateGoodsLicenceInfo, loadGoodsLicenceInfo }
)
export default class GoodsLicencePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    goodsId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    info: {},
    dangerFlag: false,
  }
  componentWillMount() {
    this.props.loadGoodsLicenceInfo(this.props.goodsId).then((result) => {
      if (!result.error) {
        this.setState({
          info: result.data,
          dangerFlag: result.data.danger_flag === '1',
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsId !== this.props.goodsId && nextProps.goodsId) {
      this.props.form.resetFields();
      this.props.loadGoodsLicenceInfo(nextProps.goodsId).then((result) => {
        if (!result.error) {
          this.setState({
            info: result.data,
            dangerFlag: result.data.danger_flag === '1',
          });
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleChange = (e) => {
    this.setState({
      dangerFlag: e.target.checked,
    });
  }
  handleOk = () => {
    const { goodsId, form } = this.props;
    const { dangerFlag } = this.state;
    form.validateFields((err, values) => {
      this.props.updateGoodsLicenceInfo({ ...values, dangerFlag }, goodsId);
      this.setState({
        visible: false,
      });
    });
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  show = () => {
    this.setState({
      visible: true,
    });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { info, dangerFlag } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const content = (
      <Form className="form-layout-compact">
        <FormItem {...formItemLayout} colon={false} label={this.msg('isDangerChemical')}>
          <Checkbox
            checked={dangerFlag}
            onChange={this.handleChange}
          />
        </FormItem>
        <FormItem {...formItemLayout} colon={false} label={this.msg('dangUnCode')}>
          {getFieldDecorator('dang_un_code', {
            initialValue: info.dang_un_code,
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} colon={false} label={this.msg('dangName')}>
          {getFieldDecorator('dang_name', {
            initialValue: info.dang_name,
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} colon={false} label={this.msg('dangPackType')}>
          {getFieldDecorator('dang_pack_type', {
            initialValue: info.dang_pack_type,
          })(<Select style={{ width: '100%' }}>
            {CIQ_DANG_PACK_TYPE.map(type =>
              <Option key={type.value} value={type.value}>{type.text}</Option>)}
          </Select>)}
        </FormItem>
        <FormItem {...formItemLayout} colon={false} label={this.msg('dangPackSpec')}>
          {getFieldDecorator('dang_pack_spec', {
            initialValue: info.dang_pack_spec,
          })(<Input />)}
        </FormItem>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button onClick={this.handleCancel} style={{ marginRight: 8 }}>{this.msg('cancel')}</Button>
            <Button type="primary" onClick={this.handleOk}>{this.msg('ensure')}</Button>
          </Col>
        </Row>
      </Form>
    );
    return (
      <Popover
        title={this.msg('dangerInfo')}
        content={content}
        trigger="click"
        visible={this.state.visible}
      >
        <Button
          type="primary"
          size="small"
          ghost
          onClick={this.show}
        ><Icon type="ellipsis" /></Button>
      </Popover>
    );
  }
}
