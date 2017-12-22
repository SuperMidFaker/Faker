import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, getSoFromFlow, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { NODE_BIZ_OBJECTS } from 'common/constants';
// import { Logixon } from 'client/components/FontIcon';

const { Step } = Steps;
@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    so: state.crmOrders.dockInstMap[props.node.uuid],
  }),
  {
    hideDock, showDock, loadOrderNodesTriggers, getSoFromFlow, manualEnterFlowInstance,
  }
)
export default class CWMOutboundNodeCard extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    trigger: -1,
  }
  componentWillMount() {
    const { node: { uuid, kind }, tenantId } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then((result) => {
      if (!result.data) return;
      this.setState({
        trigger: this.triggerStepMap[result.data.trigger_name],
      });
    });
    this.props.getSoFromFlow(uuid, tenantId);
  }
  componentWillReceiveProps(nextProps) {
    const { node: { uuid, kind }, tenantId } = nextProps;
    if (uuid !== this.props.node.uuid) {
      this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then((result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      });
      this.props.getSoFromFlow(uuid, tenantId);
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[2].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[3].key]: 3,
  }
  handlePreview = () => {
    const { so } = this.props;
    if (!so.so_no) {
      message.info('订单尚未创建');
    } else {
      this.props.hideDock();
      this.props.showDock(so.so_no);
    }
  }
  handleOutbound = () => {
    this.context.router.push(`/cwm/shipping/outbound/${this.props.so.outbound_no}`);
  }
  handleNodeEnterTrigger = (ev) => {
    ev.preventDefault();
    const { node: { uuid, kind } } = this.props;
    this.props.manualEnterFlowInstance(uuid, kind);
  }
  render() {
    const { children, so, node } = this.props;
    if (!so) {
      return null;
    }
    const extra = [];
    if (node.multi_bizobj && node.in_degree === 0 && node.out_degree > 0) {
      extra.push(<Tooltip title="触发节点进入" key="enter">
        <Button size="small" shape="circle" icon="plus" onClick={this.handleNodeEnterTrigger} />
      </Tooltip>);
    }
    if (so.outbound_no) {
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" size="small" shape="circle" icon="right" onClick={this.handleOutbound} />
      </Tooltip>);
    }
    return (
      <Card
        extra={extra}
        title={<span>{`SO编号:${so.so_no || '尚未创建'}`}</span>}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handlePreview(this.props.uuid)}
      >
        <Row>
          <Col span="8">
            <InfoItem
              label="仓库"
              field={so.whse_name}
            />
          </Col>
          <Col span="8">
            <InfoItem
              label="货物属性"
              field={so.bonded ? '保税' : '非保税'}
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step title="订单接收" />
            <Step title="出库操作" />
            <Step title="发货完成" />
          </Steps>
        </div>
      </Card>
    );
  }
}
