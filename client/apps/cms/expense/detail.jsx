import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import moment from 'moment';
import { Breadcrumb, Layout, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
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
  moduleName: 'clearance',
  jumpOut: true,
})
export default class ExpenseDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
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
        return (<span><RowAction onClick={this.handleReceive} label="入库操作" row={record} /> </span>);
      }
      return (<span><RowAction onClick={this.handleDetail} label="调整" row={record} />
        <span className="ant-divider" />
        <RowAction onClick={this.handleDetail} label="排除" row={record} />
      </span>);
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
        return (<span><RowAction onClick={this.handleReceive} label="入库操作" row={record} /> </span>);
      }
      return (<span><RowAction onClick={this.handleDetail} label="调整" row={record} />
        <span className="ant-divider" />
        <RowAction onClick={this.handleDetail} label="排除" row={record} />
      </span>);
    },
  }]
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }

  render() {
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
                {this.msg('expenseDetail')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.delgNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey={this.props.params.prType}>
              <TabPane tab="应收明细" key="receivable" >
                <DataPane
                  fullscreen={this.state.fullscreen}
                  columns={this.recColumns}
                  dataSource={mockData}
                  rowKey="id"
                  loading={this.state.loading}
                >
                  <DataPane.Toolbar />
                </DataPane>
              </TabPane>
              <TabPane tab="应付明细" key="payable" >
                <DataPane
                  fullscreen={this.state.fullscreen}
                  columns={this.payColumns}
                  dataSource={mockData}
                  rowKey="id"
                  loading={this.state.loading}
                >
                  <DataPane.Toolbar />
                </DataPane>
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
