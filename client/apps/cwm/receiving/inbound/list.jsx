import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Icon, Breadcrumb, Layout, Radio, Select, Tooltip } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadInbounds } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
function fetchData({ state, dispatch }) {
  dispatch(loadInbounds({
    tenantId: state.account.tenantId,
    pageSize: state.cwmReceive.inbound.pageSize,
    current: state.cwmReceive.inbound.current,
    filters: state.cwmReceive.inboundFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmReceive.inboundFilters,
    inbound: state.cwmReceive.inbound,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { loadInbounds }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingInboundList extends React.Component {
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
    title: '入库流水号',
    width: 150,
    dataIndex: 'inbound_no',
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="创建" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="收货" />);
      } else if (o === 2) {
        return (<Badge status="processing" text="上架" />);
      } else if (o === 3) {
        return (<Badge status="success" text="入库完成" />);
      }
    },
  }, {
    title: '执行者',
    dataIndex: 'executor',
  }, {
    title: '操作模式',
    dataIndex: 'receiving_mode',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码收货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工收货"><Icon type="solution" /></Tooltip>);
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      } else if (record.status === 0 && record.receiving_lock === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /> </span>);
      }
    },
  }]
  handleInboundsReload = () => {
    const filters = this.props.filters;
    this.props.loadInbounds({
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleStatusChange = (e) => {
    const filters = { ...this.props.filters, status: e.target.value };
    this.props.loadInbounds({
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/receive/${row.rn_no}`;
    this.context.router.push(link);
  }
  render() {
    const { whses, defaultWhse, owners } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadInbounds(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        current: resolve(result.totalCount, result.current, result.pageSize),
        pageSize: result.pageSize,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.inbound,
    });
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleSelect}>
                {
                  whses.map(warehouse => (<Option value={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="receiving" onChange={this.handleStatusChange} size="large" >
            <RadioButton value="receiving">收货</RadioButton>
            <RadioButton value="puttingaway">上架</RadioButton>
            <RadioButton value="completed">入库完成</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleOwnerChange} defaultValue="all"
              >
                <Option value="all">全部货主</Option>
                {
                  owners.map(owner => (<Option value={owner.id}>{owner.name}</Option>))
                }
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id" scroll={{ x: 1400 }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}