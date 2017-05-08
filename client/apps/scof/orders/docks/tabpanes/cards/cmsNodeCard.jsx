import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Icon, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadOrderNodesTriggers, hideDock } from 'common/reducers/crmOrders';
import { showPreviewer } from 'common/reducers/cmsDelgInfoHub';
import { NODE_BIZ_OBJECTS, TRANS_MODE, DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';

const Step = Steps.Step;
@connect(
  () => ({}),
  { loadOrderNodesTriggers, showPreviewer, hideDock }
)

export default class CMSNodeCard extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    field: PropTypes.string,
    children: PropTypes.any,
  }
  state = {
    trigger: -1,
  }
  componentWillMount() {
    const { uuid, kind } = this.props;
    this.props.loadOrderNodesTriggers(uuid, NODE_BIZ_OBJECTS[kind][0].key, NODE_BIZ_OBJECTS[kind][1].key).then(
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
      this.props.loadOrderNodesTriggers(uuid, NODE_BIZ_OBJECTS[kind][0].key, NODE_BIZ_OBJECTS[kind][1].key).then(
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
    [NODE_BIZ_OBJECTS[this.props.kind][1].triggers[0].key]: 0, // todo wrong triger
    [NODE_BIZ_OBJECTS[this.props.kind][1].triggers[1].key]: 1,
    [NODE_BIZ_OBJECTS[this.props.kind][2].triggers[1].key]: 2,
    [NODE_BIZ_OBJECTS[this.props.kind][2].triggers[2].key]: 3,
  }
  handlePreview = (No) => {
    this.props.showPreviewer(No, 'basic');
    this.props.hideDock();
  }
  render() {
    const { name, children } = this.props;
    let declWayCode = '';
    const declWayMap = this.props.kind === 'import' ? DECL_I_TYPE : DECL_E_TYPE;
    declWayCode = declWayMap.find(item => item.key === this.props.decl_way_code).value;
    return (
      <Card title={<span>{name}</span>} extra={
        <Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" onClick={() => this.handlePreview(this.props.uuid)} />
        </Tooltip>} bodyStyle={{ padding: 8, paddingBottom: 56 }}
      >
        <Row>
          <Col span="8">
            <InfoItem label="运输方式" addonBefore={<Icon type="tag-o" />}
              field={
                TRANS_MODE.map(item => item.value === this.props.trans_mode ? item.text : '')
              } placeholder="添加运输方式"
            />
          </Col>
          <Col span="8">
            <InfoItem label="提运单号" addonBefore={<Icon type="tag-o" />}
              field={this.props.bl_wb_no} placeholder="添加提运单号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="报关类型" addonBefore={<Icon type="tag-o" />}
              field={declWayCode} placeholder="添加报关类型"
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={this.state.trigger} progressDot>
            <Step description="接单" />
            <Step description="制单" />
            <Step description="申报" />
            <Step description="放行" />
          </Steps>
        </div>
      </Card>
    );
  }
}
