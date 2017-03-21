import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import ReceivingPane from './bizpane/cwmReceivingPane';
import ShippingPane from './bizpane/cwmShippingPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadCmsBizParams }
)
export default class FlowCwmNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadCmsBizParams(this.props.tenantId);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, model, onNodeActionsChange } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} md={8}>
          <Card title={this.msg('cwmFlowNode')} bodyStyle={{ padding: 0 }}>
            <FlowNodePanel form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
          </Card>
        </Col>
        <Col sm={24} md={16}>
          <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="objReceiving">
              <TabPane tab={this.msg('objReceiving')} key="objReceiving">
                <ReceivingPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
              <TabPane tab={this.msg('objShipping')} key="objShipping">
                <ShippingPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>);
  }
}