import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import SearchBar from 'client/components/search-bar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgList } from 'common/reducers/cmsDeclare';
import { setNavTitle } from 'common/reducers/navbar';
import makeColumn from './columnsDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie, params }) {
  const filter = { ...state.cmsDeclare.listFilter, declareType: params.status };
  return dispatch(loadDelgList(cookie, {
    tenantId: state.account.tenantId,
    filter: JSON.stringify(filter),
    pageSize: state.cmsDeclare.delgList.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
    delgList: state.cmsDeclare.delgList,
    listFilter: state.cmsDeclare.listFilter,
  }),
  { loadDelgList })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'cmsDeclare'),
    moduleName: props.ietype,
    withModuleLayout: false,
    goBackFn: null,
  }));
})
export default class DeclareList extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    listFilter: PropTypes.object.isRequired,
    delgList: PropTypes.object.isRequired,
    loadDelgList: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: []
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.status !== this.props.params.status) {
      const filter = { ...nextProps.listFilter, declareType: nextProps.params.status };
      return nextProps.loadDelgList(null, {
        tenantId: nextProps.tenantId,
        filter: JSON.stringify(filter),
        pageSize: nextProps.delgList.pageSize,
        current: 1,
      });
    }
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadDelgList(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify({
          ...this.props.listFilter, sortField: sorter.field,
          sortOrder: sorter.order,
        }),
      };
      /*
      params.filters = params.filters.filter(
        flt => flt.name === 'type' || (flt.name in filters && filters[flt.name].length)
      );
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters = this.mergeFilters(params.filters, key, filters[key][0]);
        }
      }
      params.filters = JSON.stringify(params.filters);
     */
      return params;
    },
    remotes: this.props.delgList
  })

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleTableLoad = (filter, current) => {
    this.props.loadDelgList(null, {
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter || this.props.listFilter),
      pageSize: this.props.delgList.pageSize,
      current: current || this.props.delgList.current,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchVal) => {
    const filter = { ...this.props.listFilter, name: searchVal };
    this.handleTableLoad(filter, 1);
  }
  handleShipmentFilter = (ev) => {
    const targetVal = ev.target.value;
    this.context.router.push({ pathname:
      `/${this.props.ietype}/declare/list/${targetVal}`
    });
  }
  render() {
    const { aspect, delgList, params, ietype } = this.props;
    this.dataSource.remotes = delgList;
    const columns = makeColumn(params.status, aspect, ietype, {}, this.msg);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} value={params.status}>
            <RadioButton value="undeclared">{this.msg('undeclaredDelg')}</RadioButton>
            <RadioButton value="declaring">{this.msg('declaringDelg')}</RadioButton>
            <RadioButton value="declared">{this.msg('declaredDelg')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header"></div>
          <div className="panel-body">
            <Table rowSelection={rowSelection} columns={columns} loading={delgList.loading}
              dataSource={this.dataSource} scroll={{ x: 2400, y: 460 }}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
      </div>
    );
  }
}
