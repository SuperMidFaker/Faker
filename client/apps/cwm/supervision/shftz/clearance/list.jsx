import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Radio, Select, message, Popconfirm } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { openClearanceModal, loadNormalDelgList, cancelBatchNormalClear } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import ModuleMenu from '../menu';
import ClearanceModal from './modal/clearanceModal';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const OptGroup = Select.OptGroup;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    delglist: state.cwmShFtz.normalDelgList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { openClearanceModal, switchDefaultWhse, loadNormalDelgList, cancelBatchNormalClear }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZClearanceList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    listFilter: PropTypes.object.isRequired,
    whses: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string, name: PropTypes.string })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentDidMount() {
    const listFilter = this.props.listFilter;
    let status = listFilter.status;
    if (['manifesting', 'sent', 'cleared'].filter(stkey => stkey === status).length === 0) {
      status = 'manifesting';
    }
    let ownerView = listFilter.ownerView;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = { ...listFilter, status, ownerView };
    this.handleNormalDelgLoad(1, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '清关委托编号',
    dataIndex: 'delg_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '提货单位(货主)',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '报关代理',
    dataIndex: 'broker_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '委托日期',
    width: 120,
    dataIndex: 'delg_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '申报日期',
    width: 120,
    dataIndex: 'decl_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '放行日期',
    width: 120,
    dataIndex: 'clean_time',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => (
      <span>
        <RowUpdater onHit={this.handleDelgManifest} label="清关明细" row={record} />
        <span className="ant-divider" />
        <Popconfirm title="确认取消委托?" onConfirm={() => this.handleDelgCancel(record)}>
          <a>取消委托</a>
        </Popconfirm>
      </span>
    ),
  }]

  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadNormalDelgList(params),
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
        whseCode: this.props.whse.code,
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.delglist,
  })
  handleNormalDelgLoad = (currentPage, whsecode, filter) => {
    const { tenantId, listFilter, whse, delglist: { pageSize, current } } = this.props;
    this.props.loadNormalDelgList({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
      whseCode: whsecode || whse.code,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleNewNormalDelgLoad = () => {
    this.handleNormalDelgLoad(1, null, { ...this.props.listFilter, status: 'manifesting' });
  }
  handleDelgCancel = (row) => {
    this.props.cancelBatchNormalClear({ normal_decl_no: row.normal_decl_no, delg_no: row.delg_no }).then((result) => {
      if (!result.error) {
        this.handleNewNormalDelgLoad();
      }
    });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleNormalDelgLoad(1, this.props.whse.code, filter);
  }
  handleCreateNormalDecl = () => {
    const { listFilter, owners } = this.props;
    const ownerCusCode = listFilter.ownerView !== 'all' ? listFilter.ownerView : (owners[0] && owners[0].customs_code);
    this.props.openClearanceModal({ ownerCusCode });
  }
  handleDelgManifest = (row) => {
    const link = `/clearance/${row.i_e_type}/manifest/`;
    this.context.router.push(`${link}${row.delg_no}`);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/clearance/detail/${row.normal_decl_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleNormalDelgLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleNormalDelgLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleNormalDelgLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { listFilter, whses, whse, owners, delglist } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = delglist;
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('batchSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={listFilter.filterNo} />
      <span />
      <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }} value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <OptGroup>
          <Option value="all">全部货主</Option>
          {owners.map(data => (<Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}
          </Option>)
            )}
        </OptGroup>
      </Select>
    </span>);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                  上海自贸区监管
                </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="clearance" />
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                  {bondedWhses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('ftzClearance')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="manifesting">制单中</RadioButton>
              <RadioButton value="sent">已申报</RadioButton>
              <RadioButton value="cleared">已放行</RadioButton>
            </RadioGroup>
            <div className="page-header-tools">
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateNormalDecl}>
                {this.msg('createClearance')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <DataTable columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id"
              toolbarActions={toolbarActions} scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
            />
          </Content>
        </Layout>
        <ClearanceModal reload={this.handleNewNormalDelgLoad} />
      </Layout>
    );
  }
}
