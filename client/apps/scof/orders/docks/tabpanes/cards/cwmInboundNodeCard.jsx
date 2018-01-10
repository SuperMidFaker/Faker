import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { hideDock, getAsnFromFlow, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmReceive';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import NodeFooter from './nodeFooter';
import NodeFooterAction from './nodeFooterAction';

@connect(
  (state, props) => ({
    tenantId: state.account.tenantId,
    asn: state.crmOrders.dockInstMap[props.node.uuid],
  }),
  {
    hideDock, showDock, getAsnFromFlow, manualEnterFlowInstance,
  }
)
export default class CWMInboundNodeCard extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  componentDidMount() {
    const { node: { uuid }, tenantId } = this.props;
    this.props.getAsnFromFlow(uuid, tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.node.uuid !== this.props.node.uuid) {
      const { node: { uuid }, tenantId } = nextProps;
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
      message.info('收货通知尚未创建');
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
    if (asn.inbound_no) {
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" shape="circle" icon="right" onClick={this.handleInbound} />
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
        <NodeFooterAction
          node={node}
          manualEnterFlowInstance={this.props.manualEnterFlowInstance}
        />
        <div className="card-footer">
          <NodeFooter
            node={{ uuid: node.uuid, biz_no: node.biz_no }}
            bizObjects={[NODE_BIZ_OBJECTS[node.kind][0].key]}
            triggerMap={this.triggerStepMap}
            stepDesc={['通知接收', '入库操作', '部分收货', '收货完成']}
          />
        </div>
      </Card>
    );
  }
}
