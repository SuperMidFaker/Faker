import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Breadcrumb, Layout, Radio, Select, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { Fontello } from 'client/components/FontIcon';
import { loadOutbounds } from 'common/reducers/cwmOutbound';
import { format } from 'client/common/i18n/helpers';
import ShippingDockPanel from '../dock/shippingDockPanel';
import messages from '../message.i18n';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
function fetchData({ state, dispatch }) {
  dispatch(loadOutbounds({
    whseCode: state.cwmContext.defaultWhse.code,
    tenantId: state.account.tenantId,
    pageSize: state.cwmOutbound.outbound.pageSize,
    current: state.cwmOutbound.outbound.current,
    filters: state.cwmOutbound.outboundFilters,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmOutbound.outboundFilters,
    outbound: state.cwmOutbound.outbound,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { switchDefaultWhse, showDock, loadOutbounds }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class OutboundList extends React.Component {
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      nextProps.loadOutbounds({
        whseCode: nextProps.defaultWhse.code,
        tenantId: nextProps.tenantId,
        pageSize: nextProps.outbound.pageSize,
        current: nextProps.outbound.current,
        filters: nextProps.filters,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 120,
    render: o => (
      <a onClick={() => this.handlePreview()}>
        {o}
      </a>),
  }, {
    title: '波次号',
    width: 120,
    dataIndex: 'ref_order_no',
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
    title: '分配',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 1) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= 2 && record.status <= 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '拣货',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 3) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= 4 && record.status <= 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '装箱',
    dataIndex: 'chk_pck_status',
    className: 'cell-align-center',
    render: (o) => {
      switch (o) {
        case 0:
          return <Fontello type="circle" color="gray" />;
        case 1:
          return <Fontello type="circle" color="blue" />;
        case 2:
          return <Fontello type="circle" color="green" />;
        default:
          return <span />;
      }
    },
  }, {
    title: '发运',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === 5) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status === 6) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '操作模式',
    dataIndex: 'receiving_mode',
    width: 150,
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码发货"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工发货"><Icon type="solution" /></Tooltip>);
      } else {
        return <span />;
      }
    },
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
    render: completeddate => completeddate && moment(completeddate).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      } else if (record.status === 0 && record.receiving_mode === 2) {
        return (<span><RowUpdater label="撤回" row={record} /></span>);
      } else {
        return (<span><RowUpdater onHit={this.handleReceive} label="出库操作" row={record} /> </span>);
      }
    },
  }]
  handlePreview = () => {
    this.props.showDock();
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    this.props.loadOutbounds({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  handleReceive = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  render() {
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadOutbounds(params),
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
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.outbound,
    });
    const { defaultWhse, whses } = this.props;
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
              {this.msg('shippingOutbound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="created" onChange={this.handleStatusChange} size="large">
            <RadioButton value="created">待出库</RadioButton>
            <RadioButton value="allocating">分配</RadioButton>
            <RadioButton value="picking">拣货</RadioButton>
            <RadioButton value="shipping">发货</RadioButton>
            <RadioButton value="completed">已出库</RadioButton>
          </RadioGroup>
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
              <Table columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
        </Content>
        <ShippingDockPanel />
      </QueueAnim>
    );
  }
}
