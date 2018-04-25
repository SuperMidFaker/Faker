import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, DatePicker, Divider, Icon, Input, Layout, Menu, Radio, Select, Switch, message } from 'antd';
import DataTable from 'client/components/DataTable';
import ButtonToggle from 'client/components/ButtonToggle';
import ToolbarAction from 'client/components/ToolbarAction';
import Drawer from 'client/components/Drawer';
import NestedMenuPanel from 'client/components/NestedMenuPanel';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import UserAvatar from 'client/components/UserAvatar';
import connectNav from 'client/common/decorators/connect-nav';
import { PARTNER_ROLES } from 'common/constants';
import { loadPartners } from 'common/reducers/partner';
import { loadAudits, confirmAudits, redoAudits } from 'common/reducers/bssAudit';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connectFetch()()
@injectIntl
@connect(
  state => ({
    partners: state.partner.partners,
    auditslist: state.bssAudit.auditslist,
    listFilter: state.bssAudit.listFilter,
    loading: state.bssAudit.loading,
  }),
  {
    loadPartners, loadAudits, confirmAudits, redoAudits,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class AuditList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    extraVisible: false,
  }
  componentDidMount() {
    this.props.loadPartners({ role: PARTNER_ROLES.CUS });
    this.handleAuditsLoad(1);
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: '发票号',
    dataIndex: 'invoice_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '购买方',
    width: 180,
    dataIndex: 'buyer_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '销售方',
    width: 180,
    dataIndex: 'seller_name',
    render: o => <TrimSpan text={o} maxLen={16} />,
  }, {
    title: '账单号/业务编号',
    width: 150,
    dataIndex: 'cust_order_no',
  }, {
    title: '发票种类',
    width: 100,
    dataIndex: 'invoice_type',
  }, {
    title: '发票金额',
    dataIndex: 'invoice_amount',
    align: 'right',
    width: 150,
  }, {
    title: '税额',
    dataIndex: 'tax_amount',
    align: 'right',
    width: 150,
  }, {
    title: '开票日期',
    dataIndex: 'invoiced_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '申请日期',
    dataIndex: 'applied_date',
    width: 120,
    render: recdate => recdate && moment(recdate).format('MM.DD HH:mm'),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 120,
    render: lid => lid && <UserAvatar size="small" loginId={lid} showName />,
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    fixed: 'right',
    width: 120,
    render: (o, record) => {
      if (record.status === 1) {
        return (<span>
          <RowAction icon="check-circle-o" onClick={this.handleConfirm} label={this.gmsg('confirm')} row={record} />
          <RowAction icon="edit" onClick={this.handleDetail} tooltip={this.gmsg('edit')} row={record} />
        </span>);
      } else if (record.status === 2) {
        return (<span>
          <RowAction icon="close-circle-o" onClick={this.handleReturn} label={this.gmsg('return')} row={record} />
          <RowAction icon="eye-o" onClick={this.handleDetail} tooltip={this.gmsg('view')} row={record} />
        </span>);
      }
      return (<RowAction icon="eye-o" onClick={this.handleDetail} tooltip={this.gmsg('view')} row={record} />);
    },
  }]
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadAudits(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = {
        ...this.props.listFilter,
      };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.auditslist,
  })

  handleAuditsLoad = (currentPage, filter) => {
    const { listFilter, auditslist: { pageSize, current } } = this.props;
    this.props.loadAudits({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
      }
    });
  }
  handleFilterMenuClick = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.key };
    this.handleAuditsLoad(1, filter);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleAuditsLoad(1, filter);
  }
  handleDateRangeChange = (data, dataString) => {
    const filter = { ...this.props.listFilter, startDate: dataString[0], endDate: dataString[1] };
    this.handleAuditsLoad(1, filter);
  }
  handleClientSelectChange = (value) => {
    const filters = { ...this.props.listFilter, clientPid: value };
    this.handleAuditsLoad(1, filters);
  }
  handleConfirmAudits = (sofOrderNos) => {
    this.props.confirmAudits(sofOrderNos).then((result) => {
      if (!result.error) {
        this.handleAuditsLoad(1);
      }
    });
  }
  handleConfirm = (row) => {
    const sofOrderNos = [row.sof_order_no];
    this.handleConfirmAudits(sofOrderNos);
  }
  handleBatchConfirm = () => {
    const sofOrderNos = this.state.selectedRowKeys;
    this.handleConfirmAudits(sofOrderNos);
  }
  handleAllConfirm = () => {
    const sofOrderNos = null;
    this.handleConfirmAudits(sofOrderNos);
  }
  handleReturn = (row) => {
    this.props.redoAudits([row.sof_order_no]).then((result) => {
      if (!result.error) {
        this.handleAuditsLoad(1);
      }
    });
  }
  handleBatchReturn = () => {
    const sofOrderNos = this.state.selectedRowKeys;
    this.props.redoAudits(sofOrderNos).then((result) => {
      if (!result.error) {
        this.handleAuditsLoad(1);
      }
    });
  }
  handleDetail = (row) => {
    const link = `/bss/invoice/${row.sof_order_no}`;
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
    const { auditslist, loading, partners } = this.props;
    const { status } = this.props.listFilter;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    this.dataSource.remotes = auditslist;
    const primaryAction = <ToolbarAction primary icon="plus" label={this.msg('createInvoice')} onClick={this.handleCreate} />;
    const toolbarActions = (<span>
      <Select
        showSearch
        allowClear
        optionFilterProp="children"
        style={{ width: 160 }}
        onChange={this.handleClientSelectChange}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      >
        <Option value="all" key="all">全部</Option>
        {partners.map(data => (
          <Option key={String(data.id)} value={String(data.id)}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}
          </Option>))
        }
      </Select>
      <RangePicker
        ranges={{ 当天: [moment(), moment()], 当月: [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const bulkActions = (<span>
      {(status === 'submitted') && <Button icon="check-circle-o" onClick={this.handleBatchConfirm}>批量确认</Button>}
      {(status === 'confirmed') && <Button icon="close-circle-o" onClick={this.handleBatchReturn}>取消确认</Button>}
    </span>);
    const menuStack = [
      [
        {
          key: 'g_views',
          title: this.gmsg('views'),
          type: 'group',
          children: [
            {
              key: 'viewRadioGroup',
              extra: <RadioGroup defaultValue="table">
                <RadioButton value="table"><Icon type="table" /> {this.gmsg('tableView')}</RadioButton>
                <RadioButton value="board"><Icon type="layout" /> {this.gmsg('boardView')}</RadioButton>
              </RadioGroup>,
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
        <PageHeader title={this.msg('invoice')}>
          <PageHeader.Actions>
            {primaryAction}
            <ButtonToggle icon="bars" onClick={this.toggleExtra} state={this.state.extraVisible} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[status]} onClick={this.handleFilterMenuClick}>
              <Menu.ItemGroup key="invoicing" title={this.msg('invoicing')}>
                <Menu.Item key="applied">
                  <Icon type="upload" /> {this.msg('statusApplied')}
                </Menu.Item>
                <Menu.Item key="invoiced">
                  <Icon type="file" /> {this.msg('statusInvoiced')}
                </Menu.Item>
                <Menu.Item key="paymentReceived">
                  <Icon type="check-square-o" /> {this.msg('statusPaymentReceived')}
                </Menu.Item>
              </Menu.ItemGroup>
              <Menu.ItemGroup key="payableInvoice" title={this.msg('payableInvoice')}>
                <Menu.Item key="pending">
                  <Icon type="file-unknown" /> {this.msg('statusPending')}
                </Menu.Item>
                <Menu.Item key="confirmed">
                  <Icon type="file" /> {this.msg('statusConfirmed')}
                </Menu.Item>
                <Menu.Item key="paymentMade">
                  <Icon type="check-square-o" /> {this.msg('statusPaymentMade')}
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
              dataSource={this.dataSource}
              rowSelection={rowSelection}
              rowKey="sof_order_no"
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
