import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Button, DatePicker, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import moment from 'moment';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { })
export default class ExportExcel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    startDate: new Date(),
    endDate: new Date(),
  }
  showModal = () => {
    const startDate = new Date();
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    this.setState({
      visible: true,
      startDate,
      endDate,
    });
  }
  handleOk = () => {
    window.open(`${API_ROOTS.default}v1/transport/tracking/export/excel.xlsx?tenantId=${this.props.tenantId}&startDate=${this.state.startDate}&endDate=${this.state.endDate}`);
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleRangeChange = (value) => {
    this.setState({
      startDate: value[0],
      endDate: value[1],
    });
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)

  render() {
    return (
      <span>
        <Button type="primary" onClick={this.showModal}>{this.msg('export')}</Button>
        <Modal title={this.msg('exportExcel')}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form horizontal>
            <FormItem
              label="创建时间"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
              <RangePicker style={{ width: 184 }} defaultValue={[moment(this.state.startDate).format('YYYY-MM-DD'), moment(this.state.endDate).format('YYYY-MM-DD')]} onChange={this.handleRangeChange} />
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}
