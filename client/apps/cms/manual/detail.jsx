import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Form, Tabs, Row, Col, Layout } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';
import { intlShape, injectIntl } from 'react-intl';
import ImpGoodsPane from './tabpane/impGoodsPane';
import ExpGoodsPane from './tabpane/expGoodsPane';
import { loadManualHead } from 'common/reducers/cmsTradeManual';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;

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
  msg = key => formatMsg(this.props.intl, key);
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
          <Card bodyStyle={{ padding: 16 }} noHovering>
            <Row gutter={16} className="info-group-underline">
              <Col sm={12} lg={8}>
                <InfoItem label="企业内部编号" field={manualHead.cop_manaul_no} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label="手册编号" field={manualHead.manual_no} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label="手册类型" field={manualHead.manual_type} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label="主管海关" field={manualHead.master_customs_code && customs.find(cs => cs.value === manualHead.master_customs_code).text} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label="经营单位" field={manualHead.trade_name} />
              </Col>
              <Col sm={12} lg={8}>
                <InfoItem label="加工单位" field={manualHead.manufact_name} />
              </Col>
            </Row>
          </Card>
          <Card bodyStyle={{ padding: 0 }} noHovering>
            <Tabs defaultActiveKey="imgoods">
              <TabPane tab="料件表" key="imgoods">
                <ImpGoodsPane manualNo={this.props.params.id} />
              </TabPane>
              <TabPane tab="成品表" key="exgoods">
                <ExpGoodsPane manualNo={this.props.params.id} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    );
  }
}
