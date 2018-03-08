import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Breadcrumb, DatePicker, Layout, Radio, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import QueueAnim from 'rc-queue-anim';
import SearchBox from 'client/components/SearchBox';
import PageHeader from 'client/components/PageHeader';
import Summary from 'client/components/Summary';
import connectNav from 'client/common/decorators/connect-nav';
import { formatMsg } from '../message.i18n';


const { Content } = Layout;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;


@connectFetch()()
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class FeeSummaryList extends React.Component {
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
    if (!nextProps.asnlist.loaded && !nextProps.asnlist.loading) {
      // this.handleListReload();
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '业务编号',
    dataIndex: 'order_rel_no',
    width: 150,
    fixed: 'left',
    render: o => (<a onClick={() => this.handlePreview(o)}>{o}</a>),
  }, {
    title: '业务类型',
    width: 100,
    dataIndex: 'biz_type',
  }, {
    title: '业务流水号',
    width: 150,
    dataIndex: 'biz_seq_no',
  }, {
    title: '收/付',
    dataIndex: 'rec_pay',
    width: 50,
  }, {
    title: '费用类目',
    width: 100,
    dataIndex: 'fee_category',
  }, {
    title: '费用名称',
    width: 120,
    dataIndex: 'fee',
  }, {
    title: '费用类型',
    width: 100,
    dataIndex: 'fee_type',
  }, {
    title: '金额(人民币)',
    dataIndex: 'amount_rmb',
    width: 100,
  }, {
    title: '外币金额',
    dataIndex: 'amount_forc',
    width: 100,
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
  }, {
    title: '汇率',
    dataIndex: 'currency_rate',
    width: 100,
  }, {
    title: '订单日期',
    dataIndex: 'expect_receive_date',
    width: 120,
    render: exprecdate => exprecdate && moment(exprecdate).format('YYYY.MM.DD'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: createdate => createdate && moment(createdate).format('MM.DD HH:mm'),
  }, {
    title: '创建人员',
    dataIndex: 'created_by',
    width: 80,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',

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
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading } = this.props;
    const mockData = [{
      order_rel_no: '5',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
    }, {
      order_rel_no: '5',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
    }, {
      order_rel_no: '5',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
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
      <SearchBox placeholder={this.msg('asnPlaceholder')} onSearch={this.handleSearch} />
      <Select
        showSearch
        placeholder="结算对象"
        optionFilterProp="children"
        style={{ width: 160 }}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 360 }}
      />
      <RangePicker
        ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
        onChange={this.handleDateRangeChange}
      />
    </span>);
    const totCol = (
      <Summary>
        <Summary.Item label="应收合计">{10000}</Summary.Item>
        <Summary.Item label="应付合计">{6666}</Summary.Item>
        <Summary.Item label="利润合计">{3334}</Summary.Item>
      </Summary>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('fee')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('feeStatement')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <RadioGroup onChange={this.handleTypeChange} >
              <RadioButton value="all">全部</RadioButton>
              <RadioButton value="revenue">应收营收</RadioButton>
              <RadioButton value="cost">应付成本</RadioButton>
            </RadioGroup>
            <span />
            <RadioGroup onChange={this.handleStatusChange} >
              <RadioButton value="abnormal">异常费用</RadioButton>
            </RadioGroup>
          </PageHeader.Nav>
          <PageHeader.Actions>
            <Button icon="file-excel">导出</Button>
            <Button type="primary" icon="upload" onClick={this.handleCreateASN}>
              {this.msg('导入费用')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            dataSource={mockData}
            rowSelection={rowSelection}
            rowKey="asn_no"
            loading={loading}
            locale={{ emptyText: '当前没有待结算的费用' }}
            total={totCol}
          />
        </Content>
      </QueueAnim>
    );
  }
}
