import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCwmBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import ReceivingPane from './bizpane/cwmReceivingPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnerId: state.scofFlow.currentFlow.partner_id,
  }),
  { loadCwmBizParams }
)
@Form.create()
export default class FlowCwmRecPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onFormInit: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadCwmBizParams(this.props.tenantId, this.props.partnerId);
    this.props.onFormInit(this.props.form);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, node, graph } = this.props;
    const model = node.get('model');
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <Card title={this.msg('flowNodeCWMRec')} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel form={form} node={node} graph={graph} />
            </Card>
          </Col>
          <Col sm={24} md={16}>
            <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="cwmReceiving">
                <TabPane tab={this.msg('cwmRecAsn')} key="cwmReceiving">
                  <ReceivingPane form={form} model={model} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Form>);
  }
}
