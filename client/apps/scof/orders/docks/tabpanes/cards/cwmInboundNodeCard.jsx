import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, Card, Icon, Col, Row, Steps } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { hideDock } from 'common/reducers/crmOrders';
import { showDock } from 'common/reducers/cwmReceive';
const Step = Steps.Step;
@connect(
  () => ({}),
  { hideDock, showDock }
)
export default class CWMNodeCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
  }
  state = {
    is_editing: false,
  }
  handlePreview = () => {
    this.props.hideDock();
    this.props.showDock();
  }
  render() {
    const { title, children } = this.props;
    return (
      <Card title={<span>{title}</span>} extra={
        <Tooltip title="进入详情">
          <Button size="small" shape="circle" icon="right" onClick={this.handlePreview} />
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
          <Steps current={-1} progressDot>
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
