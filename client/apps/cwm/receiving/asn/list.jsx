import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Button, Breadcrumb, Layout, Radio, Select, Tag, notification } from 'antd';
import Table from 'client/components/remoteAntTable';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from '../message.i18n';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadAsnLists, releaseAsn, cancelAsn } from 'common/reducers/cwmReceive';

const { Header, Content } = Layout;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
function fetchData({ state, dispatch }) {
  dispatch(loadAsnLists({
    whseCode: state.cwmContext.defaultWhse.code,
    pageSize: state.cwmReceive.asn.pageSize,
    current: state.cwmReceive.asn.current,
    filters: state.cwmReceive.asnFilters,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    filters: state.cwmReceive.asnFilters,
    asn: state.cwmReceive.asn,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
  }),
  { switchDefaultWhse, loadAsnLists, releaseAsn, cancelAsn }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ReceivingASNList extends React.Component {
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
  msg = formatMsg(this.props.intl)
  columns = [{
    title: 'ANS编号',
    dataIndex: 'asn_no',
    width: 180,
    fixed: 'left',
  }, {
    title: '货主',
    width: 240,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '采购订单号',
    width: 150,
    dataIndex: 'po_no',
  }, {
    title: '供应商',
    width: 240,
    dataIndex: 'seller_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: '预期到货时间',
    dataIndex: 'expect_receive_date',
    width: 150,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '实际收货时间',
    dataIndex: 'received_date',
    width: 150,
    render: recdate => recdate && moment(recdate).format('YYYY.MM.DD'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 150,
    render: createdate => createdate && moment(createdate).format('YYYY.MM.DD'),
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    fixed: 'right',
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="通知接收" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="入库操作" />);
      } else if (o === 2) {
        return (<Badge status="warning" text="部分收货" />);
      } else if (o === 3) {
        return (<Badge status="success" text="收货完成" />);
      }
    },
  }, {
    title: '货物属性',
    dataIndex: 'bonded',
    width: 100,
    fixed: 'right',
    render: (o) => {
      if (o === 1) {
        return (<Tag color="blue">保税</Tag>);
      } else if (o === 0) {
        return (<Tag>非保税</Tag>);
      }
    },
  }, {
    title: '备案状态',
    dataIndex: 'reg_status',
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
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (record.status === 0) {
        return (<span><RowUpdater onHit={this.handleReleaseASN} label="释放" row={record} />
          <span className="ant-divider" /><RowUpdater onHit={this.handleEditASN} label="修改" row={record} />
          <span className="ant-divider" /><RowUpdater onHit={this.handleCancelASN} label="取消" row={record} /></span>);
      } else if (record.status === 1) {
        if (record.bonded === 1 && record.reg_status === 0) {
          return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /><span className="ant-divider" /><RowUpdater onHit={this.handleEntryReg} label="进库备案" row={record} /></span>);
        } else {
          return (<span><RowUpdater onHit={this.handleReceive} label="入库操作" row={record} /></span>);
        }
      }
    },
  }]

  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleCreateASN = () => {
    this.context.router.push('/cwm/receiving/asn/create');
  }
  handleEditASN = (row) => {
    const link = `/cwm/receiving/asn/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleCancelASN = (row) => {
    this.props.cancelAsn(row.asn_no);
    this.handleListReload();
  }
  handleListReload = () => {
    const filters = this.props.filters;
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asn.pageSize,
      current: this.props.asn.current,
      filters,
    });
  }
  handleReleaseASN = (row) => {
    const { loginId } = this.props;
    this.props.releaseAsn(row.asn_no, loginId).then(
      (result) => {
        if (!result.error) {
          notification.success({
            message: '操作成功',
            description: `${row.asn_no} 已释放`,
          });
          this.handleListReload();
        }
      }
    );
  }
  handleReceive = (row) => {
    const link = `/cwm/receiving/inbound/receive/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleEntryReg = (row) => {
    const link = `/cwm/supervision/shftz/entry/${row.asn_no}`;
    this.context.router.push(link);
  }
  handleSelect = (value) => {
    this.props.switchDefaultWhse(value);
    const filters = this.props.filters;
    this.props.loadAsnLists({
      whseCode: value,
      pageSize: this.props.asn.pageSize,
      current: this.props.asn.current,
      filters,
    });
  }
  handleStatusChange = (e) => {
    const filters = { ...this.props.filters, status: e.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asn.pageSize,
      current: this.props.asn.current,
      filters,
    });
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      pageSize: this.props.asn.pageSize,
      current: this.props.asn.current,
      filters,
    });
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
      fetcher: params => this.props.loadAsnLists(params),
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
      remotes: this.props.asn,
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
              {this.msg('receivingASN')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup defaultValue="pending" onChange={this.handleStatusChange} size="large">
            <RadioButton value="pending">通知接收</RadioButton>
            <RadioButton value="inbound">入库操作</RadioButton>
            <RadioButton value="partial">部分收货</RadioButton>
            <RadioButton value="completed">收货完成</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateASN}>
              {this.msg('createASN')}
            </Button>
          </div>
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
              <Table columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id" scroll={{ x: this.columns.reduce((acc, cur) => acc + cur.width, 0) }} />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
