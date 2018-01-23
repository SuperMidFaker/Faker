import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Col, Row, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { hideDock, manualEnterFlowInstance } from 'common/reducers/sofOrders';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import NodeFooter from './nodeFooter';
import NodeFooterAction from './nodeFooterAction';

@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  {
    loadShipmtDetail, hideDock, manualEnterFlowInstance,
  }
)
export default class TMSNodeCard extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    node: PropTypes.shape({
      uuid: PropTypes.string,
      name: PropTypes.string.isRequired,
      consignee_name: PropTypes.string,
      consigner_name: PropTypes.string,
      trs_mode: PropTypes.string,
      in_degree: PropTypes.number.isRequired,
      pod: PropTypes.bool,
    }),
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS.tms[0].triggers[1].key]: 0,
    [NODE_BIZ_OBJECTS.tms[0].triggers[2].key]: 1,
    [NODE_BIZ_OBJECTS.tms[0].triggers[3].key]: 2,
    [NODE_BIZ_OBJECTS.tms[0].triggers[4].key]: 3,
    [NODE_BIZ_OBJECTS.tms[0].triggers[5].key]: 4,
  }
  handleShipmtPreview = (No) => {
    if (No) {
      this.props.loadShipmtDetail(No, this.props.tenantId, 'sr', 'order').then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.hideDock();
        }
      });
    }
  }
  handleNodeEnterTrigger = (ev) => {
    ev.stopPropagation();
    const { node: { uuid, kind } } = this.props;
    this.props.manualEnterFlowInstance(uuid, kind);
  }
  render() {
    const {
      children, node: {
        name, consigner_name: consignerName, consignee_name: consigneeName, trs_mode: trsMode, kind,
        pod, uuid, biz_no: bizno,
      },
    } = this.props;
    const steps = [
      '接单',
      '调度',
      '提货',
      '送货',
    ];
    if (pod) {
      steps.push('回单');
    }
    return (
      <Card
        title={`${name} ${bizno || '尚未进入节点'}`}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handleShipmtPreview(bizno)}
      >
        <Row>
          <Col span="8">
            <InfoItem label="发货方" field={consignerName} />
          </Col>
          <Col span="8">
            <InfoItem label="收货方" field={consigneeName} />
          </Col>
          <Col span="8">
            <InfoItem label="运输方式" field={trsMode} />
          </Col>
        </Row>
        {children}
        <NodeFooterAction
          node={this.props.node}
          manualEnterFlowInstance={this.props.manualEnterFlowInstance}
        />
        <div className="card-footer">
          <NodeFooter
            node={{ uuid, biz_no: bizno }}
            bizObjects={[NODE_BIZ_OBJECTS[kind][0].key]}
            triggerMap={this.triggerStepMap}
            stepDesc={steps}
          />
        </div>
      </Card>
    );
  }
}
