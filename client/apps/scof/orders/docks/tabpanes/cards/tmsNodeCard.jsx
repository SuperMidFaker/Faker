import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, manualEnterFlowInstance } from 'common/reducers/crmOrders';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { NODE_BIZ_OBJECTS } from 'common/constants';

const { Step } = Steps;
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  {
    loadOrderNodesTriggers, loadShipmtDetail, hideDock, manualEnterFlowInstance,
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
      pod: PropTypes.bool.isRequired,
    }),
  }
  state = {
    trigger: -1,
  }
  componentWillMount = () => {
    const { node: { uuid } } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS.tms[0].key]).then((result) => {
      if (!result.data) return;
      this.setState({
        trigger: this.triggerStepMap[result.data.trigger_name],
      });
    });
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.node.uuid !== this.props.node.uuid) {
      this.props.loadOrderNodesTriggers(
        nextProps.node.uuid,
        [NODE_BIZ_OBJECTS.tms[0].key]
      ).then((result) => {
        if (!result.data) {
          this.setState({
            trigger: -1,
          });
          return;
        }
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      });
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS.tms[0].triggers[1].key]: 0,
    [NODE_BIZ_OBJECTS.tms[0].triggers[2].key]: 1,
    [NODE_BIZ_OBJECTS.tms[0].triggers[3].key]: 2,
    [NODE_BIZ_OBJECTS.tms[0].triggers[4].key]: 3,
    [NODE_BIZ_OBJECTS.tms[0].triggers[5].key]: 4,
  }
  handleShipmtPreview = (No) => {
    this.props.loadShipmtDetail(No, this.props.tenantId, 'sr', 'order').then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.hideDock();
      }
    });
  }
  handleNodeEnterTrigger = (ev) => {
    ev.stopPropagation();
    const { node: { uuid, kind } } = this.props;
    this.props.manualEnterFlowInstance(uuid, kind);
  }
  render() {
    const {
      children, node: {
        name, consigner_name: consignerName, consignee_name: consigneeName, trs_mode: trsMode,
        in_degree: indegree, pod, out_degree: outdeg, multi_bizobj: multiple, uuid,
      },
    } = this.props;
    const extra = [];
    if (indegree === 0 && outdeg > 0 && multiple) {
      extra.push(<Tooltip title="触发节点进入" key="enter">
        <Button size="small" shape="circle" icon="plus" onClick={this.handleNodeEnterTrigger} />
      </Tooltip>);
    }
    const steps = [
      <Step title="接单" key="accept" />,
      <Step title="调度" key="dispatch" />,
      <Step title="提货" key="pickup" />,
      <Step title="送货" key="deliver" />,
    ];
    if (pod) {
      steps.push(<Step title="回单" key="pod" />);
    }
    return (
      <Card
        title={<span>{name}</span>}
        extra={extra}
        bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handleShipmtPreview(uuid)}
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
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            {steps}
          </Steps>
        </div>
      </Card>
    );
  }
}
