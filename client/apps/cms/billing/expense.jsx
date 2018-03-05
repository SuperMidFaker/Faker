import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Layout, Tabs } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { loadExpsDetails } from 'common/reducers/cmsExpense';
import { FEE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ dispatch, params, state }) {
  return dispatch(loadExpsDetails({
    delgNo: params.delgNo,
    tenantId: state.account.tenantId,
    prType: params.prType,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    expDetails: state.cmsExpense.expDetails,
  }),
  { loadExpsDetails }
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
    datas: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.expDetails !== nextProps.expDetails) {
      if (nextProps.expDetails && nextProps.expDetails.charges.length > 0) {
        this.setState({ datas: nextProps.expDetails.charges });
      } else {
        this.setState({ datas: [] });
      }
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleTabChange = (key) => {
    this.props.loadExpsDetails({
      delgNo: this.props.params.delgNo,
      tenantId: this.props.tenantId,
      prType: key,
    });
  }

  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (col, row) => row.index + 1,
  }, {
    title: '费用名称',
    dataIndex: 'fee_name',
    width: 200,
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
    render: (o) => {
      const type = FEE_TYPE.filter(fe => fe.value === o)[0];
      return type ? <span>{type.text}</span> : <span />;
    },
  }, {
    title: '计费金额(人民币)',
    dataIndex: 'sum_amount',
    width: 150,
    align: 'right',
  }, {
    title: '外币金额',
    dataIndex: 'orig_amount',
    width: 150,
    align: 'right',
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 100,
    align: 'right',
  }, {
    title: '开票税率',
    dataIndex: 'tax_rate',
    width: 100,
    align: 'right',
  }, {
    title: '税金',
    dataIndex: 'tax',
    width: 150,
    align: 'right',
  }, {
    title: '备注',
    dataIndex: 'remark',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    fixed: 'right',
    render: (o, record) => (<span><RowAction onClick={this.handleDetail} label="调整" row={record} />
      <span className="ant-divider" />
      <RowAction onClick={this.handleDetail} label="排除" row={record} />
    </span>),
  }]
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  render() {
    const { params } = this.props;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('expenseDetail')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {params.delgNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs
              defaultActiveKey={`${params.prType}-${params.dispId}`}
              onChange={this.handleTabChange}
            >
              <TabPane tab="应收明细" key={`receivable-${params.dispId}`} >
                <DataPane
                  fullscreen={this.state.fullscreen}
                  columns={this.columns}
                  dataSource={this.state.datas}
                  rowKey="id"
                  loading={this.state.loading}
                >
                  <DataPane.Toolbar />
                </DataPane>
              </TabPane>
              <TabPane tab="应付明细" key={`payable-${params.dispId}`} >
                <DataPane
                  fullscreen={this.state.fullscreen}
                  columns={this.columns}
                  dataSource={this.state.datas}
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
