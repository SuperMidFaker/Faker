import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { message, Icon } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDeclExps, openDeclInputModal } from 'common/reducers/cmsExpense';
import { showPreviewer } from 'common/reducers/cmsDelegation';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import SearchBar from 'client/components/search-bar';
import PreviewPanel from './modals/preview-panel';
import RowUpdater from './rowUpdater';
import DeclexpInputModal from './modals/declInputModal';

const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  return dispatch(loadDeclExps({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.cmsExpense.declexps.pageSize,
    currentPage: state.cmsExpense.declexps.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    declexps: state.cmsExpense.declexps,
    listFilter: state.cmsExpense.listFilter,
    saved: state.cmsExpense.saved,
  }),
  { openDeclInputModal, loadDeclExps, showPreviewer }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'expense' })
export default class ExpenseList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    declexps: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    listFilter: PropTypes.object.isRequired,
    openDeclInputModal: PropTypes.func.isRequired,
    loadDeclExps: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.saved !== this.props.saved) {
      this.handleExpListLoad();
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [{
    title: this.msg('entryId'),
    dataIndex: 'entry_id',
    width: 100,
  }, {
    title: this.msg('preEntryNo'),
    dataIndex: 'pre_entry_seq_no',
    width: 100,
  }, {
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 100,
  }, {
    title: '收款',
    children: [
      {
        title: this.msg('allBill'),
        width: 100,
        dataIndex: 'all_bill',
        key: 'all_bill',
        render: (o) => {
          if (o) {
            return (<span className="mdc-text-info"><b>{o.toFixed(2)}</b></span>);
          }
        },
      },
    ],
  }, {
    title: '付款',
    children: [
      {
        title: this.msg('allCost'),
        dataIndex: 'all_cost',
        width: 100,
        render: (o) => {
          if (o) {
            return (<span className="mdc-text-warning"><b>{o.toFixed(2)}</b></span>);
          }
        },
      },
    ],
  }, {
    title: this.msg('操作'),
    width: 80,
    fixed: 'right',
  },
  ];
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDeclExps(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.declexps,
  })

  handleInput = (row) => {
    this.props.openDeclInputModal(row);
  }
  handleExpListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, declexps: { pageSize, current } } = this.props;
    this.props.loadDeclExps({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.listFilter, searchVal);
    this.handleExpListLoad(1, filters);
  }
  mergeFilters(curFilters, value) {
    const newFilters = {};
    Object.keys(curFilters).forEach((key) => {
      if (key !== 'filterNo') {
        newFilters[key] = curFilters[key];
      }
    });
    if (value !== null && value !== undefined && value !== '') {
      newFilters.filterNo = value;
    }
    return newFilters;
  }
  render() {
    const { declexps } = this.props;
    this.dataSource.remotes = declexps;
    const columns = [...this.columns];
    columns[3].children = [
      {
        title: this.msg('allBill'),
        width: 100,
        dataIndex: 'all_bill',
        key: 'all_bill',
        render: (o) => {
          if (o) {
            return (<span className="mdc-text-info"><b>{o.toFixed(2)}</b></span>);
          }
        },
      }];
    columns[4].children = [
      {
        title: this.msg('allCost'),
        dataIndex: 'all_cost',
        width: 100,
        render: (o) => {
          if (o) {
            return (<span className="mdc-text-warning"><b>{o.toFixed(2)}</b></span>);
          }
        },
      }];
    declexps.fields.forEach((fld) => {
      columns[3].children.push({
        title: fld.name,
        dataIndex: `bill_${fld.code}`,
        width: 100,
        render: (o, record) => {
          if (!o.editable) {
            return o.value && o.value.toFixed(2);
          } else {
            const value = o.value && o.value.toFixed(2);
            return (
              <RowUpdater onHit={this.handleInput} field={`bill_${fld.code}`}
                row={{
                  delg_no: record.delg_no,
                  entry_id: record.entry_id,
                  fee_name: fld.name,
                  fee_code: fld.code,
                  is_ciq: o.is_ciq,
                }} label={<Icon type="edit">{value}</Icon>}
              />
            );
          }
        },
      });
      columns[4].children.push({
        title: fld.name,
        dataIndex: `cost_${fld.code}`,
        width: 100,
        render: (o, record) => {
          if (!o.editable) {
            return o.value && o.value.toFixed(2);
          } else {
            const value = o.value && o.value.toFixed(2);
            return (
              <RowUpdater onHit={this.handleInput} field={`cost_${fld.code}`}
                row={{
                  delg_no: record.delg_no,
                  entry_id: record.entry_id,
                  fee_name: fld.name,
                  fee_code: fld.code,
                  is_ciq: o.is_ciq,
                }} label={<Icon type="edit">{value}</Icon>}
              />
            );
          }
        },
      });
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('expense')}</span>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel group-header">
              <Table columns={columns} dataSource={this.dataSource} loading={declexps.loading}
                bordered scroll={{ x: 2000 }}
              />
            </div>
          </div>
        </div>
        <PreviewPanel ietype="import" />
        <DeclexpInputModal />
      </QueueAnim>
    );
  }
}
