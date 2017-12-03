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
import RowUpdater from 'client/components/rowUpdater';
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
  recColumns = [{
    title: '业务流水号',
    dataIndex: 'biz_seq_no',
    width: 180,
  }, {
    title: '费用名称',
    dataIndex: 'fee',
  }, {
    title: '费用种类',
    dataIndex: 'fee_category',
    width: 100,
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
  }, {
    title: '营收金额(人民币)',
    dataIndex: 'amount_rmb',
    width: 150,
  }, {
    title: '外币金额',
    dataIndex: 'amount_forc',
    width: 150,
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
  }, {
    title: '汇率',
    dataIndex: 'currency_rate',
    width: 100,
  }, {
    title: '调整金额',
    dataIndex: 'adj_amount',
    width: 150,
  }, {
    title: '审核人员',
    dataIndex: 'auditted_by',
    width: 150,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else {
        return (<span><RowUpdater onHit={this.handleDetail} label="调整" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleDetail} label="排除" row={record} /></span>);
      }
    },
  }]
  payColumns = [{
    title: '结算对象',
    dataIndex: 'billing_party',
    width: 180,
  }, {
    title: '费用名称',
    dataIndex: 'fee',
  }, {
    title: '费用种类',
    dataIndex: 'fee_category',
    width: 100,
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
  }, {
    title: '成本金额(人民币)',
    dataIndex: 'amount_rmb',
    width: 150,
  }, {
    title: '外币金额',
    dataIndex: 'amount_forc',
    width: 150,
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
  }, {
    title: '汇率',
    dataIndex: 'currency_rate',
    width: 100,
  }, {
    title: '调整金额',
    dataIndex: 'adj_amount',
    width: 150,
  }, {
    title: '审核人员',
    dataIndex: 'auditted_by',
    width: 150,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else {
        return (<span><RowUpdater onHit={this.handleDetail} label="调整" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleDetail} label="排除" row={record} /></span>);
      }
    },
  }]
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { summary } = this.state;
    const mockData = [{
      order_rel_no: '5',
      fee: '报关费',
      age: 32,
      address: '西湖区湖底公园1号',
    }, {
      order_rel_no: '4',
      fee: '报检费',
      age: 42,
      address: '西湖区湖底公园1号',
    }, {
      order_rel_no: '2',
      fee: '入库费',
      age: 42,
      address: '西湖区湖底公园1号',
    }];
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
            <Button type="primary" icon="check-circle-o" onClick={this.handleCreateASN}>
              {this.msg('审核')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16 }} hoverable={false}>
            <Row type="flex">
              <Col span={14}>
                <DescriptionList col={2}>
                  <Description term="订单关联号">{summary.owner_name}</Description>
                  <Description term="订单日期">{summary.created_date && moment(summary.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                  <Description term="客户单号">{summary.asn_no}</Description>
                  <Description term="客户">{summary.total_expect_qty}</Description>
                </DescriptionList>
              </Col>
              <Col span={10} className="extra">
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
          <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="receiveDetails">
              <TabPane tab="应收明细" key="receiveDetails" >
                <DataPane fullscreen={this.state.fullscreen}
                  columns={this.recColumns}
                  dataSource={mockData} rowKey="id" loading={this.state.loading}
                >
                  <DataPane.Toolbar>
                    <Button icon="plus-square-o" onClick={this.handleCreateASN}>
                      {this.msg('加入客户账单')}
                    </Button>
                  </DataPane.Toolbar>
                </DataPane>
              </TabPane>
              <TabPane tab="应付明细" key="putawayDetails" >
                <DataPane fullscreen={this.state.fullscreen}
                  columns={this.payColumns}
                  dataSource={mockData} rowKey="id" loading={this.state.loading}
                >
                  <DataPane.Toolbar>
                    <Button icon="plus-square-o" onClick={this.handleCreateASN}>
                      {this.msg('加入供应商账单')}
                    </Button>
                  </DataPane.Toolbar>
                </DataPane>
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
