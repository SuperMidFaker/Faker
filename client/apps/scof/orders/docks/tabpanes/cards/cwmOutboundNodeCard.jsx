import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, Card, Icon, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';

const Step = Steps.Step;

export default class CWMOutboundNodeCard extends React.Component {
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
            <InfoItem label="SO编号" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加订单号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="仓库" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加发票号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="出库类型" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加合同号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="货物属性" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加合同号"
            />
          </Col>
          <Col span="8">
            <InfoItem label="保税监管方式" addonBefore={<Icon type="tag-o" />}
              field={''} placeholder="添加合同号"
            />
          </Col>
        </Row>
        {children}
        <div className="card-footer">
          <Steps current={-1} progressDot>
            <Step description="订单接收" />
            <Step description="出库操作" />
            <Step description="发货完成" />
          </Steps>
        </div>
      </Card>
    );
  }
}
