import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Row, Col, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams, loadCmsProviderQuotes } from 'common/reducers/scofFlow';
import FlowNodePanel from './compose/flowNodePanel';
import DelegationPane from './bizpane/cmsDelegationPane';
import DeclManifestPane from './bizpane/cmsDeclManifestPane';
import CustomsDeclPane from './bizpane/cmsCustomsDeclPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    providerQuotes: state.scofFlow.cmsParams.providerQuotes,
  }),
  { loadCmsBizParams, loadCmsProviderQuotes }
)
@Form.create()
export default class FlowCmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func }).isRequired,
    onFormInit: PropTypes.func.isRequired,
  }
  componentWillMount() {
    const model = this.props.node.get('model');
    this.handleParamsLoad(model);
  }
  componentDidMount() {
    this.props.onFormInit(this.props.form);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.node !== this.props.node) {
      const model = nextProps.node.get('model');
      this.handleParamsLoad(model);
    }
  }
  handleParamsLoad = (model) => {
    this.props.loadCmsBizParams(model.demander_partner_id, model.kind);
    if (model.provider_tenant_id !== model.demander_tenant_id) {
      this.props.loadCmsProviderQuotes({
        partner_id: model.demander_partner_id,
        tenant_id: model.demander_tenant_id,
      }, { tenant_id: model.provider_tenant_id });
    }
  }
  handleProviderChange = (providerTenantId) => {
    const model = this.props.node.get('model');
    this.props.loadCmsProviderQuotes({
      partner_id: model.demander_partner_id,
      tenant_id: model.demander_tenant_id,
    }, { tenant_id: providerTenantId });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form, node, graph, providerQuotes,
    } = this.props;
    const model = node.get('model');
    const title = model.kind === 'export' ? this.msg('flowNodeExport') : this.msg('flowNodeImport');
    return (
      <Form layout="vertical" className="form-layout-compact">
        <Row gutter={8}>
          <Col sm={24} md={8}>
            <Card title={title} bodyStyle={{ padding: 0 }}>
              <FlowNodePanel
                form={form}
                node={node}
                graph={graph}
                quotes={providerQuotes}
                onProviderChange={this.handleProviderChange}
              />
            </Card>
          </Col>
          <Col sm={24} md={16}>
            <Card bodyStyle={{ padding: 0 }}>
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
