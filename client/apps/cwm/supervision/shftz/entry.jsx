import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Layout, Radio, Menu, Select, Table, Tag } from 'antd';
import NavLink from 'client/components/nav-link';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SupervisionSHFTZList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
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
    title: 'ANS编号',
    dataIndex: 'asn_no',
    width: 120,
    fixed: 'left',
  }, {
    title: '报关单号',
    width: 120,
    dataIndex: 'customs_decl_no',
  }, {
    title: '经营单位',
    width: 200,
    dataIndex: 'owner_code',
  }, {
    title: '收货单位',
    width: 200,
    dataIndex: 'whse_code',
  }, {
    title: '入库备案号',
    width: 120,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '备案类型',
    dataIndex: 'ftz_ent_type',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">一二线进境</Tag>);
      } else if (o === 0) {
        return (<Tag>视同出口</Tag>);
      }
    },
  }, {
    title: '进口日期',
    width: 120,
    dataIndex: 'ie_date',
  }, {
    title: '进库日期',
    width: 120,
    dataIndex: 'ftz_ent_date',
  }, {
    title: '备案时间',
    width: 120,
    dataIndex: 'received_date',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    fixed: 'right',
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="未备案" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已发送" />);
      } else if (o === 2) {
        return (<Badge status="success" text="已备案" />);
      }
    },
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater label="发送" row={record} /></span>);
      } else if (record.status === 1) {
        return (<span><RowUpdater label="获取状态" row={record} /></span>);
      }
    },
  }]

  dataSource = [{
    id: '1',
    asn_no: 'N04601170548',
    bonded: 1,
    whse_code: '0961|希雅路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7IR2730',
    status: 0,
  }, {
    id: '2',
    asn_no: 'N04601170547',
    bonded: 0,
    whse_code: '0086|物流大道仓库',
    owner_code: '03701|西门子国际贸易',
    ref_order_no: 'NUE0394488',
    status: 1,
  }, {
    id: '3',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 1,
    reg_status: 0,
  }, {
    id: '4',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 2,
    reg_status: 1,
  }, {
    id: '5',
    asn_no: 'N04601170546',
    bonded: 1,
    whse_code: '0962|富特路仓库',
    owner_code: '04601|米思米(中国)精密机械贸易',
    ref_order_no: '7FJ1787',
    status: 3,
    reg_status: 2,
  }];

  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/ftz/receive/reg');
  }
  handleFTZReg = (row) => {
    const link = `/cwm/ftz/receive/reg/${row.asn_no}`;
    this.context.router.push(link);
  }
  render() {
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
                {this.msg('ftzEntry')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup defaultValue="pending" onChange={this.handleBondedChange} size="large">
              <RadioButton value="pending">未备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">已备案</RadioButton>
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
                <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1500 }} />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
