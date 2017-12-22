import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, getAsnFromFlow, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmReceive';
import { NODE_BIZ_OBJECTS } from 'common/constants';
// import { Logixon } from 'client/components/FontIcon';

const { Step } = Steps;

@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    asn: state.crmOrders.dockInstMap[props.node.uuid],
  }),
  {
    hideDock, showDock, loadOrderNodesTriggers, getAsnFromFlow, manualEnterFlowInstance,
  }
)
export default class CWMInboundNodeCard extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    trigger: -1,
  }
  componentDidMount() {
    const { node: { uuid, kind }, tenantId } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else if (result.data) {
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      }
    });
    this.props.getAsnFromFlow(uuid, tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.node.uuid !== this.props.node.uuid) {
      const { node: { uuid, kind }, tenantId } = nextProps;
      this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else if (result.data) {
          this.setState({
            trigger: this.triggerStepMap[result.data.trigger_name],
          });
        }
      });
      this.props.getAsnFromFlow(uuid, tenantId);
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[2].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[3].key]: 3,
  }
  handlePreview = () => {
    const { asn } = this.props;
    if (!asn.asn_no) {
      message.info('订单尚未创建');
    } else {
      this.props.hideDock();
      this.props.showDock(asn.asn_no);
    }
  }
  handleInbound = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.asn.inbound_no}`);
  }
  handleNodeEnterTrigger = (ev) => {
    ev.stopPropagation();
    const { node: { uuid, kind } } = this.props;
    this.props.manualEnterFlowInstance(uuid, kind);
  }
  render() {
    const { children, asn, node } = this.props;
    if (!asn) {
      return null;
    }
    const extra = [];
    if (node.multi_bizobj && node.in_degree === 0 && node.out_degree > 0) {
      extra.push(<Tooltip title="触发节点进入" key="enter">
        <Button size="small" shape="circle" icon="plus" onClick={this.handleNodeEnterTrigger} />
      </Tooltip>);
    }
    if (asn.inbound_no) {
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" size="small" shape="circle" icon="right" onClick={this.handleInbound} />
      </Tooltip>);
    }
    return (
      <Card
        title={<span>{`ASN编号:${asn.asn_no || '尚未创建'}`}</span>}
        extra={extra}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={this.handlePreview}
        disabled
      >
        <Row>
          <Col span="8">
            <InfoItem
              label="仓库"
              field={asn.whse_name}
            />
          </Col>
          <Col span="8">
            <InfoItem
              label="货物属性"
              field={asn.bonded ? '保税' : '非保税'}
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step title="通知接收" />
            <Step title="入库操作" />
            <Step title="部分收货" />
            <Step title="收货完成" />
          </Steps>
        </div>
      </Card>
    );
  }
}
