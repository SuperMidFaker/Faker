import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Menu, Select, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadEntryRegDatas } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
  }),
  { loadEntryRegDatas }
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
    width: 150,
    dataIndex: 'cus_decl_no',
  }, {
    title: '备案类型',
    dataIndex: 'ftz_ent_type',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">一二线进境</Tag>);
      } else if (o === 2) {
        return (<Tag color="green">视同出口</Tag>);
      } else if (o === 3) {
        return (<Tag color="yellow">区内转入</Tag>);
      }
    },
  }, {
    title: '货主',
    width: 220,
    dataIndex: 'owner_code',
  }, {
    title: '仓储企业',
    width: 220,
    dataIndex: 'whse_code',
  }, {
    title: '入库备案号',
    width: 120,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '进口日期',
    width: 120,
    dataIndex: 'ie_date',
    render: (o, record) => {
      if (o) {
        return `${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '进库日期',
    width: 120,
    dataIndex: 'ftz_ent_date',
    render: (o, record) => {
      if (o) {
        return `${moment(record.last_act_time).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    fixed: 'right',
    render: (o) => {
      if (o === 0) {
        return (<Badge status="pending" text="待备案" />);
      } else if (o === 1) {
        return (<Badge status="send" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="completed" text="备案完成" />);
      }
    },
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleDetail} label="发送" row={record} /></span>);
      } else if (record.status === 1) {
        return (<span><RowUpdater label="获取状态" row={record} /></span>);
      } else if (record.status === 2) {
        return (<span><RowUpdater onHit={this.handleDetail} label="查看" row={record} /></span>);
      }
    },
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
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.entryList,
  })
  // dataSource = [{
  //   id: '1',
  //   asn_no: 'ASN04601170548',
  //   bonded: 1,
  //   whse_code: '3122406170|上海恩诺物流有限公司',
  //   owner_code: '3114941293|大陆泰密克汽车系统',
  //   customs_decl_no: '221820171000538906',
  //   status: 0,
  //   ftz_ent_type: 1,
  //   children: [{
  //     id: '2',
  //     asn_no: 'ASN04601170548',
  //     bonded: 0,
  //     whse_code: '3122406170|上海恩诺物流有限公司',
  //     owner_code: '3114941293|大陆泰密克汽车系统',
  //     customs_decl_no: '221820171000538907',
  //     status: 0,
  //     ftz_ent_type: 1,
  //   }, {
  //     id: '3',
  //     asn_no: 'ASN04601170548',
  //     bonded: 1,
  //     whse_code: '3122406170|上海恩诺物流有限公司',
  //     owner_code: '3114941293|大陆泰密克汽车系统',
  //     customs_decl_no: '221820171000538908',
  //     status: 0,
  //     ftz_ent_type: 1,
  //   },
  //   ],
  // }, {
  //   id: '4',
  //   asn_no: 'ASN04601170555',
  //   bonded: 1,
  //   whse_code: '3122406170|上海恩诺物流有限公司',
  //   owner_code: '3221304601|米思米(中国)精密机械',
  //   customs_decl_no: '',
  //   status: 2,
  //   ftz_ent_type: 2,
  // }, {
  //   id: '5',
  //   asn_no: 'ASN04601170537',
  //   bonded: 1,
  //   whse_code: '3122406170|上海恩诺物流有限公司',
  //   owner_code: '3221304601|米思米(中国)精密机械',
  //   customs_decl_no: '',
  //   status: 1,
  //   ftz_ent_type: 3,
  // }];
  handleEntryListLoad = (currentPage, filter) => {
    const { tenantId, listFilter, entryList: { pageSize, current } } = this.props;
    this.props.loadEntryRegDatas({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      currentPage: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
  }
  render() {
    this.dataSource.remotes = this.props.entryList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="left-sider-panel">
            <div className="top-bar">
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
                <Menu.Item key="entry">
                  <NavLink to="/cwm/supervision/shftz/entry">
                    进库备案
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="release">
                  <NavLink to="/cwm/supervision/shftz/release">
                    出库备案
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="batch">
                  <NavLink to="/cwm/supervision/shftz/batch">
                    集中报关申请
                  </NavLink>
                </Menu.Item>
                <Menu.Item key="cargo">
                  <NavLink to="/cwm/supervision/shftz/cargo">
                    货物备案
                  </NavLink>
                </Menu.Item>
              </Menu>
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select
                  size="large"
                  defaultValue="0961"
                  placeholder="选择仓库"
                  style={{ width: 160 }}
                  disabled
                >
                  <Option value="0960">物流大道仓库</Option>
                  <Option value="0961">希雅路仓库</Option>
                  <Option value="0962">富特路仓库</Option>
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('ftzEntryReg')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup defaultValue="pending" onChange={this.handleBondedChange} size="large">
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">备案完成</RadioButton>
            </RadioGroup>
            <div className="top-bar-tools" />
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
                <span />
                <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                  onChange={this.handleClientSelectChange} defaultValue="all"
                >
                  <Option value="all">全部货主</Option>
                </Select>
                <div className="toolbar-right" />
                <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                  <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                </div>
              </div>
              <div className="panel-body table-panel">
                <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} indentSize={8} rowKey="id" defaultExpandedRowKeys={['1']} scroll={{ x: 1500 }} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}