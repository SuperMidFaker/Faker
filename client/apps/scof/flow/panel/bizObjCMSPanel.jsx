import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams, loadCustomerCmsQuotes } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import DelegationPane from './bizpane/cmsDelegationPane';
import DeclManifestPane from './bizpane/cmsDeclManifestPane';
import CustomsDeclPane from './bizpane/cmsCustomsDeclPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnerId: state.scofFlow.currentFlow.partner_id,
  }),
  { loadCmsBizParams, loadCustomerCmsQuotes }
)
@Form.create()
export default class FlowCmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    partnerId: PropTypes.number.isRequired,
    onFormInit: PropTypes.func.isRequired,
  }
  componentWillMount() {
    const model = this.props.node.get('model');
    this.handleParamsLoad(model, this.props);
  }
  componentDidMount() {
    this.props.onFormInit(this.props.form);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.node !== this.props.node) {
      const model = nextProps.node.get('model');
      this.handleParamsLoad(model, nextProps);
    }
  }
  handleParamsLoad = (model, nextProps) => {
    this.props.loadCmsBizParams(nextProps.tenantId, nextProps.partnerId, model.kind);
    this.props.loadCustomerCmsQuotes(nextProps.tenantId, nextProps.partnerId);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, node, graph } = this.props;
    const model = node.get('model');
    const title = model.kind === 'export' ? this.msg('flowNodeExport') : this.msg('flowNodeImport');
    return (
      <Form layout="vertical" className="form-layout-compact">
        <Row gutter={8}>
          <Col sm={24} md={6}>
            <Card title={title} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel form={form} node={node} graph={graph} />
            </Card>
          </Col>
          <Col sm={24} md={18}>
            <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="objDelegation">
                <TabPane tab={this.msg('cmsDelegation')} key="objDelegation">
                  <DelegationPane form={form} model={model} />
                </TabPane>
                <TabPane tab={this.msg('cmsDeclManifest')} key="objDeclManifest" >
                  <DeclManifestPane form={form} model={model} />
                </TabPane>
                <TabPane tab={this.msg('cmsCustomsDecl')} key="objCustomsDecl" >
                  <CustomsDeclPane form={form} model={model} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Form>);
  }
}
