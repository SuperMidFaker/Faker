import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Button, Layout, Radio, Select, Tag, message, Popconfirm } from 'antd';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import { openBatchDeclModal, loadBatchApplyList, batchDelgCancel } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import ModuleMenu from '../../menu';
import BatchDeclModal from './modal/batchDeclModal';
import PageHeader from 'client/components/PageHeader';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    batchlist: state.cwmShFtz.batchApplyList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners.filter(owner => owner.portion_enabled),
    loading: state.cwmShFtz.loading,
    userMembers: state.account.userMembers,
  }),
  { openBatchDeclModal, switchDefaultWhse, loadBatchApplyList, batchDelgCancel }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class BatchDeclList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    if (['manifesting', 'pending', 'sent', 'applied', 'cleared', 'all'].filter(stkey => stkey === status).length === 0) {
      status = 'manifesting';
    }
    let ownerView = listFilter.ownerView;
    if (ownerView !== 'all' && this.props.owners.filter(owner => listFilter.ownerView === owner.customs_code).length === 0) {
      ownerView = 'all';
    }
    const filter = { ...listFilter, status, ownerView };
    this.handleBatchApplyLoad(1, null, filter);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '集中报关编号',
    dataIndex: 'batch_decl_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '分拨出库单数量',
    dataIndex: 'portion_rel_count',
    width: 120,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (st) => {
      switch (st) {
        case 'manifest':
          return (<Badge status="default" text="委托制单" />);
        case 'generated':
          return (<Badge status="default" text="待报关申请" />);
        case 'processing':
          return (<Badge status="processing" text="已发送申请" />);
        case 'applied':
          return (<Badge status="processing" text="申请完成" />);
        case 'cleared':
          return (<Badge status="success" text="已清关" />);
        default:
          break;
      }
    },
  }, {
    title: '报关申请单号',
    dataIndex: 'ftz_apply_no',
    width: 200,
    render: o => <span className="text-emphasis">{o}</span>,
  }, {
    title: '报关单号',
    dataIndex: 'cus_decl_no',
    width: 180,
    render: o => <span className="text-emphasis">{o}</span>,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '报关代理',
    dataIndex: 'broker_name',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '报关委托编号',
    width: 120,
    dataIndex: 'delg_no',
  }, {
    title: '申请类型',
    dataIndex: 'apply_type',
    width: 120,
    render: (o) => {
      switch (o) {
        case '0':
          return <Tag>普通报关申请单</Tag>;
        case '1':
          return <Tag>跨关区报关申请单</Tag>;
        case '2':
          return <Tag>保展报关申请单</Tag>;
        default:
          break;
      }
    },
  }, {
    title: '供货商',
    dataIndex: 'supplier',
    width: 100,
  }, {
    title: '成交方式',
    dataIndex: 'trxn_mode',
    width: 80,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 80,
  }, {
    title: '申请日期',
    width: 120,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '申报日期',
    width: 120,
    dataIndex: 'decl_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '放行日期',
    width: 120,
    dataIndex: 'clear_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
    render: o => this.props.userMembers.find(member => member.login_id === o) && this.props.userMembers.find(member => member.login_id === o).name,
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_time',
    render: (o, record) => {
      if (record.created_date) {
        return `${moment(record.created_date).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 160,
    fixed: 'right',
    render: (o, record) => (<span>
      <RowAction onClick={this.handleDetail} label="报关详情" row={record} />
      {record.status === 'manifest' && <span className="ant-divider" />}
      {record.status === 'manifest' &&
      <Popconfirm title="确认取消委托?" onConfirm={() => this.handleDelgCancel(record)}>
        <a>取消委托</a>
      </Popconfirm>}</span>),
  }]

  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadBatchApplyList(params),
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
    remotes: this.props.batchlist,
  })
  handleBatchApplyLoad = (currentPage, whsecode, filter) => {
    const { listFilter, whse, batchlist: { pageSize, current } } = this.props;
    this.props.loadBatchApplyList({
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
  handleBatchDeclLoad = () => {
    this.handleBatchApplyLoad(1, null, { ...this.props.listFilter, status: 'manifesting' });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleBatchApplyLoad(1, this.props.whse.code, filter);
  }
  handleCreateBatchDecl = () => {
    const { listFilter, owners } = this.props;
    const ownerCusCode = listFilter.ownerView !== 'all' ? listFilter.ownerView : (owners[0] && owners[0].customs_code);
    this.props.openBatchDeclModal({ ownerCusCode });
  }
  handleDelgCancel = (row) => {
    this.props.batchDelgCancel(row).then((result) => {
      if (!result.error) {
        this.handleBatchApplyLoad();
      }
    });
  }
  handleDelgManifest = (row) => {
    const ietype = row.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${ietype}/manifest/`;
    this.context.router.push(`${link}${row.delg_no}`);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/decl/batch/${row.batch_decl_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleBatchApplyLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleBatchApplyLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleBatchApplyLoad(1, this.props.whse.code, filters);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { listFilter, owners, batchlist } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = batchlist;
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('batchSearchPlaceholder')} onInputSearch={this.handleSearch} value={listFilter.filterNo} />
      <span />
      <Select showSearch optionFilterProp="children" style={{ width: 160 }} value={listFilter.ownerView}
        onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all">全部货主</Option>
        {owners.map(data => (<Option key={data.customs_code} value={data.customs_code}
          search={`${data.partner_code}${data.name}`}
        >{data.name}
        </Option>)
          )}
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
            <ModuleMenu currentKey="batchDecl" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('ftzBatchDecl')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Nav>
              <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} >
                <RadioButton value="all">全部</RadioButton>
                <RadioButton value="manifesting">委托制单</RadioButton>
                <RadioButton value="applying">报关申请</RadioButton>
                <RadioButton value="cleared">已清关</RadioButton>
              </RadioGroup>
            </PageHeader.Nav>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateBatchDecl}>
                {this.msg('create')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id"
              toolbarActions={toolbarActions} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
              loading={this.props.loading}
            />
          </Content>
        </Layout>
        <BatchDeclModal reload={this.handleBatchDeclLoad} />
      </Layout>
    );
  }
}
