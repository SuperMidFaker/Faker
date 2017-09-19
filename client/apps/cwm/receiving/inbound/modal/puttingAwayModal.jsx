import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Input, Modal, Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hidePuttingAwayModal, batchPutaways } from 'common/reducers/cwmReceive';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import moment from 'moment';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.cwmReceive.puttingAwayModal.visible,
    details: state.cwmReceive.puttingAwayModal.details,
    submitting: state.cwmReceive.submitting,
  }),
  { hidePuttingAwayModal, batchPutaways }
)
export default class PuttingAwayModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  state = {
    location: '',
    allocater: '',
    date: null,
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      let location = '';
      if (nextProps.details.length === 1) {
        location = nextProps.details[0].receive_location;
      }
      this.setState({
        location,
        allocater: nextProps.loginName,
        date: new Date(),
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hidePuttingAwayModal();
    this.setState({
      location: '',
      allocater: '',
      date: null,
    });
  }
  handleLocationChange = (value) => {
    this.setState({
      location: value,
    });
  }
  handleAllocaterChange = (ev) => {
    this.setState({ allocater: ev.target.value });
  }
  handleAllocateDateChange = (value) => {
    this.setState({ date: value });
  }
  handleSubmit = () => {
    const { location, allocater, date } = this.state;
    const { details, loginName, inboundNo, tenantId } = this.props;
    const traceIds = details.map(detail => detail.trace_id);
    this.props.batchPutaways(traceIds, location, allocater, date, loginName, inboundNo, tenantId).then((result) => {
      if (!result.error) {
        this.handleCancel();
      }
    });
  }
  render() {
    const { submitting } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    let recLocation = ''; // todo 没用逻辑
    let targetLocation = '';
    for (let i = 0; i < this.props.details.length; i++) {
      const detail = this.props.details[i];
      if (recLocation === '' && detail.receive_location) {
        recLocation = detail.receive_location;
      } else if (detail.receive_location && recLocation !== false && recLocation !== detail.receive_location) {
        recLocation = false;
      }
      if (targetLocation === '' && detail.target_location) {
        targetLocation = detail.target_location;
      } else if (detail.target_location && targetLocation !== false && targetLocation !== detail.target_location) {
        targetLocation = false;
      }
    }
    return (
      <Modal title="上架确认" onCancel={this.handleCancel} visible={this.props.visible} confirmLoading={submitting} onOk={this.handleSubmit}>
        <FormItem {...formItemLayout} label="上架库位">
          <LocationSelect style={{ width: 160 }} onChange={this.handleLocationChange} value={this.state.location} />
        </FormItem>
        <FormItem {...formItemLayout} label="上架人员" >
          <Input onChange={this.handleAllocaterChange} value={this.state.allocater} />
        </FormItem>
        <FormItem {...formItemLayout} label="上架时间" >
          <DatePicker onChange={this.handleAllocateDateChange} value={moment(this.state.date)} showTime format="YYYY/MM/DD HH:mm" />
        </FormItem>
      </Modal>
    );
  }
}
