import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Button, Select, DatePicker, Row, Col, message, Alert } from 'antd';
import moment from 'moment';
import { segmentRequest } from 'common/reducers/transportDispatch';
import { connect } from 'react-redux';

const Option = Select.Option;

function noop() {}

@connect(state => ({
  nodeLocations: state.transportDispatch.nodeLocations,
  transitModes: state.transportDispatch.transitModes,
}), { segmentRequest })
export default class SegmentDock extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired,
    nodeLocations: PropTypes.array.isRequired,
    transitModes: PropTypes.array.isRequired,
    segmentRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.onCloseWrapper = (reload) => {
      this.setState({
        segments: [(<Button type="dashed" style={{ width: 400 }} onClick={() => this.handleAddSegment(true)}><Icon type="plus" />添加中转站</Button>)],
        twoable: false,
        errable: false,
        segGroupFirst: {
          nodeLocation: {},
          deliverEstDate: null,
          pickupEstDate: null,
          deliverMode: {},
          pickupMode: {},
        },
        segGroupSecond: {
          nodeLocation: {},
          deliverEstDate: null,
          pickupEstDate: null,
          deliverMode: {},
          pickupMode: {},
        },
      });
      this.onClose(reload);
    };
  }

  state = {
    segments: [(<Button type="dashed" style={{ width: 400 }} onClick={() => this.handleAddSegment(true)}><Icon type="plus" />添加中转站</Button>)],
    twoable: false,
    errable: false,
    segGroupFirst: {
      nodeLocation: {},
      deliverEstDate: null,
      pickupEstDate: null,
      deliverMode: {},
      pickupMode: {},
    },
    segGroupSecond: {
      nodeLocation: {},
      deliverEstDate: null,
      pickupEstDate: null,
      deliverMode: {},
      pickupMode: {},
    },
  }

  buildSegmentGroup(order) {
    const od = order || 1;
    const nds = this.props.nodeLocations.map(nd =>
      <Option key={nd.node_id} value={nd.node_id}>{nd.name}</Option>);
    const mds = this.props.transitModes.map(t =>
      <Option key={t.id} value={t.id}>{t.mode_name}</Option>);
    const s = (
      <div className="pane-section">
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
      this.setState({ segments, twoable: true });
    }
  }

  handleDayChange(order, type, date) {
    if (order === 1) {
      const { segGroupFirst } = this.state;
      if (type === 'deliver') {
        segGroupFirst.deliverEstDate = date;
      } else if (type === 'pickup') {
        segGroupFirst.pickupEstDate = date;
      }
      this.setState(segGroupFirst);
    } else {
      const { segGroupSecond } = this.state;
      if (type === 'deliver') {
        segGroupSecond.deliverEstDate = date;
      } else if (type === 'pickup') {
        segGroupSecond.pickupEstDate = date;
      }
      this.setState(segGroupSecond);
    }
  }

  handleTransitModeChange(order, type, value) {
    const mode = this.props.transitModes.filter(v => v.id === value)[0];
    if (order === 1) {
      const { segGroupFirst } = this.state;
      if (type === 'deliver') {
        segGroupFirst.deliverMode = mode;
      } else if (type === 'pickup') {
        segGroupFirst.pickupMode = mode;
      }
      this.setState(segGroupFirst);
    } else {
      const { segGroupSecond } = this.state;
      if (type === 'deliver') {
        segGroupSecond.deliverMode = mode;
      } else if (type === 'pickup') {
        segGroupSecond.pickupMode = mode;
      }
      this.setState(segGroupSecond);
    }
  }

  handleNodeLocationChange(order, value) {
    const nd = this.props.nodeLocations.filter(v => v.node_id === value)[0];
    if (order === 1) {
      const { segGroupFirst } = this.state;
      segGroupFirst.nodeLocation = nd;
      this.setState(segGroupFirst);
    } else {
      const { segGroupSecond } = this.state;
      segGroupSecond.nodeLocation = nd;
      this.setState(segGroupSecond);
    }
  }

  validGroup(group) {
    if (!group.nodeLocation || !group.nodeLocation.node_id) {
      return false;
    }
    if (!group.pickupMode || !group.pickupMode.id) {
      return false;
    }
    if (!group.deliverEstDate) {
      return false;
    }
    if (!group.pickupEstDate) {
      return false;
    }
    return true;
  }

  handleSegment= () => {
    const shipmtNos = this.props.shipmts.map(s => {
      return { shipmtNo: s.shipmt_no, dispId: s.key };
    });

    const { segGroupFirst, segGroupSecond, twoable } = this.state;
    if (!this.validGroup(segGroupFirst)) {
      this.setState({ errable: true });
      return;
    }
    if (twoable && !this.validGroup(segGroupSecond)) {
      this.setState({ errable: true });
      return;
    }
    this.props.segmentRequest(null, {
      shipmtNos,
      segGroupFirst,
      segGroupSecond,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.onCloseWrapper(true);
      }
    });
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
      let err = '';
      if (this.state.errable) {
        err = (<Alert message="分段参数错误" type="error" showIcon closable />);
      }

      /*
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
                          {err}
                          {sg}
                          {this.state.segments}
                          <div className="segment-btns">
                            <Button type="ghost" onClick={ this.onCloseWrapper }>{this.msg('btnTextCancel')}</Button>
                            <span className="ant-divider" style={{width: '0px'}}/>
                            <Button type="primary" onClick={this.handleSegment }>{this.msg('btnTextOk')}</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>);
              */
      dock = (
          <div className="dock-panel inside">
            <div className="panel-content">
              <div className="header">
                <span className="title">分段 {shipmts.length}个运单</span>
                <Tag>共{totalCount}件/{totalWeight}公斤/{totalVolume}立方</Tag>
                <div className="pull-right">
                  <Button type="ghost" shape="circle-outline" onClick={this.onCloseWrapper}>
                    <Icon type="cross" />
                  </Button>
                </div>
              </div>
              <div className="body">
                <div className="pane-content">
                  <div className="subform-heading">
                    <h3 className="subform-title">时间计划</h3>
                  </div>
                  <Row className="pane-section" type="flex" justify="start">
                    <Col span="12">提货日期：{moment(shipmts[0].pickup_est_date).format('YYYY.MM.DD')}</Col>
                    <Col span="12">交货日期：{moment(shipmts[0].deliver_est_date).format('YYYY.MM.DD')}</Col>
                  </Row>
                  <div className="subform-heading">
                    <h3 className="subform-title">分段中转</h3>
                  </div>
                  {err}
                  {sg}
                  {this.state.segments}
                  <div style={{ marginTop: 24 }}>
                    <Button type="ghost" onClick={this.onCloseWrapper}>{this.msg('btnTextCancel')}</Button>
                    <span className="ant-divider" style={{ width: '0px' }} />
                    <Button type="primary" onClick={this.handleSegment}>{this.msg('btnTextOk')}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{ translateX: [0, 480], opacity: [1, 1] }}>{dock}</QueueAnim>
    );
  }
}
