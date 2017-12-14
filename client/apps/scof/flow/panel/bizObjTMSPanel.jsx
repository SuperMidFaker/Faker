import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FlowNodePanel from './compose/flowNodePanel';
import ShipmentPane from './bizpane/tmsShipmentPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}))
@Form.create()
export default class FlowTmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onFormInit: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.onFormInit(this.props.form);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, node, graph } = this.props;
    const model = node.get('model');
    return (
      <Form layout="vertical" className="form-layout-compact">
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <Card title={this.msg('flowNodeTMS')} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel form={form} node={node} graph={graph} />
            </Card>
          </Col>
          <Col sm={24} md={16}>
            <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="tmsShipment">
                <TabPane tab={this.msg('tmsShipment')} key="tmsShipment">
                  <ShipmentPane form={form} model={model} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Form>);
  }
}
