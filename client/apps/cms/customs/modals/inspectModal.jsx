import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Switch, Col, DatePicker, Form, Modal, Input } from 'antd';
import { toggleInspectModal, setInspect } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsCustomsDeclare.inspectModal.visible,
    record: state.cmsCustomsDeclare.inspectModal.record,
  }),
  { toggleInspectModal, setInspect }
)
@Form.create()
export default class InspectModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    customsInspect: false,
    qualityInspect: false,
  }
  handleCancel = () => {
    this.props.toggleInspectModal(false);
    this.setState({
      customsInspect: false,
      qualityInspect: false,
    });
  }
  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.setInspect({
          id: this.props.record.id,
          entryId: values.entry_id,
          customsInsDate: values.customs_inspect_date,
          customsInsEndDate: values.customs_inspect_end_date,
          customsInsAmount: values.customs_inspect_amount,
          qualityInsAmount: values.quality_inspect_amount,
        }).then((result) => {
          if (!result.error) {
            this.props.reload();
            this.handleCancel();
          }
        });
      }
    });
  }
  handleSwitchCustomsIns = (checked) => {
    this.setState({
      customsInspect: checked,
    });
  }
  handleSwitchQualityIns = (checked) => {
    this.setState({
      qualityInspect: checked,
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, form: { getFieldDecorator }, record } = this.props;
    const { customsInspect, qualityInspect } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('查验')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('entry_id', {
              initialValue: record.entryId,
            })(<Input />)}
          </FormItem>
          <FormItem label="查验下达日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('customs_inspect_date', {
              initialValue: record.customsInsDate && moment(record.customsInsDate),
            })(<DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />)}
          </FormItem>
          <FormItem label="查验完成日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('customs_inspect_end_date', {
              initialValue: record.customsInspectEndDate && moment(record.customsInspectEndDate),
            })(<DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />)}
          </FormItem>
          <FormItem label="海关查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Col span={6}>
              <Switch checkedChildren="是" unCheckedChildren="否" checked={customsInspect} onChange={this.handleSwitchCustomsIns} />
            </Col>
            <Col span={18}>
              {getFieldDecorator('customs_inspect_amount')(<Input placeholder="收费金额" addonAfter="元" disabled={!customsInspect} />)}
            </Col>
          </FormItem>
          <FormItem label="质检查验" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Col span={6}>
              <Switch checkedChildren="是" unCheckedChildren="否" checked={qualityInspect} onChange={this.handleSwitchQualityIns} />
            </Col>
            <Col span={18}>
              {getFieldDecorator('quality_inspect_amount')(<Input placeholder="收费金额" addonAfter="元" disabled={!qualityInspect} />)}
            </Col>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
