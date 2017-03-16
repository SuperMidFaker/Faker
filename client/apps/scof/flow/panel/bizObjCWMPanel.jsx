import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import DelegationPane from './bizpane/cmsDelegationPane';
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
    const { form } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} md={8}>
          <Card title={this.msg('cwmFlowNode')} bodyStyle={{ padding: 0 }}>
            <FlowNodePanel form={form} />
          </Card>
        </Col>
        <Col sm={24} md={16}>
          <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="objReceiving">
              <TabPane tab={this.msg('objReceiving')} key="objReceiving">
                <DelegationPane form={form} />
              </TabPane>
              <TabPane tab={this.msg('objShipping')} key="objShipping" />
            </Tabs>
          </Card>
        </Col>
      </Row>);
  }
}
