import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Button, Select, DatePicker, Row, Col } from 'ant-ui';
import moment from 'moment';

function noop() {}

export default class SegmentDock extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.onCloseWrapper = () => {
      this.setState({segments: [(<Button type="dashed" style={{ width: 400 }} onClick={() => this.handleAddSegment(true)}><Icon type="plus" />添加中转站</Button>)]});
      this.onClose();
    };
  }

  state = {
    segments: [(<Button type="dashed" style={{ width: 400 }} onClick={() => this.handleAddSegment(true)}><Icon type="plus" />添加中转站</Button>)]
  }

  componentWillMount() {

  }

  handleAddSegment(e) {
    if (e) {
      const segments = [(
        <div className="segment-group">
          <Row type="flex" justify="start">
            <Col span="12">中转站：</Col>
          </Row>
          <Row type="flex" justify="start">
            <Select defaultValue="lucy" style={{ width: 400 }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="yiminghe">yiminghe</Option>
            </Select>
          </Row>
          <Row type="flex" justify="start">
            <Col span="12">预计到达中转站时间：</Col>
            <Col span="12">运输模式：</Col>
          </Row>
          <Row type="flex" justify="start">
            <Col span="12"><DatePicker defaultValue="2015-01-01" /></Col>
            <Col span="12">
              <Select defaultValue="lucy" style={{ width: 200 }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
                <Option value="yiminghe">yiminghe</Option>
              </Select>
            </Col>
          </Row>
          <Row type="flex" justify="start">
            <Col span="12">预计离开中转站时间：</Col>
            <Col span="12">运输模式：</Col>
          </Row>
          <Row type="flex" justify="start">
            <Col span="12"><DatePicker defaultValue="2015-01-01" /></Col>
            <Col span="12">
              <Select defaultValue="lucy" style={{ width: 200 }}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
                <Option value="yiminghe">yiminghe</Option>
              </Select>
            </Col>
          </Row>
        </div>
        )];
      this.setState({segments});
    }
  }

  render() {
    const { show, shipmts } = this.props;
    let dock = '';
    if (show) {
      const arr = [];
      let close = true;
      let totalCount = 0;
      let totalWeight = 0;
      let totalVolume = 0;
      if (shipmts.length === 1) {
        close = false;
      }
      shipmts.forEach(v => {
        arr.push((<Tag closable={close} color="blue">{v.shipmt_no}</Tag>));
        if (!isNaN(v.total_count)) {
          totalCount += v.total_count;
        }
        if (!isNaN(v.total_weight)) {
          totalWeight += v.total_weight;
        }
        if (!isNaN(v.total_volume)) {
          totalVolume += v.total_volume;
        }
      });

      dock = (<div className="dock-container" key="dock2">
                <div className="dock-content" style={{width: 480}}>
                  <div className="dock-sp-line"></div>
                  <div className="dock-sp">
                    <div className="dock-sp-body">
                      <div className="dock-sp-toolbar">
                        <a onClick={ this.onCloseWrapper }><Icon type="cross" className="closable"/></a>
                        <div className="shipno-container">
                          <span className="detail-title">共 {shipmts.length} 订单，{totalCount}件，{totalWeight}公斤，{totalVolume}立方</span>
                          {arr}
                        </div>
                      </div>
                      <div className="dock-sp-content">
                        <div className="segment-container">
                          <h3>时间计划</h3>
                          <Row type="flex" justify="start">
                            <Col span="12">提货日期：2016-5-2</Col>
                            <Col span="12">交货日期：2016-5-6</Col>
                          </Row>
                          <h3>分段中转</h3>
                          <div className="segment-group">
                            <Row type="flex" justify="start">
                              <Col span="12">中转站：</Col>
                            </Row>
                            <Row type="flex" justify="start">
                              <Select defaultValue="lucy" style={{ width: 400 }}>
                                <Option value="jack">Jack</Option>
                                <Option value="lucy">Lucy</Option>
                                <Option value="disabled" disabled>Disabled</Option>
                                <Option value="yiminghe">yiminghe</Option>
                              </Select>
                            </Row>
                            <Row type="flex" justify="start">
                              <Col span="12">预计到达中转站时间：</Col>
                              <Col span="12">运输模式：</Col>
                            </Row>
                            <Row type="flex" justify="start">
                              <Col span="12"><DatePicker defaultValue="2015-01-01" /></Col>
                              <Col span="12">
                                <Select defaultValue="lucy" style={{ width: 200 }}>
                                  <Option value="jack">Jack</Option>
                                  <Option value="lucy">Lucy</Option>
                                  <Option value="disabled" disabled>Disabled</Option>
                                  <Option value="yiminghe">yiminghe</Option>
                                </Select>
                              </Col>
                            </Row>
                            <Row type="flex" justify="start">
                              <Col span="12">预计离开中转站时间：</Col>
                              <Col span="12">运输模式：</Col>
                            </Row>
                            <Row type="flex" justify="start">
                              <Col span="12"><DatePicker defaultValue="2015-01-01" /></Col>
                              <Col span="12">
                                <Select defaultValue="lucy" style={{ width: 200 }}>
                                  <Option value="jack">Jack</Option>
                                  <Option value="lucy">Lucy</Option>
                                  <Option value="disabled" disabled>Disabled</Option>
                                  <Option value="yiminghe">yiminghe</Option>
                                </Select>
                              </Col>
                            </Row>
                          </div>
                          {this.state.segments}
                          <div className="segment-btns">
                            <Button type="ghost" onClick={ this.onCloseWrapper }>{this.msg('btnTextCancel')}</Button>
                            <span className="ant-divider" style={{width: '0px'}}/>
                            <Button type="primary">{this.msg('btnTextOk')}</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>);
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{translateX:[0, 480], opacity:[1, 1]}}>{dock}</QueueAnim>
    );
  }
}
