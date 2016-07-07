import React, { PropTypes, Component } from 'react';
import { Radio, Icon } from 'ant-ui';
const RadioGroup = Radio.Group;

export default class MContent extends Component {
  static propTypes = {
    msg: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.msg = props.msg;
    this.onChange = props.onChange;
  }

  state = {
    podType: 'ePOD'
  }

  handlePodTypeChange(e) {
    const podType = e.target.value;
    this.setState({podType});
    this.onChange(podType);
  }

  render() {
    return (
      <div className="dispatch-confirm">
        <div style={{ marginBottom: 10 }}>{this.msg}</div>
        <RadioGroup onChange={(e) => this.handlePodTypeChange(e)} value={this.state.podType}>
          <Radio key="a" value={'ePOD'}><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="camera" />需要电子回单</Radio>
          <Radio key="b" value={'none'}><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="camera-o" />不要电子回单</Radio>
          <Radio key="c" value={'qrPOD'}><Icon style={{fontSize: 18, top: -3, marginLeft: 5, marginRight: 3}} type="qrcode" />扫描签收回单</Radio>
        </RadioGroup>
      </div>
    );
  }
}
