import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Icon, Col, Row, Steps, message } from 'antd';
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
    [NODE_BIZ_OBJECTS.tms[0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS.tms[0].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS.tms[0].triggers[2].key]: 3,
    [NODE_BIZ_OBJECTS.tms[0].triggers[3].key]: 4,
  }
  handleShipmtPreview = (No) => {
    this.props.loadShipmtDetail(No, this.props.tenantId, 'sr', 'exception').then(
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
    const { name, children, consignerName, consigneeName, trsMode, in_degree: indegree } = this.props;
    const previewer = indegree === 0 ?
        (<Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" onClick={() => this.handleShipmtPreview(this.props.uuid)} />
        </Tooltip>) : null;
    return (
      <Card title={<span>{name}</span>} extra={previewer} bodyStyle={{ padding: 8, paddingBottom: 56 }}>
        <Row>
          <Col span="8">
            <InfoItem label="发货方" addonBefore={<Icon type="tag-o" />}
              field={consignerName} placeholder="添加发货方"
            />
          </Col>
          <Col span="8">
            <InfoItem label="收货方" addonBefore={<Icon type="tag-o" />}
              field={consigneeName} placeholder="添加收货方"
            />
          </Col>
          <Col span="8">
            <InfoItem label="运输方式" addonBefore={<Icon type="tag-o" />}
              field={trsMode} placeholder="添加运输方式"
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step description="接单" />
            <Step description="调度" />
            <Step description="提货" />
            <Step description="送货" />
            <Step description="回单" />
          </Steps>
        </div>
      </Card>
    );
  }
}
