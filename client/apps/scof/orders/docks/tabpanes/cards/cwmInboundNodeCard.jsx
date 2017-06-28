import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Icon, Col, Row, Steps, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock, getAsnNo } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmReceive';
import { NODE_BIZ_OBJECTS } from 'common/constants';
const Step = Steps.Step;
@connect(
  () => ({}),
  { hideDock, showDock, loadOrderNodesTriggers, getAsnNo }
)
export default class CWMNodeCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
  }
  state = {
    is_editing: false,
    trigger: -1,
  }
  componentWillMount() {
    const { uuid, kind } = this.props;
    this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then(
      (result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.triggerStepMap[result.data.trigger_name],
        });
      }
    );
  }
  componentWillReceiveProps(nextProps) {
    const { uuid, kind } = nextProps;
    if (uuid !== this.props.uuid) {
      this.props.loadOrderNodesTriggers(uuid, [NODE_BIZ_OBJECTS[kind][0].key]).then(
        (result) => {
          if (!result.data) return;
          this.setState({
            trigger: this.triggerStepMap[result.data.trigger_name],
          });
        }
      );
    }
  }
  triggerStepMap = {
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[0].key]: 0,
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.kind][0].triggers[2].key]: 2,
  }
  handlePreview = (uuid) => {
    if (this.state.trigger === -1) {
      message.info('订单尚未创建');
    } else {
      this.props.getAsnNo(uuid).then((result) => {
        if (!result.error) {
          this.props.hideDock();
          this.props.showDock(result.data.asn_no);
        }
      });
    }
  }
  render() {
    const { title, children } = this.props;
    return (
      <Card title={<span>{title}</span>} extra={
        <Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" onClick={() => this.handlePreview(this.props.uuid)} />
        </Tooltip>} bodyStyle={{ padding: 8, paddingBottom: 56 }}
      >
        <Row>
          <Col span="8">
            <InfoItem label="ASN编号" addonBefore={<Icon type="tag-o" />}
              field={''}
            />
          </Col>
          <Col span="8">
            <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />}
              field={''}
            />
          </Col>
          <Col span="8">
            <InfoItem label="货物属性" addonBefore={<Icon type="tag-o" />}
              field={''}
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
