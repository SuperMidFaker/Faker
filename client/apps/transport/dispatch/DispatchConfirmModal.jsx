import React, { PropTypes, Component } from 'react';
import { Radio, Icon, Modal, Button } from 'antd';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default class DispatchConfirmModal extends Component {
  static propTypes = {
    shipmts: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDispatchAndSend: PropTypes.func.isRequired,
    onDispatch: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    target: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.onChange = props.onChange;
  }

  state = {
    podType: 'ePOD',
    visible: false,
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible || this.state.visible,
    });
  }

  handlePodTypeChange(e) {
    const podType = e.target.value;
    this.setState({ podType });
    this.onChange(podType);
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  render() {
    const [shipmt] = this.props.shipmts;
    const { target, type } = this.props;
    let msg = `即将【${shipmt.shipmt_no}】分配给【${target.partner_name}】承运，请选择对回单的要求：`;
    if (type === 'vehicle') {
      msg = `将【${shipmt.shipmt_no}】分配给【${target.plate_number}】承运，请选择对回单的要求：`;
    }
    return (
      <Modal title="确认回单要求" visible={this.state.visible} onCalcel={this.handleCancel}

        footer={[
          <Button key="calcel" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
          <Button key="dispatch" type="primary" size="large" onClick={this.props.onDispatch}>
            确定
          </Button>,
          <Button key="diapatchAndSend" type="primary" size="large" onClick={this.props.onDispatchAndSend}>
            确定并发送
          </Button>,
        ]}
      >
        <div className="dispatch-confirm">
          <div style={{ marginBottom: 10 }}>{msg}</div>
          <RadioGroup onChange={(e) => this.handlePodTypeChange(e)} value={this.state.podType}>
            <RadioButton key="a" value={'ePOD'}><Icon type="scan" />拍摄上传</RadioButton>
            <RadioButton key="c" value={'qrPOD'}><Icon type="qrcode" />扫码签收</RadioButton>
            <RadioButton key="b" value={'none'}><Icon type="file-excel" />无须上传</RadioButton>
          </RadioGroup>
        </div>
      </Modal>
    );
  }
}
