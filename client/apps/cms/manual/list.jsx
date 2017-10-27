import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, Button, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import SearchBar from 'client/components/SearchBar';
import ImportModal from './modal/importModal';
// import RowUpdater from 'client/components/rowUpdater';
import { showImportModal, loadManualLists } from 'common/reducers/cmsTradeManual';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';


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
export default class ManualList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,

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
    title: this.msg('手/帐册编号'),
    dataIndex: 'manual_no',
    width: 120,
    fixed: 'left',
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record)}>
        {o}
      </a>),
  }, {
    title: this.msg('货主'),
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('经营单位'),
    width: 180,
    dataIndex: 'trade_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('手/帐册类型'),
    width: 200,
    dataIndex: 'manual_type',
    render: o => <TrimSpan text={o} maxLen={25} />,
  }, {
    title: this.msg('主管海关'),
    width: 180,
    dataIndex: 'master_customs_code',
    render: o => <TrimSpan text={this.props.customs.find(cs => cs.value === o) && this.props.customs.find(cs => cs.value === o).text} maxLen={20} />,
  }, {
    title: this.msg('贸易方式'),
    width: 180,
    dataIndex: 'trade_mode',
    render: o => <TrimSpan text={this.props.tradeModes.find(tm => tm.value === o) && this.props.tradeModes.find(tm => tm.value === o).text} maxLen={10} />,
  }, {
    title: this.msg('征免性质'),
    width: 80,
    dataIndex: 'cut_mode',
    render: o => <TrimSpan text={this.props.remissionModes.find(rm => rm.value === o) && this.props.remissionModes.find(rm => rm.value === o).text} maxLen={10} />,
  }, {
    title: this.msg('录入日期'),
    dataIndex: 'input_date',
    render: (o, record) => record.input_date ? moment(record.input_date).format('MM.DD HH:mm') : '-',
  }, {
    title: this.msg('申报日期'),
    dataIndex: 'decl_date',
    render: (o, record) => record.decl_date ? moment(record.decl_date).format('MM.DD HH:mm') : '-',
  }, {
    title: this.msg('有效日期'),
    dataIndex: 'valid_date',
    render: (o, record) => record.valid_date ? moment(record.valid_date).format('MM.DD HH:mm') : '-',
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
  render() {
    const { loading } = this.props.loading;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} size="large"
        onInputSearch={this.handleSearch}
      /></span>);
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
                {this.msg('manual')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" size="large" onClick={this.handleCreateBtnClick} icon="upload">
              {this.msg('导入')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions}
            rowSelection={rowSelection} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            columns={this.columns} dataSource={dataSource} rowKey="manual_no" loading={loading}
          />
          <ImportModal />
        </Content>
      </Layout>
    );
  }
}
