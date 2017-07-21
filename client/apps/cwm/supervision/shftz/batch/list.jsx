import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Breadcrumb, Button, Layout, Radio, Menu, Select, Tag, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { openBatchDeclModal } from 'common/reducers/cwmShFtz';
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
    entryList: state.cwmShFtz.entryList,
    listFilter: state.cwmShFtz.listFilter,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { openBatchDeclModal, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZBatchDeclList extends React.Component {
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
  msg = key => formatMsg(this.props.intl, key);
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
    dataIndex: 'seller_name',
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
    dataIndex: 'expect_receive_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '放行日期',
    width: 120,
    dataIndex: 'received_date',
    render: (o) => {
      if (o) {
        return `${moment(o).format('YYYY.MM.DD')}`;
      }
    },
  }, {
    title: '状态',
    dataIndex: 'reg_status',
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
    render: (o, record) => <RowUpdater onHit={this.handleDetail} label="报关申请明细" row={record} />,
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
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    this.handleEntryListLoad(1, this.props.whse.code, filter);
  }
  handleCreateBatchDecl = () => {
    this.props.openBatchDeclModal();
  }
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/batch/${row.batch_decl_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    // this.handleEntryListLoad(1, value);
  }

  render() {
    const { listFilter, whses, whse, owners } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded === 1);
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
                defaultSelectedKeys={['batch']}
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
                    集中报关
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
                <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                  {bondedWhses.map(wh => <Option value={wh.code} key={wh.code}>{wh.name}</Option>)}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('ftzBatchDecl')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup value={listFilter.status} onChange={this.handleStatusChange} size="large">
              <RadioButton value="pending">待申请</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="applied">申请完成</RadioButton>
              <RadioButton value="cleared">报关放行</RadioButton>
            </RadioGroup>
            <div className="top-bar-tools">
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBatchDecl}>
                {this.msg('createBatchDecl')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar placeholder={this.msg('batchSearchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
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
              <div className="panel-body table-panel">
                <Table columns={this.columns} rowSelection={rowSelection} dataSource={this.dataSource} rowKey="id"
                  scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
                />
              </div>
            </div>
          </Content>
        </Layout>
        <BatchDeclModal />
      </Layout>
    );
  }
}
