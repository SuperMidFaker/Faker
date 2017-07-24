import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, getAsnByUuid } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmReceive';
import { NODE_BIZ_OBJECTS } from 'common/constants';
import { Logixon } from 'client/components/FontIcon';

const Step = Steps.Step;

@connect(
  state => ({
    tenantId: state.account.tenantId,
    dock: state.crmOrders.dock,
  }),
  { hideDock, showDock, loadOrderNodesTriggers, getAsnByUuid }
)
export default class CWMInboundNodeCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
  }
  state = {
    is_editing: false,
    trigger: -1,
  }
  componentDidMount() {
    const { uuid, kind, tenantId } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then(
      (result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      }
    );
    this.props.getAsnByUuid(uuid, tenantId);
  }
  componentWillReceiveProps(nextProps) {
    const { uuid, kind, tenantId } = nextProps;
    if (uuid !== this.props.uuid) {
      this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then(
        (result) => {
          if (!result.data) return;
          this.setState({
            trigger: this.triggerStepMap[result.data.trigger_name],
          });
        }
      );
      this.props.getAsnByUuid(uuid, tenantId);
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[2].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[3].key]: 3,
  }
  handlePreview = () => {
    const { dock } = this.props;
    if (this.state.trigger === -1) {
      message.info('订单尚未创建');
    } else {
      this.props.hideDock();
      this.props.showDock(dock.asn_no);
    }
  }
  handleInbound = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.uuid}`); // TODO
  }
  render() {
    const { title, children, dock } = this.props;
    return (
      <Card title={<span>{title}</span>} extra={
        <Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" onClick={() => this.handleInbound()} />
        </Tooltip>} bodyStyle={{ padding: 8, paddingBottom: 56 }}
        onClick={() => this.handlePreview(this.props.uuid)}
      >
        <Row>
          <Col span="8">
            <InfoItem label="ASN编号" addonBefore={<Icon type="tag-o" />}
              field={dock.asn_no}
            />
          </Col>
          <Col span="8">
            <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />}
              field={dock.whse_name}
            />
          </Col>
          <Col span="8">
            <InfoItem label="货物属性" addonBefore={<Icon type="tag-o" />}
              field={dock.bonded ? '保税' : '非保税'}
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step description="通知接收" />
            <Step description="入库操作" />
            <Step description="部分收货" />
            <Step description="收货完成" />
          </Steps>
        </div>
      </Card>
    );
  }
}
