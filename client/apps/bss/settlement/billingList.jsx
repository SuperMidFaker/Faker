import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button, message, Popconfirm, Layout } from 'antd';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import BillingForm from './modals/billingForm';
import { loadBillings, sendBilling, changeBillingsFilter, removeBilling, loadPartners } from 'common/reducers/crmBilling';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CRM_BILLING_STATUS } from 'common/constants';
import CancelChargeModal from './modals/cancelChargeModal';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';

const formatMsg = format(messages);
const { Header, Content } = Layout;
function fetchData({ state, dispatch }) {
  return dispatch(loadBillings({
    tenantId: state.account.tenantId,
    pageSize: state.crmBilling.billings.pageSize,
    current: state.crmBilling.billings.current,
    searchValue: state.crmBilling.billings.searchValue,
    filters: state.crmBilling.billings.filters,
  }));
}

@connectFetch()(fetchData)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billings: state.crmBilling.billings,
    loading: state.crmBilling.loading,
  }),
  {
    loadBillings, sendBilling, changeBillingsFilter, removeBilling, loadPartners,
  }
)
export default class BillingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadBillings: PropTypes.func.isRequired,
    sendBilling: PropTypes.func.isRequired,
    changeBillingsFilter: PropTypes.func.isRequired,
    removeBilling: PropTypes.func.isRequired,
    loadPartners: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    billings: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    billingFormVisible: false,
    cancelChargeModalVisible: false,
    billingId: -1,
    fromId: -1,
    totalCharge: 0,
    customers: [],
    carriers: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadPartners(this.props.tenantId, [PARTNER_ROLES.CUS], [PARTNER_BUSINESSE_TYPES.clearance, PARTNER_BUSINESSE_TYPES.transport]).then((result) => {
      this.setState({ customers: result.data });
    });
  }
  componentDidMount() {
    // this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.billings.searchValue !== nextProps.billings.searchValue) {
      // this.handleTableLoad(nextProps.billings.searchValue);
    }
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAddBtnClicked = () => {
    this.setState({
      billingFormVisible: true,
    });
  }
  toggleBillingForm = () => {
    this.setState({ billingFormVisible: !this.state.billingFormVisible });
  }
  toggleCancelChargeModal = () => {
    this.setState({ cancelChargeModalVisible: !this.state.cancelChargeModalVisible });
  }
  handleSendBilling = (billingId) => {
    const { loginId, tenantId, loginName } = this.props;
    this.props.sendBilling({
      tenantId, loginId, loginName, billingId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('发送成功');
        this.handleTableLoad();
      }
    });
  }
  handleRemoveBilling = (billingId) => {
    const { loginId, tenantId, loginName } = this.props;
    this.props.removeBilling({
      tenantId, loginId, loginName, billingId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功');
        this.handleTableLoad();
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTableLoad = (searchValue) => {
    const { tenantId } = this.props;
    const { pageSize, current, filters } = this.props.billings;
    this.props.loadBillings({
      tenantId,
      pageSize,
      current,
      searchValue: searchValue !== undefined ? searchValue : this.props.billings.searchValue,
      filters,
    });
  }
  handleShowCancelChargeModal = (billingId, fromId, totalCharge) => {
    this.setState({ billingId, fromId, totalCharge });
    this.setState({ cancelChargeModalVisible: true });
  }
  handleExportExcel = () => {
    // const { tenantId } = this.props;
    // window.open(`${API_ROOTS.default}v1/transport/billing/exportBillingsExcel/${createFilename('billings')}.xlsx?tenantId=${tenantId}`);
    // this.handleClose();
  }
  handleSearchInput = (value) => {
    this.props.changeBillingsFilter('searchValue', value);
  }
  render() {
    const { customers } = this.state;
    const { tenantId, loading } = this.props;
    const { searchValue } = this.props.billings;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadBillings(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters) => {
        const params = {
          tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          searchValue,
          filters,
        };
        return params;
      },
      remotes: this.props.billings,
    });

    const columns = [{
      title: '账单名称',
      dataIndex: 'name',
      width: 150,
      render(o, record) {
        return <Link to={`/scof/billing/view/${record.id}`}>{o}</Link>;
      },
    }, {
      title: '开始日期',
      dataIndex: 'begin_date',
      width: 140,
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '结束日期',
      dataIndex: 'end_date',
      width: 140,
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: '客户',
      dataIndex: 'customer_name',
      width: 180,
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
      filters: customers.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.name })),
    }, {
      title: '运单数量',
      dataIndex: 'shipmt_order_count',
      width: 100,
    }, {
      title: '清关费用',
      dataIndex: 'ccb_charge',
      width: 100,
    }, {
      title: '运输费用',
      dataIndex: 'trs_charge',
      width: 100,
    }, {
      title: '调整费用',
      dataIndex: 'adjust_charge',
      width: 100,
      render(o) {
        return (<span style={{ color: '#FF0000' }}>{o}</span>);
      },
    }, {
      title: '账单总金额',
      dataIndex: 'total_charge',
      width: 100,
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: '核销金额',
      dataIndex: 'cancel_charge',
      width: 80,
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: '账单状态',
      dataIndex: 'status',
      width: 180,
      render(o) {
        return CRM_BILLING_STATUS[o];
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      width: 100,
      render: (o, record) => {
        if (record.status === 1) {
          return (
            <div>
              <Popconfirm title="确定发送？" onConfirm={() => this.handleSendBilling(record.id)}>
                <a>发送</a>
              </Popconfirm>
              <span className="ant-divider" />
              <Link to={`/scof/billing/edit/${o}`}>修改</Link>
              <span className="ant-divider" />
              <Popconfirm title="确定删除？" onConfirm={() => this.handleRemoveBilling(record.id)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          );
        } else if (record.status === 2) {
          return (
            <div>
              <Link to={`/scof/billing/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 3) {
          return (
            <div>
              <Link to={`/scof/billing/check/${o}`}>{this.msg('checkBilling')}</Link>
            </div>
          );
        } else if (record.status === 4) {
          return (
            <div>
              <Link to={`/scof/billing/view/${o}`}>查看</Link>
            </div>
          );
        } else if (record.status === 5) {
          return (
            <div>
              <a onClick={() => this.handleShowCancelChargeModal(record.id, record.from_id, record.total_charge)}>核销</a>
            </div>
          );
        } else if (record.status === 6) {
          return (
            <div>
              <Link to={`/scof/billing/view/${o}`}>查看</Link>
            </div>
          );
        }
        return '';
      },
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg('billing')}</span>
          <div className="page-header-tools">
            <SearchBox
              placeholder="输入账单名称搜索"
              onSearch={this.handleSearchInput}
              value={this.props.billings.searchValue}
            />
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <Button type="primary" icon="plus" onClick={this.handleAddBtnClicked}>{this.msg('createBilling')}</Button>
              <Button onClick={this.handleExportExcel}>{this.msg('export')}</Button>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" loading={loading} />
            </div>
            <BillingForm visible={this.state.billingFormVisible} toggle={this.toggleBillingForm} />
            <CancelChargeModal
              visible={this.state.cancelChargeModalVisible}
              toggle={this.toggleCancelChargeModal}
              billingId={this.state.billingId}
              fromId={this.state.fromId}
              totalCharge={this.state.totalCharge}
              handleOk={this.handleTableLoad}
            />
          </div>
        </Content>
      </div>

    );
  }
}
