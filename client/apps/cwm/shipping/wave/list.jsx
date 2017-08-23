import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio, Select, Badge, message } from 'antd';
import DataTable from 'client/components/DataTable';
import RowUpdater from 'client/components/rowUpdater';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/SearchBar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadWaves, releaseWave, cancelWave } from 'common/reducers/cwmShippingOrder';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loginId: state.account.loginId,
    filters: state.cwmShippingOrder.waveFilters,
    wave: state.cwmShippingOrder.wave,
    loading: state.cwmShippingOrder.wave.loading,
  }),
  { loadWaves, switchDefaultWhse, releaseWave, cancelWave }
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
  componentWillMount() {
    const filters = { ...this.props.filters, ownerCode: 'all' };
    this.handleReload(null, 1, filters);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '波次编号',
    width: 150,
    dataIndex: 'wave_no',
  }, {
    title: '波次状态',
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      if (o === 0) {
        return (<Badge status="default" text="计划" />);
      } else if (o === 1) {
        return (<Badge status="processing" text="已释放" />);
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
    dataIndex: 'total_qty',
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
    render: o => moment(o).format('YYYY.MM.DD'),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    render: (o, record) => {
      if (record.status === 0) {
        return (<span>
          <RowUpdater label="释放" row={record} onHit={this.handleReleaseWave} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleEditWave} label="修改" row={record} />
          <span className="ant-divider" />
          <RowUpdater label="取消" row={record} onHit={this.cancelWave} />
        </span>);
      } else if (record.status === 1) {
        if (record.bonded === 1 && record.reg_status === 0) {
          return (<span>
            <RowUpdater onHit={this.handleAllocate} label="出库操作" row={record} />
            <span className="ant-divider" />
            <RowUpdater onHit={this.handleEntryReg} label="出区备案" row={record} />
          </span>);
        } else {
          return (<RowUpdater onHit={this.handleAllocate} label="出库操作" row={record} />);
        }
      }
    },
  }]
  handleReleaseWave = (record) => {
    const { loginId } = this.props;
    this.props.releaseWave(record.wave_no, loginId).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  cancelWave = (row) => {
    this.props.cancelWave(row.wave_no).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  handleReload = (whseCode, current, filters) => {
    this.props.loadWaves({
      whseCode: whseCode || this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      pageSize: this.props.wave.pageSize,
      current: current || this.props.wave.current,
      filters: filters || this.props.filters,
    });
  }
  handleEditWave = (row) => {
    const link = `/cwm/shipping/wave/${row.wave_no}`;
    this.context.router.push(link);
  }
  handleAllocate = (row) => {
    const link = `/cwm/shipping/outbound/${row.outbound_no}`;
    this.context.router.push(link);
  }
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    this.handleReload(null, 1, filters);
  }
  handleOwnerChange = (value) => {
    const filters = { ...this.props.filters, ownerCode: value };
    this.handleReload(null, 1, filters);
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    this.handleReload(null, 1, filters);
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
    this.handleReload(value, 1);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { whses, defaultWhse, filters, loading, owners } = this.props;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadWaves(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
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
      remotes: this.props.wave,
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={filters.name} />
      <span />
      <Select showSearch optionFilterProp="children" size="large" style={{ width: 160 }}
        onChange={this.handleOwnerChange} defaultValue="all" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部货主</Option>
        {owners.map(owner => (<Option key={owner.id} value={owner.id}>{owner.name}</Option>))}
      </Select>
    </span>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
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
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="pending">计划</RadioButton>
            <RadioButton value="outbound">已释放</RadioButton>
            <RadioButton value="completed">完成</RadioButton>
          </RadioGroup>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content" key="main">
          <DataTable columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id" scroll={{ x: 1400 }} loading={loading}
            toolbarActions={toolbarActions} selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
          />
        </Content>
      </QueueAnim>
    );
  }
}
