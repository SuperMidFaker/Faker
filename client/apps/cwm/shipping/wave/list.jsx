import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Layout, Radio, Select, Badge } from 'antd';
import Table from 'client/components/remoteAntTable';
import RowUpdater from 'client/components/rowUpdater';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import ShippingDockPanel from '../dock/shippingDockPanel';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadSos, showDock, releaseSo } from 'common/reducers/cwmShippingOrder';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
function fetchData({ state, dispatch }) {
  dispatch(loadSos({
    whseCode: state.cwmContext.defaultWhse.code,
    pageSize: state.cwmShippingOrder.solist.pageSize,
    current: state.cwmShippingOrder.solist.current,
    filters: state.cwmShippingOrder.soFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.soFilters,
    solist: state.cwmShippingOrder.solist,
  }),
  { loadSos, switchDefaultWhse, showDock, releaseSo }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class WaveList extends React.Component {
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
    title: '波次编号',
    width: 120,
    dataIndex: 'wave_no',
    render: o => (
      <a onClick={() => this.handlePreview()}>
        {o}
      </a>),
  }, {
    title: '波次状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="计划" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="出库中" />);
      } else if (o === 3) {
        return (<Badge status="success" text="完成" />);
      }
    },
  }, {
    title: '描述',
    width: 200,
    dataIndex: 'wave_desc',
  }, {
    title: '订单数量',
    dataIndex: 'order_count',
  }, {
    title: '收货人',
    dataIndex: 'receiver',
  }, {
    title: '承运人',
    dataIndex: 'carrier',
  }, {
    title: '波次规则',
    dataIndex: 'wave_rule',
  }, {
    title: '创建时间',
    width: 120,
    dataIndex: 'created_date',
  }, {
    title: '操作',
    width: 120,
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater label="释放" row={record} onHit={this.handleReleaseWave} /><span className="ant-divider" /><RowUpdater onHit={this.handleEditWave} label="修改" row={record} /><span className="ant-divider" /><RowUpdater label="取消" row={record} /></span>);
      } else if (record.status === 1) {
        if (record.bonded === 1 && record.reg_status === 0) {
          return (<span><RowUpdater onHit={this.handleAllocate} label="出库操作" row={record} /><span className="ant-divider" /><RowUpdater onHit={this.handleEntryReg} label="出库备案" row={record} /></span>);
        } else {
          return (<span><RowUpdater onHit={this.handleAllocate} label="出库操作" row={record} /></span>);
        }
      }
    },
  }]
  handlePreview = () => {
    this.props.showDock();
  }
  handleReleaseWave = (record) => {
    const { loginId } = this.props;
    this.props.releaseSo(record.so_no, loginId).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleReload = () => {
    this.props.loadSos({
      whseCode: this.props.defaultWhse.code,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters: this.props.filters,
    });
  }
  handleEditWave = (row) => {
    const link = `/cwm/shipping/wave/${row.so_no}`;
    this.context.router.push(link);
  }
  handleAllocate = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadSos({
      whseCode,
      pageSize: this.props.solist.pageSize,
      current: this.props.solist.current,
      filters,
    });
  }
  render() {
    const { whses, defaultWhse, filters } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadSos(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          whseCode: this.props.defaultWhse.code,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.solist,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingWave')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large">
            <RadioButton value="pending">计划</RadioButton>
            <RadioButton value="outbound">出库中</RadioButton>
            <RadioButton value="completed">完成</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools" />
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
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
        <ShippingDockPanel />
      </QueueAnim>
    );
  }
}
