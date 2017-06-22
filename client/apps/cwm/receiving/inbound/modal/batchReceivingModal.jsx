import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Checkbox, Modal, Select, Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideBatchReceivingModal, updateInboundDetails } from 'common/reducers/cwmReceive';
import { loadLocations } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    locations: state.cwmWarehouse.locations,
    defaultWhse: state.cwmContext.defaultWhse,
    visible: state.cwmReceive.batchReceivingModal.visible,
  }),
  { hideBatchReceivingModal, loadLocations, updateInboundDetails }
)
export default class BatchReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    location: '',
    damageLevel: '',
  }
  componentWillMount() {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadLocations(whseCode);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideBatchReceivingModal();
  }
  handleLocationChange = (value) => {
    this.setState({
      location: value,
    });
  }
  handleDamageLevelChange = (value) => {
    this.setState({
      damageLevel: value,
    });
  }
  handleSubmit = () => {
    const { location, damageLevel } = this.state;
    const { data, loginId, inboundNo, asnNo } = this.props;
    const seqNos = [];
    for (let i = 0; i < data.length; i++) {
      seqNos.push(data[i].asn_seq_no);
    }
    this.props.updateInboundDetails(seqNos, location, damageLevel, loginId, asnNo, inboundNo).then((result) => {
      if (!result.error) {
        this.props.reload();
        this.props.hideBatchReceivingModal();
        this.setState({
          location: '',
          damageLevel: '',
        });
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal title="批量收货" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit} okText="确认收货">
        <FormItem {...formItemLayout} label="收货数量">
          <Checkbox checked disabled>实际收货数量与预期一致</Checkbox>
        </FormItem>
        <FormItem {...formItemLayout} label="库位">
          <Select style={{ width: 160 }} onSelect={this.handleLocationChange}>
            {this.props.locations.map(loc => (<Option value={loc.location} key={loc.location}>{loc.location}</Option>))}
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="破损级别" >
          <Select style={{ width: 160 }} onSelect={this.handleDamageLevelChange}>
            <Option value={0}>完好</Option>
            <Option value={1}>轻微擦痕</Option>
            <Option value={2}>中度</Option>
            <Option value={3}>重度</Option>
            <Option value={4}>严重磨损</Option>
          </Select>
        </FormItem>
      </Modal>
    );
  }
}
