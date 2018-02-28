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
import { FEE_TYPE, FEE_CATEGORY } from 'common/constants';
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

  recColumns = [{
    title: '业务流水号',
    dataIndex: 'biz_seq_no',
    width: 180,
  }, {
    title: '费用名称',
    dataIndex: 'fee_name',
  }, {
    title: '费用种类',
    dataIndex: 'category',
    width: 100,
    render: (o) => {
      const category = FEE_CATEGORY.filter(fe => fe.value === o)[0];
      return category ? <span>{category.text}</span> : <span />;
    },
  }, {
    title: '费用类型',
    dataIndex: 'fee_style',
    width: 100,
    render: (o) => {
      const type = FEE_TYPE.filter(fe => fe.value === o)[0];
      return type ? <span>{type.text}</span> : <span />;
    },
  }, {
    title: '营收金额(人民币)',
    dataIndex: 'total_fee',
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
    dataIndex: 'fee_name',
  }, {
    title: '费用种类',
    dataIndex: 'category',
    width: 100,
    render: (o) => {
      const category = FEE_CATEGORY.filter(fe => fe.value === o)[0];
      return category ? <span>{category.text}</span> : <span />;
    },
  }, {
    title: '费用类型',
    dataIndex: 'fee_style',
    width: 100,
    render: (o) => {
      const type = FEE_TYPE.filter(fe => fe.value === o)[0];
      return type ? <span>{type.text}</span> : <span />;
    },
  }, {
    title: '成本金额(人民币)',
    dataIndex: 'total_fee',
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
            <Tabs defaultActiveKey={this.props.params.prType} onChange={this.handleTabChange}>
              <TabPane tab="应收明细" key="receivable" >
                <DataPane
                  fullscreen={this.state.fullscreen}
                  columns={this.recColumns}
                  dataSource={this.state.datas}
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
