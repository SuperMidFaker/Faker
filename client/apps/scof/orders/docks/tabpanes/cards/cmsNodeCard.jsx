import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { hideDock, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { NODE_BIZ_OBJECTS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { MdIcon } from 'client/components/FontIcon';
import NodeFooter from './nodeFooter';
import NodeFooterAction from './nodeFooterAction';

@connect(
  () => ({}),
  {
    showPreviewer, hideDock, manualEnterFlowInstance,
  }
)

export default class CMSNodeCard extends React.Component {
  static propTypes = {
    node: PropTypes.shape({
      uuid: PropTypes.string,
      kind: PropTypes.oneOf(['import', 'export']),
      name: PropTypes.string.isRequired,
      decl_way_code: PropTypes.string,
      trans_mode: PropTypes.string,
      bl_wb_no: PropTypes.string,
      in_degree: PropTypes.number.isRequired,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.node.kind][1].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[1].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[3].key]: 3,
  }
  handlePreview = (No) => {
    if (No) {
      this.props.showPreviewer(No, 'shipment');
      this.props.hideDock();
    }
  }
  handleManifest = () => {
    const link = `/clearance/${this.props.node.kind}/manifest/`;
    this.context.router.push(`${link}${this.props.node.biz_no}`);
  }
  handleNodeEnterTrigger = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const { node: { uuid, kind } } = this.props;
    this.props.manualEnterFlowInstance(uuid, kind);
  }
  render() {
    const {
      /* children, */ node: {
        name, kind, decl_way_code: declWayCode, trans_mode: transMode, bl_wb_no: blWbNo,
        uuid, biz_no: bizno,
      },
    } = this.props;
    const declWayMap = kind === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    const declWayItem = declWayMap.find(item => item.key === declWayCode);
    const tm = TRANS_MODE.filter(item => item.value === transMode)[0];
    const extra = [];
    if (bizno) {
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" size="small" shape="circle" icon="right" onClick={this.handleManifest} />
      </Tooltip>);
    }
    return (
      <Card
        title={`${name}${bizno || ' 尚未进入节点'}`}
        extra={extra}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handlePreview(bizno)}
      >
        <Row>
          <Col span="8">
            <InfoItem
              label="提运单号"
              field={blWbNo}
              placeholder="添加提运单号"
            />
          </Col>
          <Col span="8">
            <InfoItem
              label="运输方式"
              addonBefore={tm && <MdIcon type={tm.icon} />}
              field={tm && tm.text}
            />
          </Col>
          <Col span="8">
            <InfoItem
              label="报关类型"
              field={declWayItem && declWayItem.value}
              placeholder="添加报关类型"
            />
          </Col>
        </Row>
        <NodeFooterAction
          node={this.props.node}
          manualEnterFlowInstance={this.props.manualEnterFlowInstance}
        />
        <div className="card-footer">
          <NodeFooter
            node={{ uuid, biz_no: bizno }}
            bizObjects={[NODE_BIZ_OBJECTS[kind][0].key, NODE_BIZ_OBJECTS[kind][1].key]}
            triggerMap={this.triggerStepMap}
            stepDesc={['接单', '制单', '申报', '放行']}
          />
        </div>
      </Card>
    );
  }
}
