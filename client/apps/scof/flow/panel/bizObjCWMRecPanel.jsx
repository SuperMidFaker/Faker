import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Row, Col, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCwmBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import ReceivingPane from './bizpane/cwmReceivingPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;

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
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
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
      <Form layout="vertical" className="form-layout-compact">
        <Row gutter={8}>
          <Col sm={24} md={8}>
            <Card title={this.msg('flowNodeCWMRec')} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel form={form} node={node} graph={graph} />
            </Card>
          </Col>
          <Col sm={24} md={16}>
            <Card bodyStyle={{ padding: 0 }}>
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
