import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Button, Layout, Radio, Menu, Select, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { openBatchDeclModal, loadBatchApplyList } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import BatchDeclModal from './modal/batchDeclModal';
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
    batchlist: state.cwmShFtz.batchApplyList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners.filter(owner => owner.portion_enabled),
  }),
  { openBatchDeclModal, switchDefaultWhse, loadBatchApplyList }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZBatchDeclList extends React.Component {
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
    this.handleBatchApplyLoad();
  }
  msg = key => formatMsg(this.props.intl, key);
  manifColumns = [{
    title: '集中报关编号',
    dataIndex: 'batch_decl_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '委托编号',
    width: 180,
    dataIndex: 'delg_no',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '收货单位',
    dataIndex: 'receiver_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => <RowUpdater onHit={this.handleDelgManifest} label="委托清单" row={record} />,
  }]
  columns = [{
    title: '集中报关编号',
    dataIndex: 'batch_decl_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '报关申请单号',
    dataIndex: 'ftz_apply_no',
    width: 150,
  }, {
    title: '报关单号',
    dataIndex: 'pre_entry_seq_no',
    width: 150,
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '收货单位',
    width: 180,
    dataIndex: 'receiver_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '申请类型',
    dataIndex: 'type',
    render: (o) => {
      switch (o) {
        case 0:
          return <Tag>普通报关申请单</Tag>;
        case 1:
          return <Tag>跨关区报关申请单</Tag>;
        case 2:
          return <Tag>保展报关申请单</Tag>;
        default:
          break;
      }
    },
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
    title: '状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="备案完成" />);
      }
    },
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status < 2) {
        return <RowUpdater onHit={this.handleDetail} label="报关申请明细" row={record} />;
      }
    },
  }]

  dataSource = new Table.DataSource({
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
        tenantId: this.props.tenantId,
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
    const { tenantId, listFilter, whse, batchlist: { pageSize, current } } = this.props;
    this.props.loadBatchApplyList({
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
  handleDelgManifest = (row) => {
    const ietype = row.i_e_type === 0 ? 'import' : 'export';
    const link = `/clearance/${ietype}/manifest/`;
    this.context.router.push(`${link}${row.delg_no}`);
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/batch/${row.batch_decl_no}`;
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

  render() {
    const { listFilter, whses, whse, owners, batchlist } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded);
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let columns = this.columns;
    if (listFilter.status === 'manifesting') {
      columns = this.manifColumns;
    }
    this.dataSource.remotes = batchlist;
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
            <Menu
              defaultSelectedKeys={['batch']}
              mode="inline"
            >
              <Menu.ItemGroup key="g1" title="入库监管">
                <Menu.Item key="entry">
                  <NavLink to="/cwm/supervision/shftz/entry">{this.msg('ftzEntryReg')}</NavLink>
                </Menu.Item>
              </Menu.ItemGroup>
              <Menu.ItemGroup key="g2" title="出库监管">
                <Menu.Item key="release">
                  <NavLink to="/cwm/supervision/shftz/release">{this.msg('ftzReleaseReg')}</NavLink>
                </Menu.Item>
                <Menu.Item key="clearance">
                  <NavLink to="/cwm/supervision/shftz/clearance">{this.msg('ftzClearance')}</NavLink>
                </Menu.Item>
                <Menu.Item key="batch">
                  <NavLink to="/cwm/supervision/shftz/batch">{this.msg('ftzBatchDecl')}</NavLink>
                </Menu.Item>
              </Menu.ItemGroup>
              <Menu.ItemGroup key="g3" title="货物监管">
                <Menu.Item key="cargo">
                  <NavLink to="/cwm/supervision/shftz/cargo">{this.msg('ftzCargoReg')}</NavLink>
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
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
                {this.msg('ftzBatchDecl')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="manifesting">制单中</RadioButton>
              <RadioButton value="pending">待申请</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="applied">申请完成</RadioButton>
              <RadioButton value="cleared">已报关</RadioButton>
            </RadioGroup>
            <div className="page-header-tools">
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBatchDecl}>
                {this.msg('createBatchDecl')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder={this.msg('batchSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={listFilter.filterNo} />
                <span />
                <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                  onChange={this.handleOwnerSelectChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
                >
                  <OptGroup>
                    <Option value="all">全部货主</Option>
                    {owners.map(data => (<Option key={data.customs_code} value={data.customs_code}
                      search={`${data.partner_code}${data.name}`}
                    >{data.name}
                    </Option>)
                    )}
                  </OptGroup>
                </Select>
                <div className="toolbar-right" />
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                </div>
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id"
                  scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
                />
              </div>
            </div>
          </Content>
        </Layout>
        <BatchDeclModal reload={this.handleBatchDeclLoad} />
      </Layout>
    );
  }
}
