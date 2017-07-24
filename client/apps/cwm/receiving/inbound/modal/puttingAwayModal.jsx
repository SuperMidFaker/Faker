import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Input, Modal, Select, Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hidePuttingAwayModal, batchPutaways } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    locations: state.cwmWarehouse.locations,
    visible: state.cwmReceive.puttingAwayModal.visible,
    details: state.cwmReceive.puttingAwayModal.details,
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
    allocate_date: null,
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
    const { details, loginId, inboundNo, tenantId } = this.props;
    const traceIds = details.map(detail => detail.trace_id);
    this.props.batchPutaways(traceIds, location, allocater, date, loginId, inboundNo, tenantId).then((result) => {
      if (!result.error) {
        this.handleCancel();
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    let recLocation = '';
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
      <Modal title="上架确认" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <FormItem {...formItemLayout} label="实际库位">
          <Select showSearch style={{ width: 160 }} onSelect={this.handleLocationChange} value={this.state.location}>
            {this.props.locations.map((loc) => {
              let prefix;
              if (loc.location === recLocation) {
                prefix = '收货库位: ';
              } else if (loc.location === targetLocation) {
                prefix = '目标库位: ';
              }
              return <Option value={loc.location} key={loc.location}>{prefix}{loc.location}</Option>;
            })}
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="上架人员" >
          <Input onChange={this.handleAllocaterChange} value={this.state.allocater} />
        </FormItem>
        <FormItem {...formItemLayout} label="上架时间" >
          <DatePicker onChange={this.handleAllocateDateChange} value={this.state.date} />
        </FormItem>
      </Modal>
    );
  }
}
