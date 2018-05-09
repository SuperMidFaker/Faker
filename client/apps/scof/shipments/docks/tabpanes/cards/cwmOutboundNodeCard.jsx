import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { hideDock, getSoFromFlow, manualEnterFlowInstance } from 'common/reducers/sofOrders';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import NodeFooter from './nodeFooter';
import NodeFooterAction from './nodeFooterAction';

@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    so: state.sofOrders.dockInstMap[props.node.uuid],
  }),
  {
    hideDock, showDock, getSoFromFlow, manualEnterFlowInstance,
  }
)
export default class CWMOutboundNodeCard extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  componentWillMount() {
    const { node: { uuid }, tenantId } = this.props;
    this.props.getSoFromFlow(uuid, tenantId);
  }
  componentWillReceiveProps(nextProps) {
    const { node: { uuid }, tenantId } = nextProps;
    if (uuid !== this.props.node.uuid) {
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
    if (so.outbound_no) {
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" shape="circle" icon="right" onClick={this.handleOutbound} />
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
        <NodeFooterAction
          node={node}
          manualEnterFlowInstance={this.props.manualEnterFlowInstance}
        />
        <div className="card-footer">
          <NodeFooter
            node={{ uuid: node.uuid, biz_no: node.biz_no }}
            bizObjects={[NODE_BIZ_OBJECTS[node.kind][0].key]}
            triggerMap={this.triggerStepMap}
            stepDesc={['未处理', '出库操作', '已完成']}
          />
        </div>
      </Card>
    );
  }
}
