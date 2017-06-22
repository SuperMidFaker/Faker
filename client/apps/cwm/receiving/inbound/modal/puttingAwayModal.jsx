import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { DatePicker, Input, Modal, Select, Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hidePuttingAwayModal, updateInboundDetails } from 'common/reducers/cwmReceive';
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
    visible: state.cwmReceive.puttingAwayModal.visible,
  }),
  { hidePuttingAwayModal, loadLocations, updateInboundDetails }
)
export default class PuttingAwayModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    receivingMode: PropTypes.string.isRequired,
    inboundNo: PropTypes.string.isRequired,
  }
  state = {
    location: '',
  }
  componentWillMount() {
    const whseCode = this.props.defaultWhse.code;
    this.props.loadLocations(whseCode);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hidePuttingAwayModal();
  }
  handleLocationChange = (value) => {
    this.setState({
      location: value,
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
        this.props.hidePuttingAwayModal();
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
    const title = this.props.receivingMode === 'scan' ? '上架记录' : '上架确认';
    return (
      <Modal title={title} onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit}>
        <FormItem {...formItemLayout} label="实际库位">
          <Select showSearch style={{ width: 160 }} onSelect={this.handleLocationChange}>
            <Option value={'A123456'} key="current">收货库位: A123456</Option>
            <Option value={'B123456'} key="target">目标库位: B123456</Option>
            {this.props.locations.map(loc => (<Option value={loc.location} key={loc.location}>{loc.location}</Option>))}
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="上架人员" >
          <Input />
        </FormItem>
        <FormItem {...formItemLayout} label="上架时间" >
          <DatePicker />
        </FormItem>
      </Modal>
    );
  }
}
