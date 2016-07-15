import React, { PropTypes, Component } from 'react';
import { Radio, Icon } from 'antd';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default class MContent extends Component {
  static propTypes = {
    msg: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.msg = props.msg;
    this.onChange = props.onChange;
  }

  state = {
    podType: 'ePOD',
  }

  handlePodTypeChange(e) {
    const podType = e.target.value;
    this.setState({ podType });
    this.onChange(podType);
  }

  render() {
    return (
      <div className="dispatch-confirm">
        <div style={{ marginBottom: 10 }}>{this.msg}</div>
        <RadioGroup onChange={(e) => this.handlePodTypeChange(e)} value={this.state.podType}>
          <RadioButton key="a" value={'ePOD'}><Icon type="scan" />拍摄上传</RadioButton>
          <RadioButton key="c" value={'qrPOD'}><Icon type="qrcode" />扫码签收</RadioButton>
          <RadioButton key="b" value={'none'}><Icon type="file-excel" />无须上传</RadioButton>
        </RadioGroup>
      </div>
    );
  }
}
