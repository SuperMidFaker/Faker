import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Col, Row, Layout, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import StatementsPane from './tabpane/statementsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,

  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'bss',
  jumpOut: true,
})
export default class ReceivableBillDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    summary: {},
  }

  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  render() {
    const { summary } = this.state;

    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('bill'), this.props.params.billNo]}>
          <PageHeader.Actions>
            <Button icon="mail" onClick={this.handleCreateASN}>
              {this.msg('发送账单')}
            </Button>
            <Button type="primary" icon="check-circle-o" onClick={this.handleCreateASN}>
              {this.msg('对账确认')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <Row type="flex">
              <Col span={16}>
                <DescriptionList col={4}>
                  <Description term="账单编号">{summary.asn_no}</Description>
                  <Description term="客户">{summary.owner_name}</Description>
                  <Description term="账单期间">{summary.created_date && moment(summary.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                </DescriptionList>
              </Col>
              <Col span={8} className="extra">
                <div>
                  <p>账单金额</p>
                  <p>5,680</p>
                </div>
                <div>
                  <p>调整金额</p>
                  <p>2,890</p>
                </div>
                <div>
                  <p>最终金额</p>
                  <p>2,223</p>
                </div>
              </Col>
            </Row>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
              <Tabs defaultActiveKey="statements" onChange={this.handleTabChange}>
                <TabPane tab="账单明细" key="statements" >
                  <StatementsPane />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
