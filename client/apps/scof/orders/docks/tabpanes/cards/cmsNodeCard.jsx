import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { NODE_BIZ_OBJECTS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';
import { MdIcon } from 'client/components/FontIcon';

const { Step } = Steps;

@connect(
  () => ({}),
  {
    loadOrderNodesTriggers, showPreviewer, hideDock, manualEnterFlowInstance,
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
  state = {
    trigger: -1,
  }
  componentWillMount() {
    const { node: { uuid, kind } } = this.props;
    this.props.loadOrderNodesTriggers(
      uuid,
      [NODE_BIZ_OBJECTS[kind][0].key, NODE_BIZ_OBJECTS[kind][1].key]
    ).then((result) => {
      if (!result.data) return;
      this.setState({
        trigger: this.triggerStepMap[result.data.trigger_name],
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    const { node: { uuid, kind } } = nextProps;
    if (uuid !== this.props.node.uuid) {
      this.props.loadOrderNodesTriggers(
        uuid,
        [NODE_BIZ_OBJECTS[kind][0].key, NODE_BIZ_OBJECTS[kind][1].key]
      ).then((result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      });
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.node.kind][1].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[1].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.node.kind][0].triggers[3].key]: 3,
  }
  handlePreview = (No) => {
    this.props.showPreviewer(No, 'shipment');
    this.props.hideDock();
  }
  handleManifest = () => {
    const link = `/clearance/${this.props.node.kind}/manifest/`;
    this.context.router.push(`${link}${this.props.node.uuid}`); // TODO
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
        name, decl_way_code: declWayCode, trans_mode: transMode, bl_wb_no: blWbNo,
        in_degree: indegree, uuid, out_degree: outdeg, multi_bizobj: multiple, primary,
      },
    } = this.props;
    const declWayMap = this.props.kind === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    const declWayItem = declWayMap.find(item => item.key === declWayCode);
    const tm = TRANS_MODE.filter(item => item.value === transMode)[0];
    const extra = [];
    let triggerActions;
    if (indegree === 0) {
      if (outdeg > 0 && multiple && primary) {
        triggerActions = [(<Tooltip title="触发节点进入" key="enter">
          <Button icon="plus" onClick={this.handleNodeEnterTrigger} />
        </Tooltip>)];
      }
      extra.push(<Tooltip title="进入详情" key="detail">
        <Button type="primary" size="small" shape="circle" icon="right" onClick={this.handleManifest} />
      </Tooltip>);
    }
    return (
      <Card
        title={<span>{name}</span>}
        extra={extra}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handlePreview(uuid)}
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
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step title="接单" />
            <Step title="制单" />
            <Step title="申报" />
            <Step title="放行" />
          </Steps>
        </div>
        {triggerActions && triggerActions.length > 0 &&
          <ul className="ant-card-actions">
            {triggerActions.map(trButton => (
              <li style={{ width: '100%' }}>
                {trButton}
              </li>))}
          </ul>}
      </Card>
    );
  }
}
