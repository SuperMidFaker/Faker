import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Layout } from 'antd';
import { format } from 'client/common/i18n/helpers';
import connectFetch from 'client/common/decorators/connect-fetch';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { showImportModal, loadManualLists } from 'common/reducers/cmsTradeManual';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import SearchBar from 'client/components/SearchBar';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;

function fetchData({ state, dispatch }) {
  dispatch(loadManualLists({
    pageSize: state.cmsTradeManual.manuallist.pageSize,
    current: state.cmsTradeManual.manuallist.current,
  }));
  const promises = [];
  promises.push(dispatch(loadManualLists({
    pageSize: state.cmsTradeManual.manuallist.pageSize,
    current: state.cmsTradeManual.manuallist.current,
  })));
  promises.push(dispatch(loadCmsParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    manuallist: state.cmsTradeManual.manuallist,
    loading: state.cmsTradeManual.manuallist.loading,
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
      rate_cny: cr.rate_CNY,
    })),
    remissionModes: state.cmsManifest.params.remissionModes.map(rm => ({
      value: rm.rm_mode,
      text: rm.rm_abbr,
    })),
    customs: state.cmsManifest.params.customs.map(cs => ({
      value: cs.customs_code,
      text: cs.customs_name,
    })),
    tradeModes: state.cmsManifest.params.tradeModes.map(tm => ({
      value: tm.trade_mode,
      text: tm.trade_abbr,
    })),
  }),
  { showImportModal, loadManualLists }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class PermitList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('证书编号'),
    dataIndex: 'permit_no',
    width: 150,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('关联货主'),
    width: 180,
    dataIndex: 'owner_name',
  }, {
    title: this.msg('涉证标准'),
    width: 150,
    dataIndex: 'permit_category',
  }, {
    title: this.msg('证书类型'),
    width: 180,
    dataIndex: 'permit_type',
  }, {
    title: this.msg('总使用次数'),
    width: 120,
    dataIndex: 'max_usage',
  }, {
    title: this.msg('剩余使用次数'),
    width: 120,
    dataIndex: 'avail_usage',
  }, {
    title: this.msg('发证日期'),
    dataIndex: 'start_date',
    render: (o, record) => (record.input_date ? moment(record.input_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('有效期至'),
    dataIndex: 'stop_date',
    render: (o, record) => (record.decl_date ? moment(record.decl_date).format('MM.DD HH:mm') : '-'),
  }, {
    title: this.msg('状态'),
    width: 80,
    dataIndex: 'status',
  }, {
    title: this.msg('证书文件'),
    width: 80,
    dataIndex: 'permit_files',
  }]
  handlePreview = (manualNo) => {
    this.context.router.push(`/clearance/manual/${manualNo}`);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleCreateBtnClick = () => {
    this.props.showImportModal();
  }
  handleReload = () => {
    this.props.loadManualLists({
      pageSize: this.props.manuallist.pageSize,
      current: this.props.manuallist.current,
    });
  }
  handleSearch = (value) => {
    this.props.loadManualLists({
      pageSize: this.props.manuallist.pageSize,
      current: this.props.manuallist.current,
      filters: { text: value },
    });
  }
  handleExportClick = () => {
    window.open(`${XLSX_CDN}/手册导入模板.xlsx`);
  }
  render() {
    const { loading } = this.props.loading;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar
        placeholder={this.msg('搜索手/账册编号')}
        onInputSearch={this.handleSearch}
      />
    </span>);
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadManualLists(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination) => {
        const params = {
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: { text: this.state.searchInput },
        };
        return params;
      },
      remotes: this.props.manuallist,
    });
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('permit')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" onClick={this.handleCreateBtnClick} icon="upload">
              {this.msg('导入')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={dataSource}
            rowKey="permit_no"
            loading={loading}
          />
        </Content>
      </Layout>
    );
  }
}
