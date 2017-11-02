import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Breadcrumb, Col, Layout, Card, Row, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import './index.less';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;

const TabPane = Tabs.TabPane;

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
export default class FeeSummaryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    printed: false,
    activeTab: '',
    fullscreen: true,
    summary: {},
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '订单关联号',
    dataIndex: 'order_rel_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '账单号',
    width: 180,
    dataIndex: 'bill_no',
  }, {
    title: '收/付',
    dataIndex: 'rec_pay',
    width: 100,
  }, {
    title: '费用名称',
    width: 120,
    dataIndex: 'fee',

  }, {
    title: '金额(人民币)',
    dataIndex: 'amount_rmb',
    width: 100,
  }, {
    title: '外币金额',
    dataIndex: 'amount_forc',
    width: 100,
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
  }, {
    title: '汇率',
    dataIndex: 'currency_rate',
    width: 100,
  }, {
    title: '税率',
    dataIndex: 'tax_rate',
    width: 100,
  }, {
    title: '税金',
    dataIndex: 'tax',
    width: 100,
  }]
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { summary } = this.state;

    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('fee')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('feeSummary')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.orderRelNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button size="large" icon="upload" onClick={this.handleCreateASN}>
              {this.msg('加入账单')}
            </Button>
            <Button type="primary" size="large" icon="upload" onClick={this.handleCreateASN}>
              {this.msg('审核')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} noHovering>
            <Row>
              <Col span={16}>
                <DescriptionList col={3}>
                  <Description term="订单关联号">{summary.owner_name}</Description>
                  <Description term="客户">{summary.total_expect_qty}</Description>
                  <Description term="客户订单号">{summary.asn_no}</Description>
                  <Description term="订单日期">{summary.created_date && moment(summary.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                </DescriptionList>
              </Col>
              <Col span={8} className="extra">
                <div>
                  <p>应收金额</p>
                  <p>5,680</p>
                </div>
                <div>
                  <p>应付金额</p>
                  <p>2,890</p>
                </div>
                <div>
                  <p>利润</p>
                  <p>2,223</p>
                </div>
                <div>
                  <p>毛利率</p>
                  <p>12%</p>
                </div>
              </Col>
            </Row>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} noHovering onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="receiveDetails">
              <TabPane tab="应收明细" key="receiveDetails" >
                <DataPane fullscreen={this.state.fullscreen}
                  columns={this.columns}
                  dataSource={this.details} rowKey="id" loading={this.state.loading}
                />
              </TabPane>
              <TabPane tab="应付明细" key="putawayDetails" >
                <DataPane fullscreen={this.state.fullscreen}
                  columns={this.columns}
                  dataSource={this.details} rowKey="id" loading={this.state.loading}
                />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
