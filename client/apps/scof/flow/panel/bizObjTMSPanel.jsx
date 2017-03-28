import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadTmsBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import ShipmentPane from './bizpane/tmsShipmentPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadTmsBizParams }
)
export default class FlowTmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onNodeActionsChange: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadTmsBizParams(this.props.tenantId);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, model, onNodeActionsChange } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} md={8}>
          <Card title={this.msg('flowNodeTMS')} bodyStyle={{ padding: 0 }}>
            <FlowNodePanel form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
          </Card>
        </Col>
        <Col sm={24} md={16}>
          <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="tmsShipment">
              <TabPane tab={this.msg('tmsShipment')} key="tmsShipment">
                <ShipmentPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>);
  }
}
