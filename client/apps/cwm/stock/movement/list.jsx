import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Breadcrumb, Layout, Select, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import connectNav from 'client/common/decorators/connect-nav';
import { Fontello } from 'client/components/FontIcon';
import { loadOutbounds } from 'common/reducers/cwmOutbound';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { showDock } from 'common/reducers/cwmShippingOrder';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

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
    loading: state.cwmOutbound.outbound.loading,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { switchDefaultWhse, showDock, loadOutbounds }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class MovementList extends React.Component {
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
      const filters = { ...this.props.filters };
      const whseCode = nextProps.defaultWhse.code;
      this.props.loadOutbounds({
        whseCode,
        tenantId: this.props.tenantId,
        pageSize: this.props.outbound.pageSize,
        current: this.props.outbound.current,
        filters,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '移库单号',
    dataIndex: 'movement_no',
    width: 180,
    render: (o, record) => (
      <a onClick={() => this.handlePreview(o, record.outbound_no)}>
        {o}
      </a>),
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'total_qty',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    width: 200,
    dataIndex: 'owner_name',
  }, {
    title: '类型',
    className: 'cell-align-center',

  }, {
    title: '状态',
    className: 'cell-align-center',
    render: (o, record) => {
      if (record.status === CWM_OUTBOUND_STATUS.PARTIAL_PICKED.value) {
        return <Fontello type="circle" color="blue" />;
      } else if (record.status >= CWM_OUTBOUND_STATUS.ALL_PICKED.value && record.status <= CWM_OUTBOUND_STATUS.COMPLETED.value) {
        return <Fontello type="circle" color="green" />;
      } else {
        return <Fontello type="circle" color="gray" />;
      }
    },
  }, {
    title: '操作模式',
    dataIndex: 'shipping_mode',
    width: 80,
    className: 'cell-align-center',
    render: (o) => {
      if (o === 'scan') {
        return (<Tooltip title="扫码移库"><Icon type="scan" /></Tooltip>);
      } else if (o === 'manual') {
        return (<Tooltip title="人工移库"><Icon type="solution" /></Tooltip>);
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
    title: '移库时间',
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
  handlePreview = (soNo, outboundNo) => {
    this.props.showDock(soNo, outboundNo);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
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
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadOutbounds({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.outbound.pageSize,
      current: this.props.outbound.current,
      filters,
    });
  }
  render() {
    const { defaultWhse, whses, owners, loading } = this.props;
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
              {this.msg('movement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateMovement}>
              {this.msg('createMovement')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} />
              <span />
              <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
                onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
              >
                <Option value="all" key="all">全部货主</Option>
                {
                  owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))
                }
              </Select>
              <div className="toolbar-right" />
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3>
              </div>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={dataSource} rowSelection={rowSelection} rowKey="id" scroll={{ x: 1300 }} loading={loading} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
