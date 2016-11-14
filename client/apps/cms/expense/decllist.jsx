import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Radio, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDeclExps, openInModal, loadCurrencies, openMarkModal } from 'common/reducers/cmsExpense';
import { showPreviewer } from 'common/reducers/cmsDelegation';
import { EXP_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import moment from 'moment';
import SearchBar from 'client/components/search-bar';
import TrimSpan from 'client/components/trimSpan';
import ExpSubTable from './expSubTable';
import InputModal from './modals/inputModal';
import MarkModal from './modals/markModal';
import PreviewPanel from './modals/preview-panel';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
  { openInModal, loadCurrencies, loadDeclExps, openMarkModal, showPreviewer }
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
    openInModal: PropTypes.func.isRequired,
    openMarkModal: PropTypes.func.isRequired,
    loadCurrencies: PropTypes.func.isRequired,
    loadDeclExps: PropTypes.func.isRequired,
    saved: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    expandedKeys: [],
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
      }, {
        title: this.msg('海关查验'),
        children: [
          {
            title: this.msg('场地费'),
            dataIndex: 'hgcycdf_bill',
            key: 'hgcycdf_bill',
            width: 100,
            render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
          }, {
            title: this.msg('服务费'),
            dataIndex: 'hgcyfwf_bill',
            key: 'hgcyfwf_bill',
            width: 100,
            render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
          },
        ],
      }, {
        title: this.msg('动检'),
        children: [{
          title: '场地费',
          dataIndex: 'djcdf_bill',
          key: 'djcdf_bill',
          width: 100,
          render: (o) => {
            if (o) {
              return o.toFixed(2);
            }
          },
        }, {
          title: '服务费',
          dataIndex: 'djcyfwf_bill',
          key: 'djcyfwf_bill',
          width: 100,
          render: (o) => {
            if (o) {
                return o.toFixed(2);
              }
          },
        }],
      }, {
        title: this.msg('品质查验'),
        children: [{
          title: '场地费',
          dataIndex: 'pzcycdf_bill',
          key: 'pzcycdf_bill',
          width: 100,
          render: (o) => {
            if (o) {
                return o.toFixed(2);
              }
          },
        }, {
          title: '服务费',
          dataIndex: 'pzcyfwf_bill',
          key: 'pzcyfwf_bill',
          width: 100,
          render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
        }],
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
      }, {
        title: this.msg('海关查验'),
        children: [
          {
            title: this.msg('场地费'),
            dataIndex: 'hgcycdf_cost',
            key: 'hgcycdf_cost',
            width: 100,
            render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
          }, {
            title: this.msg('服务费'),
            dataIndex: 'hgcyfwf_cost',
            key: 'hgcyfwf_cost',
            width: 100,
            render: (o) => {
              if (o) {
                  return o.toFixed(2);
                }
            },
          },
        ],
      }, {
        title: this.msg('动检'),
        children: [{
          title: '场地费',
          dataIndex: 'djcdf_cost',
          key: 'djcdf_cost',
          width: 100,
          render: (o) => {
            if (o) {
                return o.toFixed(2);
              }
          },
        }, {
          title: '服务费',
          dataIndex: 'djcyfwf_cost',
          key: 'djcyfwf_cost',
          width: 100,
          render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
        }],
      }, {
        title: this.msg('品质查验'),
        children: [{
          title: '场地费',
          dataIndex: 'pzcycdf_cost',
          key: 'pzcycdf_cost',
          width: 100,
          render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
        }, {
            title: '服务费',
            dataIndex: 'pzcyfwf_cost',
            key: 'pzcyfwf_cost',
            width: 100,
            render: (o) => {
              if (o) {
                return o.toFixed(2);
              }
            },
          }],
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

  handleExpListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, declexps: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
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
    const { declexps, listFilter } = this.props;
    this.dataSource.remotes = declexps;
    const unstateData = declexps.data.filter(dt => dt.status === 0);
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
              <Table columns={this.columns} dataSource={this.dataSource} loading={declexps.loading}
                bordered scroll={{ x: 2000 }}
              />
            </div>
          </div>
        </div>
        <InputModal data={unstateData} />
        <MarkModal data={unstateData} />
        <PreviewPanel ietype="import" />
      </QueueAnim>
    );
  }
}
