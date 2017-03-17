import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams } from 'common/reducers/scofFlow';
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
  }),
  { loadCmsBizParams }
)
export default class FlowCmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onNodeActionsChange: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.props.loadCmsBizParams(this.props.tenantId, this.props.model.kind);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form, model, onNodeActionsChange } = this.props;
    const title = model.kind === 'export' ? this.msg('flowNodeExport') : this.msg('flowNodeImport');
    return (
      <Row gutter={16}>
        <Col sm={24} md={8}>
          <Card title={title} bodyStyle={{ padding: 0 }}>
            <FlowNodePanel form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
          </Card>
        </Col>
        <Col sm={24} md={16}>
          <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="objDelegation">
              <TabPane tab={this.msg('cmsDelegation')} key="objDelegation">
                <DelegationPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
              <TabPane tab={this.msg('cmsDeclManifest')} key="objDeclManifest" >
                <DeclManifestPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
              <TabPane tab={this.msg('cmsCustomsDecl')} key="objCustomsDecl" >
                <CustomsDeclPane form={form} model={model} onNodeActionsChange={onNodeActionsChange} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>);
  }
}
