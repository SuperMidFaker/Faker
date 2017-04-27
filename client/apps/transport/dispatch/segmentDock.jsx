import React, { PropTypes } from 'react';
import { Card, Icon, Tag, Button, Select, DatePicker, Row, Col, message, Alert, Form } from 'antd';
import DockPanel from 'client/components/DockPanel';
import InfoItem from 'client/components/InfoItem';
import { intlShape, injectIntl } from 'react-intl';
import { segmentRequest } from 'common/reducers/transportDispatch';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const Option = Select.Option;
const FormItem = Form.Item;
const formatMsg = format(messages);

function noop() {}
@injectIntl
@connect(state => ({
  nodeLocations: state.transportDispatch.nodeLocations,
  transitModes: state.transportDispatch.transitModes,
  visible: state.transportDispatch.segDockShow,
  shipmts: state.transportDispatch.shipmts,
}), { segmentRequest })
export default class SegmentDock extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired,
    nodeLocations: PropTypes.array.isRequired,
    transitModes: PropTypes.array.isRequired,
    segmentRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  buildSegmentGroup(order) {
    const od = order || 1;
    const nds = this.props.nodeLocations.map(nd =>
      <Option key={nd.node_id} value={nd.node_id}>{nd.name}</Option>);
    const mds = this.props.transitModes.map(t =>
      <Option key={t.id} value={t.id}>{t.mode_name}</Option>);
    const s = (
      <div className="pane-section">
        <Form layout="vertical">
          <FormItem label="中转站">
            <Select style={{ width: 600 }} onChange={this.handleNodeLocationChange.bind(this, od)}>
              {nds}
            </Select>
          </FormItem>
          <Row>
            <Col span="12">
              <FormItem label="预计到达中转站时间">
                <DatePicker format="YYYY.MM.DD" onChange={this.handleDayChange.bind(this, od, 'deliver')} />
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="运输模式">
                <Select style={{ width: 200 }} onChange={this.handleTransitModeChange.bind(this, od, 'deliver')}>
                  {mds}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem label="预计离开中转站时间">
                <DatePicker format="YYYY.MM.DD" onChange={this.handleDayChange.bind(this, od, 'pickup')} />
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="运输模式">
                <Select style={{ width: 200 }} onChange={this.handleTransitModeChange.bind(this, od, 'pickup')}>
                  {mds}
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Form>
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
    const inDate = date.toDate();
    if (order === 1) {
      const { segGroupFirst } = this.state;
      if (type === 'deliver') {
        segGroupFirst.deliverEstDate = inDate;
      } else if (type === 'pickup') {
        segGroupFirst.pickupEstDate = inDate;
      }
      this.setState(segGroupFirst);
    } else {
      const { segGroupSecond } = this.state;
      if (type === 'deliver') {
        segGroupSecond.deliverEstDate = inDate;
      } else if (type === 'pickup') {
        segGroupSecond.pickupEstDate = inDate;
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
    const shipmtNos = this.props.shipmts.map(s => ({ shipmtNo: s.shipmt_no, dispId: s.key }));

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
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.onCloseWrapper(true);
      }
    });
  }
  renderExtra() {
    const { shipmts, visible } = this.props;
    let totalCount = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    const arr = [];
    if (visible && shipmts.length > 0) {
      let close = true;

      if (shipmts.length === 1) {
        close = false;
      }
      shipmts.forEach((v) => {
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
    }
    return (<Row>
      <Col span="12">
        {arr}
      </Col>
      <Col span="4">
        <InfoItem label="总件数"
          field={totalCount}
        />
      </Col>
      <Col span="4">
        <InfoItem label="总重量"
          field={totalWeight}
        />
      </Col>
      <Col span="4">
        <InfoItem label="总体积"
          field={totalVolume}
        />
      </Col>
    </Row>);
  }

  render() {
    const { visible, shipmts } = this.props;
    let err = '';
    if (this.state.errable) {
      err = (<Alert message="分段参数错误" type="error" showIcon closable />);
    }

    return (
      <DockPanel visible={visible} onClose={this.props.onClose}
        title={`分段 ${shipmts.length}个运单`}
        extra={this.renderExtra()}
      >
        <Card>
          {err}
          {this.buildSegmentGroup()}
          {this.state.segments}
        </Card>
        <div>
          <Button type="ghost" onClick={this.onCloseWrapper}>{this.msg('btnTextCancel')}</Button>
          <span className="ant-divider" style={{ width: '0px' }} />
          <Button type="primary" onClick={this.handleSegment}>{this.msg('btnTextOk')}</Button>
        </div>
      </DockPanel>
    );
  }
}
