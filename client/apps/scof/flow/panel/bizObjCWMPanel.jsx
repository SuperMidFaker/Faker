import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Tabs } from 'antd';
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
@Form.create()
export default class FlowCwmNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onFormInit: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadCmsBizParams(this.props.tenantId);
    this.props.onFormInit(this.props.form);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, model, onNodeActionsChange } = this.props;
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <Card title={this.msg('flowNodeCWM')} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
            </Card>
          </Col>
          <Col sm={24} md={16}>
            <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="cwmReceiving">
                <TabPane tab={this.msg('cwmReceiving')} key="cwmReceiving">
                  <ReceivingPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
                </TabPane>
                <TabPane tab={this.msg('cwmShipping')} key="cwmShipping">
                  <ShippingPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Form>);
  }
}
