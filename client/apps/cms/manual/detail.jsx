import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Form, Tabs, Row, Col, Layout } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';

import { loadManualHead } from 'common/reducers/cmsTradeManual';
import { intlShape, injectIntl } from 'react-intl';
import ImpGoodsPane from './tabpane/impGoodsPane';
import ExpGoodsPane from './tabpane/expGoodsPane';
import { formatMsg } from './message.i18n';


const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    customs: state.cmsManifest.params.customs.map(cs => ({
      value: cs.customs_code,
      text: cs.customs_name,
    })),
  }),
  { loadManualHead }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class ManualDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    manualHead: {},
  }
  componentWillMount() {
    this.props.loadManualHead(this.props.params.id).then((result) => {
      if (!result.error) {
        this.setState({
          manualHead: result.data,
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { manualHead } = this.state;
    const { customs } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('manual')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('manual')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} >
            <Row gutter={16} className="info-group-underline">
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('copManaulNo')} field={manualHead.cop_manaul_no} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('manualNo')} field={manualHead.manual_no} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('manualType')} field={manualHead.manual_type} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('masterCustomsCode')} field={manualHead.master_customs_code && customs.find(cs => cs.value === manualHead.master_customs_code).text} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('tradeName')} field={manualHead.trade_name} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label={this.msg('manufactName')} field={manualHead.manufact_name} />
              </Col>
            </Row>
          </Card>
          <Card bodyStyle={{ padding: 0 }} >
            <Tabs defaultActiveKey="imgoods">
              <TabPane tab={this.msg('imgoods')} key="imgoods">
                <ImpGoodsPane manualNo={this.props.params.id} />
              </TabPane>
              <TabPane tab={this.msg('exgoods')} key="exgoods">
                <ExpGoodsPane manualNo={this.props.params.id} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    );
  }
}
