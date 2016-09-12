import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Button, DatePicker, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import moment from 'moment';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const startDate = new Date();
startDate.setDate(1);

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
    startDate: `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
    endDate: `${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`,
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = () => {
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentExcel/${createFilename('tracking')}.xlsx?tenantId=${this.props.tenantId}&startDate=${this.state.startDate}&endDate=${this.state.endDate}`);
    this.handleClose();
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    return (
      <span>
        <Button icon="export" onClick={this.showModal}>{this.msg('export')}</Button>
        <Modal title={this.msg('exportExcel')}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleClose}
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
