import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Button, Select, DatePicker, Row, Col } from 'ant-ui';
import moment from 'moment';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadSegRq } from 'universal/redux/reducers/transportDispatch';
import { connect } from 'react-redux';

const Option = Select.Option;

function noop() {}

function fetch({ state, dispatch, cookie }) {
  return dispatch(loadSegRq(cookie, {
    tenantId: state.account.tenantId
  }));
}

@connectFetch()(fetch)
@connect(state => ({
  nodeLocations: state.transportDispatch.nodeLocations,
  transitModes: state.transportDispatch.transitModes
}))
export default class SegmentDock extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired,
    nodeLocations: PropTypes.array.isRequired,
    transitModes: PropTypes.array.isRequired
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
    segments: [(<Button type="dashed" style={{ width: 400 }} onClick={() => this.handleAddSegment(true)}><Icon type="plus" />添加中转站</Button>)],
    segGroupFirst: {
      nodeLocation: {},
      deliverEstDate: null,
      pickupEstDate: null,
      deliverMode: {},
      pickupMode: {}
    },
    segGroupSecond: {
      nodeLocation: {},
      deliverEstDate: null,
      pickupEstDate: null,
      deliverMode: {},
      pickupMode: {}
    }
  }

  buildSegmentGroup(order) {
    const od = order || 1;
    const nds = this.props.nodeLocations.map(nd =>
      <Option key={nd.node_id} value={nd.node_id}>{nd.name}</Option>);
    const mds = this.props.transitModes.map(t =>
      <Option key={t.id} value={t.id}>{t.mode_name}</Option>);
    const s = (
      <div className="segment-group">
        <Row type="flex" justify="start">
          <Col span="12">中转站：</Col>
        </Row>
        <Row type="flex" justify="start">
          <Select style={{ width: 400 }} onChange={this.handleNodeLocationChange.bind(this, od)}>
            {nds}
          </Select>
        </Row>
        <Row type="flex" justify="start">
          <Col span="12">预计到达中转站时间：</Col>
          <Col span="12">运输模式：</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span="12"><DatePicker format="yyyy.MM.dd" onChange={this.handleDayChange.bind(this, od, 'deliver')} /></Col>
          <Col span="12">
            <Select style={{ width: 200 }} onChange={this.handleTransitModeChange.bind(this, od, 'deliver')}>
              {mds}
            </Select>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span="12">预计离开中转站时间：</Col>
          <Col span="12">运输模式：</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span="12"><DatePicker format="yyyy.MM.dd" onChange={this.handleDayChange.bind(this, od, 'pickup')} /></Col>
          <Col span="12">
            <Select style={{ width: 200 }} onChange={this.handleTransitModeChange.bind(this, od, 'pickup')}>
              {mds}
            </Select>
          </Col>
        </Row>
      </div>);
    return s;
  }

  handleAddSegment(e) {
    if (e) {
      const segments = [this.buildSegmentGroup(2)];
      this.setState({segments});
    }
  }

  handleDayChange(order, type, date) {
    console.log(order, type, date);
  }

  handleTransitModeChange(order, type, value) {
    console.log(order, type, value);
  }

  handleNodeLocationChange(order, value) {
    console.log(order, value);
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

      const sg = this.buildSegmentGroup();

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
                            <Col span="12">提货日期：{moment(shipmts[0].pickup_est_date).format('YYYY.MM.DD')}</Col>
                            <Col span="12">交货日期：{moment(shipmts[0].deliver_est_date).format('YYYY.MM.DD')}</Col>
                          </Row>
                          <h3>分段中转</h3>
                          {sg}
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
