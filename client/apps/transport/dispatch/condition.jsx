import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Popover, Radio, Slider, Row, Col } from 'antd';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function noop() { }

class Condition extends React.Component {
  static propTypes = {
    msg: PropTypes.func.isRequired,
    onConditionChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.msg = props.msg || noop;
    this.onConditionChange = props.onConditionChange || noop;
  }

  state = {
    type: 'subline',
    consignerStep: 20,
    consigneeStep: 20,
    filterVisible: false,
    filterView: [],
  }

  componentWillMount() {
    this.handleFilterTypeChange({ target: { value: 'subline' } });
  }

  handleFilterVisibleChange(visible) {
    this.setState({
      filterVisible: visible,
    });
  }

  handleFilterTypeChange(e) {
    const type = e.target.value;

    const markscor = {
      0: this.msg('filterProvince'),
      20: this.msg('filterCity'),
      40: this.msg('filterDistrict'),
      60: this.msg('filterPlace'),
      80: this.msg('filterConsignor'),
    };
    const markscee = {
      0: this.msg('filterProvince'),
      20: this.msg('filterCity'),
      40: this.msg('filterDistrict'),
      60: this.msg('filterAddr'),
      80: this.msg('filterConsignee'),
    };

    const filterView = [];
    if (type === 'consigner' || type === 'subline') {
      filterView.push(
        (<Row type="flex" justify="start"><h3>{this.msg('filterTextConsignor')}：</h3></Row>),
        (<Row><Slider key="consignor" step={null} max="80" marks={markscor} defaultValue={this.state.consignerStep} onChange={this.handleSliderChange.bind(this, 'consignor')} /></Row>)
      );
    }
    if (type === 'consignee' || type === 'subline') {
      filterView.push(
        (<Row type="flex" justify="start"><h3>{this.msg('filterTextConsignee')}：</h3></Row>),
        (<Row><Slider key="consignee" step={null} max="80" marks={markscee} defaultValue={this.state.consigneeStep} onChange={this.handleSliderChange.bind(this, 'consignee')} /></Row>)
      );
    }
    this.setState({ filterView, type });
  }

  handleSliderChange(type, val) {
    if (type === 'consignor') {
      const consignerStep = val;
      this.setState({ consignerStep });
    } else if (type === 'consignee') {
      const consigneeStep = val;
      this.setState({ consigneeStep });
    }
  }

  hideFilter() {
    this.setState({
      filterVisible: false,
    });
  }

  handleOk() {
    const { type, consignerStep, consigneeStep } = this.state;
    this.setState({
      filterVisible: false,
    }, () => {
      this.onConditionChange({ type, consignerStep, consigneeStep });
    });
  }

  render() {
    const content = (
      <div className="dispatch-filter">
        <Row type="flex" justify="center">
          <RadioGroup onChange={this.handleFilterTypeChange.bind(this)} value={this.state.type}>
            <RadioButton value="subline">{this.msg('filterTitleSubLine')}</RadioButton>
            <RadioButton value="consigner">{this.msg('filterTitleConsignor')}</RadioButton>
            <RadioButton value="consignee">{this.msg('filterTitleConsignee')}</RadioButton>
          </RadioGroup>
        </Row>
        {this.state.filterView}
        <Row type="flex" justify="end" style={{ paddingTop: '20px' }}>
          <Col span="4"><Button type="ghost" onClick={this.hideFilter.bind(this)}>{this.msg('btnTextCancel')}</Button></Col>
          <Col span="4"><Button type="primary" onClick={() => this.handleOk()}>{this.msg('btnTextOk')}</Button></Col>
        </Row>
      </div>
    );
    return (
      <Popover placement="bottomLeft" content={content} trigger="click"
        overlayStyle={{ left: 132 }}
        visible={this.state.filterVisible} onVisibleChange={this.handleFilterVisibleChange.bind(this)}
      >
        <Button>
          <span>{this.msg('filterTitle')}</span><Icon type="down" />
        </Button>
      </Popover>
    );
  }
}


export default Condition;
