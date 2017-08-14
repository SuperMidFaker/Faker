import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Menu, Select, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/NavLink';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntryRegDatas } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { CWM_ASN_BONDED_REGTYPES } from 'common/constants';
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
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { loadEntryRegDatas, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZEntryList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    entryList: PropTypes.object.isRequired,
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
    this.handleEntryListLoad();
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'ANS编号',
    dataIndex: 'asn_no',
    width: 180,
    fixed: 'left',
  }, {
    title: '报关单号',
    width: 180,
    dataIndex: 'pre_entry_seq_no',
    render: (preno, row) => row.cus_decl_no || preno,
  }, {
    title: '海关入库单号',
    width: 180,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '备案类型',
    dataIndex: 'ftz_ent_type',
    render: (enttype) => {
      const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === enttype)[0];
      return entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>;
    },
  }, {
    title: '货主',
    width: 180,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '仓储企业',
    width: 180,
    dataIndex: 'wh_ent_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '进口日期',
    width: 120,
    dataIndex: 'ie_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '进库日期',
    width: 120,
    dataIndex: 'ftz_ent_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    fixed: 'right',
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待备案" />);
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
    render: (o, record) => <RowUpdater onHit={this.handleDetail} label="备案明细" row={record} />,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadEntryRegDatas(params),
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
    remotes: this.props.entryList,
  })
  handleEntryListLoad = (currentPage, whsecode, filter) => {
    const { tenantId, whse, listFilter, entryList: { pageSize, current } } = this.props;
    this.props.loadEntryRegDatas({
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
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleTypeChange = (ev) => {
    if (ev.target.value === this.props.listFilter.type) {
      return;
    }
    const filter = { ...this.props.listFilter, type: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleEntryListLoad(1, value);
  }
  handleSearch = (searchVal) => {
    const filters = { ...this.props.listFilter, filterNo: searchVal };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  handleOwnerSelectChange = (value) => {
    const filters = { ...this.props.listFilter, ownerView: value };
    this.handleEntryListLoad(1, this.props.whse.code, filters);
  }
  render() {
    const { entryList, listFilter, whses, whse, owners } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded === 1);
    this.dataSource.remotes = entryList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
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
              defaultSelectedKeys={['entry']}
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
                {this.msg('ftzEntryReg')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="all">全部状态</RadioButton>
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">备案完成</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup value={listFilter.type} onChange={this.handleTypeChange} size="large">
              <RadioButton value="all">全部类型</RadioButton>
              <RadioButton value="bonded">{CWM_ASN_BONDED_REGTYPES[0].ftztext}</RadioButton>
              <RadioButton value="export" disabled>{CWM_ASN_BONDED_REGTYPES[1].ftztext}</RadioButton>
              <RadioButton value="transfer">{CWM_ASN_BONDED_REGTYPES[2].ftztext}</RadioButton>
            </RadioGroup>
            <div className="page-header-tools" />
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder={this.msg('entrySearchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={listFilter.filterNo} />
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
                <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} indentSize={8} rowKey="id" defaultExpandedRowKeys={['1']}
                  scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
