import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, Card, Icon, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';

const Step = Steps.Step;

export default class CWMNodeCard extends React.Component {
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
            <Step description="接收" />
            <Step description="执行" />
            <Step description="完成" />
          </Steps>
        </div>
      </Card>
    );
  }
}
