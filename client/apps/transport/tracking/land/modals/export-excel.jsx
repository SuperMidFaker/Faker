import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Button, DatePicker, Modal, Radio, Select, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import moment from 'moment';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const startDate = new Date();
startDate.setDate(1);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class ExportExcel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    startDate: `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
    endDate: `${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`,
    dateType: '',
    sheetRadio: 'customer',
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = () => {
    const { dateType, endDate, sheetRadio } = this.state;
    const { tenantId } = this.props;
    if (dateType !== '') {
      window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentExcel/${createFilename('tracking')}.xlsx?tenantId=${tenantId}&startDate=${this.state.startDate}&endDate=${endDate}&dateType=${dateType}&sheetMode=${sheetRadio}`);
      this.handleClose();
    } else {
      message.error('请选择参照时间类型');
    }
  }
  handleClose = () => {
    this.setState({
      visible: false,
    });
  }
  handleRangeChange = (value, dateString) => {
    this.setState({
      startDate: `${dateString[0]} 00:00:00`,
      endDate: `${dateString[1]} 23:59:59`,
    });
  }
  handleDateTypeChange = (value) => {
    this.setState({ dateType: value });
  }
  handleSheetModeChange = (ev) => {
    this.setState({ sheetRadio: ev.target.value });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { sheetRadio } = this.state;
    return (
      <span>
        <Button type="primary" ghost icon="export" onClick={this.showModal}>{this.msg('export')}</Button>
        <Modal maskClosable={false} title={this.msg('exportExcel')}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleClose}
        >
          <Form layout="horizontal">
            <FormItem label="参照时间" labelCol={{ span: 6 }}
              wrapperCol={{ span: 13 }}
            >
              <Select onChange={this.handleDateTypeChange}>
                <Option value="pickupEstDate">预计提货时间</Option>
                <Option value="deliverEstDate">预计送货时间</Option>
                <Option value="pickupActDate">实际提货时间</Option>
                <Option value="deliverActDate">实际送货时间</Option>
              </Select>
            </FormItem>
            <FormItem
              label="时间范围"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <RangePicker value={
                [moment(this.state.startDate), moment(this.state.endDate)]
              } onChange={this.handleRangeChange}
              />
            </FormItem>
            <FormItem
              label="Sheet分组"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <RadioGroup onChange={this.handleSheetModeChange} value={sheetRadio} size="large">
                <RadioButton value="customer">按客户</RadioButton>
                <RadioButton value="none">不分组</RadioButton>
              </RadioGroup>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}
