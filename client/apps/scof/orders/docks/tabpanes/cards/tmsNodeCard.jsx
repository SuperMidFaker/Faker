import React, { PropTypes } from 'react';
import { Button, Tooltip, Card, Icon, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';

const Step = Steps.Step;

export default class TMSNodeCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
  }
  state = {
    is_editing: false,
  }
  render() {
    const { title, children } = this.props;
    return (
      <Card title={<span>{title}</span>} extra={
        <Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" />
        </Tooltip>} bodyStyle={{ padding: 8, paddingBottom: 56 }}
      >
        <Row>
          <Col span="8">
            <InfoItem label="订单号" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加订单号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="发票号" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加发票号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="合同号" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加合同号"
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={-1} progressDot>
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
