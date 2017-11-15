import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock } from 'common/reducers/crmOrders';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { NODE_BIZ_OBJECTS } from 'common/constants';

const Step = Steps.Step;
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadOrderNodesTriggers, loadShipmtDetail, hideDock }
)
export default class TMSNodeCard extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.any,
    consignerName: PropTypes.string,
    consigneeName: PropTypes.string,
    trsMode: PropTypes.string,
    uuid: PropTypes.string,
    in_degree: PropTypes.number.isRequired,
    pod: PropTypes.bool.isRequired,
  }
  state = {
    trigger: -1,
  }
  componentWillMount = () => {
    const { uuid } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS.tms[0].key]).then(
      (result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      }
    );
  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.uuid !== this.props.uuid) {
      this.props.loadOrderNodesTriggers(nextProps.uuid, [NODE_BIZ_OBJECTS.tms[0].key]).then(
        (result) => {
          if (!result.data) {
            this.setState({
              trigger: -1,
            });
            return;
          }
          this.setState({
            trigger: this.triggerStepMap[result.data.trigger_name],
          });
        }
      );
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
    this.props.loadShipmtDetail(No, this.props.tenantId, 'sr', 'order').then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.hideDock();
        }
      }
    );
  }
  render() {
    const { name, children, consignerName, consigneeName, trsMode, in_degree: indegree, pod } = this.props;
    const extra = indegree === 0 ?
        (<Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" />
        </Tooltip>) : null;
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
      <Card title={<span>{name}</span>} extra={extra} bodyStyle={{ padding: 8, paddingBottom: 48 }} onClick={() => this.handleShipmtPreview(this.props.uuid)}>
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
