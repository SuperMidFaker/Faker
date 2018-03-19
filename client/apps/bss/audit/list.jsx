import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, DatePicker, Divider, Icon, Input, Layout, Menu, Select, Switch } from 'antd';
import DataTable from 'client/components/DataTable';
import ButtonToggle from 'client/components/ButtonToggle';
import ToolbarAction from 'client/components/ToolbarAction';
import Drawer from 'client/components/Drawer';
import NestedMenuPanel from 'client/components/NestedMenuPanel';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg, formatGlobalMsg } from './message.i18n';


const { Content } = Layout;
const { RangePicker } = DatePicker;


@connectFetch()()
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class AuditList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    extraVisible: false,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: '业务编号',
    dataIndex: 'order_rel_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '客户',
    width: 200,
    dataIndex: 'owner_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '客户单号',
    width: 180,
    dataIndex: 'cust_order_no',
  }, {
    title: '状态',
    width: 100,
    dataIndex: 'status',
  }, {
    title: '应收金额',
    dataIndex: 'receivable_amount',
    width: 150,
  }, {
    title: '应付金额',
    dataIndex: 'payable_amount',
    width: 150,
  }, {
    title: '差异金额',
    dataIndex: 'profit_amount',
    width: 150,
  }, {
    title: '毛利率',
    dataIndex: 'gross_profit_ratio',
    width: 100,
  }, {
    title: '订单日期',
    dataIndex: 'order_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '结单日期',
    dataIndex: 'received_date',
    width: 120,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
  }, {
    title: '审核时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '审核人员',
    dataIndex: 'created_by',
    width: 80,
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    align: 'right',
    fixed: 'right',
    width: 120,
    render: (o, record) => {
      if (record.status === 0) {
        return (<span>
          <RowAction icon="check-circle-o" onClick={this.handleConfirm} label={this.gmsg('confirm')} row={record} />
          <RowAction icon="eye-o" onClick={this.handleDetail} tooltip={this.gmsg('view')} row={record} />
        </span>);
      } else if (record.status === 1) {
        return (<span>
          <RowAction icon="close-circle-o" onClick={this.handleReturn} label={this.gmsg('return')} row={record} />
          <RowAction icon="eye-o" onClick={this.handleDetail} tooltip={this.gmsg('view')} row={record} />
        </span>);
      }
      return null;
    },
  }]
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDetail = (row) => {
    const link = `/bss/audit/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  toggleExtra = () => {
    this.setState({ extraVisible: !this.state.extraVisible });
  }
  // handleExtraMenuClick = (ev) => {
  // console.log(ev.key);
  // }
  render() {
    const { loading } = this.props;
    const mockData = [{
      order_rel_no: '1',
      name: '胡彦斌',
      status: 0,
      address: '西湖区湖底公园1号',
    }, {
      order_rel_no: '2',
      name: '胡彦祖',
      status: 1,
      address: '西湖区湖底公园1号',
    }];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    /*
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadAsnLists(params),
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
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.asnlist,
    });
    */
    const toolbarActions = (<span>
      <Select
        showSearch
        placeholder="客户"
        optionFilterProp="children"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      />
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const bulkActions = (<span>
      <Button icon="check-circle-o" onClick={this.handleBatchRelease}>批量确认</Button>
      <Button icon="close-circle-o" onClick={this.handleBatchRelease}>取消确认</Button>
    </span>);
    const menuStack = [
      [
        {
          key: 'g_view',
          title: this.gmsg('views'),
          type: 'group',
          children: [
            {
              key: 'table',
              icon: 'table',
              title: this.gmsg('tableView'),
            },
            {
              key: 'board',
              icon: 'layout',
              title: this.gmsg('boardView'),
              disabled: true,
            },
          ],
        },
        {
          key: 'g_setting',
          title: this.gmsg('setting'),
          type: 'group',
          children: [
            {
              key: 'rules',
              icon: 'tool',
              title: this.msg('审核规则'),
              children: [
                {
                  key: 'autoAudit',
                  icon: 'rocket',
                  title: this.msg('启用自动审核'),
                  extra: <Switch />,
                },
                {
                  key: 'profitLimit',
                  title: this.msg('最低利润金额'),
                  extra: <Input />,
                },
                {
                  key: 'profitRateLimit',
                  title: this.msg('最低毛利率'),
                  extra: <Input />,
                },
              ],
            },
          ],
        },
      ],
    ];
    return (
      <Layout>
        <PageHeader title={this.msg('audit')}>
          <PageHeader.Actions>
            <ToolbarAction
              icon="check"
              confirm={this.gmsg('confirmOp')}
              onConfirm={this.handleAllConfirm}
              label={this.msg('confirmAll')}
              // disabled={status === 'confirmed'}
            />
            <ButtonToggle icon="ellipsis" onClick={this.toggleExtra} state={this.state.extraVisible} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[this.state.status]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="all">
                {this.gmsg('all')}
              </Menu.Item>
              <Menu.ItemGroup key="status" title={this.gmsg('status')}>
                <Menu.Item key="submitted">
                  <Icon type="upload" /> {this.msg('statusSubmitted')}
                </Menu.Item>
                <Menu.Item key="confirmed">
                  <Icon type="check-square-o" /> {this.msg('statusConfirmed')}
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </Drawer>
          <Content className="page-content" key="main">
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              onSearch={this.handleSearch}
              searchTips={this.msg('searchTips')}
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              columns={this.columns}
              dataSource={mockData}
              rowSelection={rowSelection}
              rowKey="id"
              loading={loading}
            />
            <NestedMenuPanel
              title={this.gmsg('extraMenu')}
              visible={this.state.extraVisible}
              onClose={this.toggleExtra}
              stack={menuStack}
              onMenuClick={this.handleExtraMenuClick}
            >
              <Divider />
            </NestedMenuPanel>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
