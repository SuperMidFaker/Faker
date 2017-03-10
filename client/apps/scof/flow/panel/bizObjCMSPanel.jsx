import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadCmsBizParams } from 'common/reducers/scofFlow';
import FlowNodePanel from './flowNodePanel';
import DelegationPane from './pane/cmsDelegationPane';
import DeclManifestPane from './pane/cmsDeclManifestPane';
import CustomsDeclPane from './pane/cmsCustomsDeclPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ietype: state.scofFlow.activeElement.kind,
  }),
  { loadCmsBizParams }
)
export default class FlowCmsNodePanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadCmsBizParams(this.props.tenantId, this.props.ietype);
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} md={8}>
          <Card title={this.msg('cmsFlowNode')} bodyStyle={{ padding: 0 }}>
            <FlowNodePanel form={form} />
          </Card>
        </Col>
        <Col sm={24} md={16}>
          <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="objDelegation">
              <TabPane tab={this.msg('objDelegation')} key="objDelegation">
                <DelegationPane form={form} />
              </TabPane>
              <TabPane tab={this.msg('objDeclManifest')} key="objDeclManifest" >
                <DeclManifestPane form={form} />
              </TabPane>
              <TabPane tab={this.msg('objCustomsDecl')} key="objCustomsDecl" >
                <CustomsDeclPane form={form} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>);
  }
}
