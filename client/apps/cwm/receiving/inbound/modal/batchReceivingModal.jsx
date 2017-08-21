import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Checkbox, Modal, Select, Form, DatePicker, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideBatchReceivingModal, batchReceive } from 'common/reducers/cwmReceive';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import moment from 'moment';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    username: state.account.username,
    visible: state.cwmReceive.batchReceivingModal.visible,
    inboundHead: state.cwmReceive.inboundFormHead,
  }),
  { hideBatchReceivingModal, batchReceive }
)
export default class BatchReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
    location: '',
    damageLevel: 0,
    receivedDate: null,
  }
  componentWillMount() {
    this.setState({
      receivedDate: new Date(),
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideBatchReceivingModal();
    this.setState({
      location: '',
    });
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
  handleReceivedDateChange = (date) => {
    this.setState({ receivedDate: date.toDate() });
  }
  handleSubmit = () => {
    const { location, damageLevel, receivedDate } = this.state;
    if (!location) {
      message.info('请选择库位');
      return;
    }
    const { data, inboundNo, inboundHead, username } = this.props;
    const seqNos = data.map(dt => dt.asn_seq_no);
    this.props.batchReceive(seqNos, location, damageLevel, inboundHead.asn_no, inboundNo, username, receivedDate).then((result) => {
      if (!result.error) {
        this.handleCancel();
      }
    });
  }
  render() {
    const { receivedDate } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal title="批量收货" onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit} okText="确认收货">
        <FormItem {...formItemLayout} label="收货数量">
          <Checkbox checked>实际收货数量与预期一致</Checkbox>
        </FormItem>
        <FormItem {...formItemLayout} label="包装情况" >
          <Select style={{ width: 160 }} onSelect={this.handleDamageLevelChange} value={this.state.damageLevel}>
            <Option value={0}>完好</Option>
            <Option value={1}>轻微擦痕</Option>
            <Option value={2}>中度</Option>
            <Option value={3}>重度</Option>
            <Option value={4}>严重磨损</Option>
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="收货库位">
          <LocationSelect style={{ width: 160 }} onSelect={this.handleLocationChange} value={this.state.location} showSearch />
        </FormItem>
        <FormItem {...formItemLayout} label="收货库位">
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"
            value={receivedDate ? moment(receivedDate) : null} onChange={this.handleReceivedDateChange}
          />
        </FormItem>
      </Modal>
    );
  }
}
