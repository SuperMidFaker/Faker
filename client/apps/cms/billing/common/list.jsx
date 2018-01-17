import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Breadcrumb, Button, Layout, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { loadBillings, updateBilling, sendBilling, billingInvoiced } from 'common/reducers/cmsBilling';
import { CMS_BILLING_STATUS } from 'common/constants';
import SearchBox from 'client/components/SearchBox';
import TrimSpan from 'client/components/trimSpan';
import { createFilename } from 'client/util/dataTransform';
import CancelChargeModal from '../modals/cancelChargeModal';
import { formatMsg } from '../message.i18n';
import BillingForm from './billingForm';

const { Header, Content } = Layout;


@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billings: state.cmsBilling.billings,
  }),
  {
    loadBillings, updateBilling, sendBilling, billingInvoiced,
  }
)
export default class BillingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loadBillings: PropTypes.func.isRequired,
    updateBilling: PropTypes.func.isRequired,
    sendBilling: PropTypes.func.isRequired,
    billingInvoiced: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    billingFormVisible: false,
    cancelChargeModalVisible: false,
    billingId: '',
    fromId: -1,
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  msg = formatMsg(this.props.intl)
  handleAddBtnClicked = () => {
    this.setState({
      billingFormVisible: true,
    });
  }
  toggleBillingForm = () => {
    this.setState({ billingFormVisible: !this.state.billingFormVisible });
  }
  handleSendBilling = (billingId) => {
    const { tenantId } = this.props;
    this.props.sendBilling({ tenantId, billingId }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('发送成功');
        this.handleTableLoad();
      }
    });
  }
  handleTableLoad = () => {
    const { tenantId, type } = this.props;
    const { pageSize, currentPage } = this.props.billings;
    this.props.loadBillings({
      type,
      tenantId,
      pageSize,
      currentPage,
    });
  }
  toggleCancelChargeModal = () => {
    this.setState({ cancelChargeModalVisible: !this.state.cancelChargeModalVisible });
  }
  handleShowCancelChargeModal = (billingId, fromId) => {
    this.setState({ billingId, fromId });
    this.setState({ cancelChargeModalVisible: true });
  }
  handleInvoiced = (billingId) => {
    this.props.billingInvoiced({ tenantId: this.props.tenantId, billingId }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleExportExcel = () => {
    const { tenantId, type } = this.props;
    window.open(`${API_ROOTS.mongo}v1/clearance/billing/exportBillingsExcel/${createFilename('billings')}.xlsx?tenantId=${tenantId}&type=${type}`);
  }
  render() {
    const { tenantId, type } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadBillings(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination) => {
        const params = {
          type,
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.billings,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: this.msg('billingName'),
      dataIndex: 'name',
      render(o, record) {
        return <Link to={`/clearance/billing/${type}/view/${record._id}`}>{o}</Link>;
      },
    }, {
      title: this.msg('startDate'),
      dataIndex: 'begin_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: this.msg('endDate'),
      dataIndex: 'end_date',
      render(o) {
        return moment(o).format('YYYY.MM.DD');
      },
    }, {
      title: type === 'receivable' ? '客户' : '供应商',
      dataIndex: type === 'receivable' ? 'send_name' : 'recv_name',
      render(o) {
        return <TrimSpan text={o} maxLen={10} />;
      },
    }, {
      title: this.msg('servCharge'),
      dataIndex: 'serv_charge',
      render(o) {
        return (<span style={{ color: '#0000FF' }}>{o}</span>);
      },
    }, {
      title: this.msg('advanceCharge'),
      dataIndex: 'advance_charge',
      render(o) {
        return (<span style={{ color: '#0000FF' }}>{o}</span>);
      },
    }, {
      title: this.msg('adjustCharge'),
      dataIndex: 'adjust_charge',
      render(o) {
        return (<span style={{ color: '#FF0000' }}>{o}</span>);
      },
    }, {
      title: this.msg('totalCharge'),
      dataIndex: 'total_charge',
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: this.msg('cancelCharge'),
      dataIndex: 'cancel_charge',
      render(o) {
        return (<span style={{ color: '#FF9933' }}>{o}</span>);
      },
    }, {
      title: this.msg('status'),
      dataIndex: 'status',
      render(o) {
        return CMS_BILLING_STATUS[o];
      },
    }, {
      title: this.msg('operation'),
      dataIndex: '_id',
      render: (o, record) => {
        if (record.status === 1) {
          return (
            <div>
              <a onClick={() => this.handleSendBilling(record._id)}>{this.msg('send')}</a>
              <span className="ant-divider" />
              <Link to={`/clearance/billing/${type}/edit/${o}`}>{this.msg('edit')}</Link>
            </div>
          );
        } else if (record.status === 2) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>{this.msg('view')}</Link>
            </div>
          );
        } else if (record.status === 3) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/check/${o}`}>{this.msg('checkBilling')}</Link>
            </div>
          );
        } else if (record.status === 4) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>{this.msg('view')}</Link>
            </div>
          );
        } else if (record.status === 5) {
          return (
            <div>
              <a onClick={() => this.handleInvoiced(record._id)}>{this.msg('invoiced')}</a>
            </div>
          );
        } else if (record.status === 6) {
          return (
            <div>
              <a onClick={() => this.handleShowCancelChargeModal(record._id, record.from_id)}>{this.msg('chargeOff')}</a>
            </div>
          );
        } else if (record.status === 7) {
          return (
            <div>
              <Link to={`/clearance/billing/${type}/view/${o}`}>{this.msg('view')}</Link>
            </div>
          );
        }
        return '';
      },
    }];

    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('billing')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg(this.props.type)}{this.msg('bills')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="ghost" icon="export" onClick={this.handleExportExcel}>{this.msg('export')}</Button>
            <Button type="primary" icon="plus" onClick={this.handleAddBtnClicked}>{this.msg('createBilling')}</Button>
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="toolbar">
              <SearchBox
                placeholder="输入账单名称搜索"
                onSearch={this.handleSearchInput}
                style={{ width: 200 }}
              />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} rowKey="id" />
            </div>
            <BillingForm type={this.props.type} visible={this.state.billingFormVisible} toggle={this.toggleBillingForm} />
            <CancelChargeModal
              visible={this.state.cancelChargeModalVisible}
              toggle={this.toggleCancelChargeModal}
              billingId={this.state.billingId}
              fromId={this.state.fromId}
              handleOk={this.handleTableLoad}
            />
          </div>
        </Content>
      </div>

    );
  }
}
