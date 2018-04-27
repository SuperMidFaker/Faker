import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Layout, Select, message } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { openNormalDeclModal, loadNormalDelgList, cancelBatchNormalClear } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import PageHeader from 'client/components/PageHeader';
import { format } from 'client/common/i18n/helpers';
import NormalDeclModal from './modal/normalDeclModal';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    delglist: state.cwmShFtz.normalDelgList,
    listFilter: state.cwmShFtz.listFilter,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
  }),
  {
    openNormalDeclModal, switchDefaultWhse, loadNormalDelgList, cancelBatchNormalClear,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class NormalDeclList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    listFilter: PropTypes.shape({ status: PropTypes.string.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    const { listFilter } = this.props;
    let { status, ownerView } = listFilter;
    if (['manifesting', 'sent', 'cleared', 'all'].filter(stkey => stkey === status).length === 0) {
      status = 'manifesting';
    }
    if (ownerView !== 'all' && this.props.owners.filter(owner =>
      listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = {
      ...listFilter, status, ownerView, filterNo: '',
    };
    this.handleNormalDelgLoad(1, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '出库清关编号',
    dataIndex: 'normal_decl_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '出区提货单号',
    dataIndex: 'ftz_rel_nos',
    width: 250,
    render: o => <span className="text-emphasis"><TrimSpan text={o} maxLen={20} /></span>,
  }, {
    title: '报关单号',
    dataIndex: 'cus_decl_nos',
    width: 180,
    render: o => <span className="text-emphasis"><TrimSpan text={o} maxLen={18} /></span>,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      switch (o) {
        case 2:
          return <Badge status="processing" text="委托制单" />;
        case 3:
          return <Badge status="processing" text="已申报" />;
        case 4:
          return <Badge status="success" text="已清关" />;
        default:
          return '';
      }
    },
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '清关委托编号',
    dataIndex: 'delg_no',
    width: 120,
  }, {
    title: '报关代理',
    dataIndex: 'broker_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '成交方式',
    dataIndex: 'trxn_mode',
    width: 140,
  }, {
    title: '委托时间',
    width: 120,
    dataIndex: 'delg_time',
    render: o => o && `${moment(o).format('MM.DD HH:mm')}`,
  }, {
    title: '申报日期',
    width: 120,
    dataIndex: 'decl_time',
    render: o => o && `${moment(o).format('MM.DD HH:mm')}`,
  }, {
    title: '放行日期',
    width: 120,
    dataIndex: 'clean_time',
    render: o => o && `${moment(o).format('MM.DD HH:mm')}`,
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o) &&
    this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '创建时间',
    width: 120,
    render: (o, record) => record.delg_time && moment(record.delg_time).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 100,
    fixed: 'right',
    render: (o, record) => (
      <span>
        <RowAction onClick={this.handleDetail} icon="eye-o" label="详情" row={record} />
        {record.manifested < 2 &&
        <RowAction confirm="确认取消委托?" onConfirm={this.handleDelgCancel} icon="close-circle-o" tooltip="取消报关委托" row={record} />}
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
    const { listFilter, whse, delglist: { pageSize, current } } = this.props;
    this.props.loadNormalDelgList({
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
    this.props.cancelBatchNormalClear({
      normal_decl_no: row.normal_decl_no,
      delg_no: row.delg_no,
    }).then((result) => {
      if (!result.error) {
        this.handleNewNormalDelgLoad();
      }
    });
  }
  handleStatusChange = (value) => {
    if (value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: value };
    this.handleNormalDelgLoad(1, this.props.whse.code, filter);
  }
  handleCreateNormalDecl = () => {
    const { listFilter, owners } = this.props;
    const ownerCusCode = listFilter.ownerView !== 'all' ? listFilter.ownerView : (owners[0] && owners[0].customs_code);
    this.props.openNormalDeclModal({ ownerCusCode });
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/decl/normal/${row.normal_decl_no}`;
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
    const { listFilter, owners, delglist } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = delglist;
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('normalSearchPlaceholder')} onSearch={this.handleSearch} />
      <Select
        value={listFilter.status}
        onChange={this.handleStatusChange}
      >
        <Option value="all">全部状态</Option>
        <Option value="manifesting">委托制单</Option>
        <Option value="sent">已申报</Option>
        <Option value="cleared">已清关</Option>
      </Select>
      <Select
        showSearch
        optionFilterProp="children"
        value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange}
        defaultValue="all"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (
          <Option key={data.customs_code} value={data.customs_code} search={`${data.partner_code}${data.name}`}>{data.name}</Option>))}
      </Select>
    </span>);
    return (
      <Layout>
        <PageHeader title={this.msg('ftzNormalDecl')}>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateNormalDecl}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns}
            rowSelection={rowSelection}
            dataSource={this.dataSource}
            rowKey="id"
            toolbarActions={toolbarActions}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            loading={this.props.loading}
          />
        </Content>
        <NormalDeclModal reload={this.handleNewNormalDelgLoad} />
      </Layout>
    );
  }
}
