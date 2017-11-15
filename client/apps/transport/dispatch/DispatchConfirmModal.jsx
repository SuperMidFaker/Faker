import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Radio, Icon, Modal, Button } from 'antd';
import { showDispatchConfirmModal } from 'common/reducers/transportDispatch';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@connect(state => ({
  type: state.transportDispatch.dispatchConfirmModal.type,
  target: state.transportDispatch.dispatchConfirmModal.target,
  visible: state.transportDispatch.dispatchConfirmModal.visible,
}), { showDispatchConfirmModal })
export default class DispatchConfirmModal extends Component {
  static propTypes = {
    shipmts: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDispatchAndSend: PropTypes.func.isRequired,
    onDispatch: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    target: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    showDispatchConfirmModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.onChange = props.onChange;
  }

  state = {
    podType: 'ePOD',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        visible: nextProps.visible,
      });
    }
  }

  handlePodTypeChange(e) {
    const podType = e.target.value;
    this.setState({ podType });
    this.onChange(podType);
  }

  handleCancel = () => {
    this.props.showDispatchConfirmModal(false, '', {});
  }

  handleDispatch = () => {
    this.handleCancel();
    this.props.onDispatch();
  }

  handleDispatchAndSend = () => {
    this.handleCancel();
    this.props.onDispatchAndSend();
  }

  render() {
    /*
    let msg = `即将【${shipmt.shipmt_no}】分配给【${target.partner_name}】承运，请选择对回单的要求：`;
    if (type === 'vehicle') {
      msg = `将【${shipmt.shipmt_no}】分配给【${target.plate_number}】承运，请选择对回单的要求：`;
    } */
    return (
      <Modal maskClosable={false} title="确认回单要求" visible={this.props.visible} onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
          <Button key="dispatch" type="default" onClick={this.handleDispatch}>
            确定
          </Button>,
          <Button key="diapatchAndSend" type="primary" onClick={this.handleDispatchAndSend}>
            确定并发送
          </Button>,
        ]}
      >
        <div className="dispatch-confirm">
          <div style={{ marginBottom: 10 }} />
          <RadioGroup onChange={e => this.handlePodTypeChange(e)} value={this.state.podType}>
            <RadioButton key="a" value={'ePOD'}><Icon type="scan" /> 拍摄上传</RadioButton>
            <RadioButton key="c" value={'qrPOD'}><Icon type="qrcode" /> 扫码签收</RadioButton>
            <RadioButton key="b" value={'none'}><Icon type="file-excel" /> 无须上传</RadioButton>
          </RadioGroup>
        </div>
      </Modal>
    );
  }
}
