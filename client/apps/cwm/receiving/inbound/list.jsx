import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Badge, Icon, Breadcrumb, Layout, Radio, Select, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import ReceivingDockPanel from '../dock/receivingDockPanel';
import { showDock, loadInbounds } from 'common/reducers/cwmReceive';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import Strip from 'client/components/Strip';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
function fetchData({ state, dispatch }) {
  dispatch(loadInbounds({
    whseCode: state.cwmContext.defaultWhse.code,
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
  { showDock, loadInbounds, switchDefaultWhse }
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
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      nextProps.loadInbounds({
        whseCode: nextProps.defaultWhse.code,
        tenantId: nextProps.tenantId,
        pageSize: nextProps.inbound.pageSize,
        current: nextProps.inbound.current,
        filters: nextProps.filters,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '入库流水号',
    dataIndex: 'inbound_no',
    width: 180,
    fixed: 'left',
  }, {
    title: 'ANS编号',
    width: 180,
    dataIndex: 'asn_no',
    render: o => (<a onClick={() => this.handlePreview()}>{o}</a>),
  }, {
    title: <Tooltip title="明细记录数"><Icon type="bars" /></Tooltip>,
    dataIndex: 'detail_count',
    width: 50,
    render: dc => !isNaN(dc) ? dc : null,
  }, {
    title: '货主',
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 150,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="待入库" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="收货" />);
      } else if (o === 3) {
        return (<Badge status="processing" text="上架" />);
      } else if (o === 5) {
        return (<Badge status="success" text="入库完成" />);
      }
    },
  }, {
    title: '收货数量',
    width: 250,
    className: 'progress-bar',
    render: (o, record) => {
      const processing = record.total_received_qty - record.total_putaway_qty;
      const warning = record.total_expect_qty - record.total_received_qty;
      return (<Strip overall={record.total_expect_qty} parts={{ success: record.total_putaway_qty, processing, warning }} hints={['已上架', '未上架', '未收货']} />);
    },
  }, {
    title: '操作模式',
    dataIndex: 'rec_mode',
    width: 100,
    className: 'cell-align-center',
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
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '完成时间',
    dataIndex: 'completed_date',
    width: 120,
    render: completedDate => completedDate && moment(completedDate).format('MM.DD HH:mm'),
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
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleStatusChange = (e) => {
    const filters = { ...this.props.filters, status: e.target.value };
    this.props.loadInbounds({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handlePreview = () => {
    this.props.showDock();
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/${row.inbound_no}`;
    this.context.router.push(link);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadInbounds({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    this.props.loadInbounds({
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.inbound.pageSize,
      current: this.props.inbound.current,
      filters,
    });
  }
  render() {
    const { whses, defaultWhse, owners, filters } = this.props;
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
      remotes: this.props.inbound,
    });
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
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup value={filters.status} onChange={this.handleStatusChange} size="large" >
            <RadioButton value="create">待入库</RadioButton>
            <RadioButton value="receive">收货</RadioButton>
            <RadioButton value="putaway">上架</RadioButton>
            <RadioButton value="completed">已入库</RadioButton>
          </RadioGroup>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('inboundPlaceholder')} size="large" onInputSearch={this.handleSearch} value={filters.name} />
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
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id"
                scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
              />
            </div>
          </div>
        </Content>
        <ReceivingDockPanel />
      </QueueAnim>
    );
  }
}
