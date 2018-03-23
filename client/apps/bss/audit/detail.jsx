import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Col, Layout, Row, Tabs, Input, Select } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { getAudit, deleteFee, updateFee, confirmAudit } from 'common/reducers/bssAudit';
import { loadCurrencies } from 'common/reducers/cmsExpense';
import { formatMsg, formatGlobalMsg } from './message.i18n';
import './index.less';

const { Content } = Layout;
const { Description } = DescriptionList;
const { Option } = Select;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    currencies: state.cmsExpense.currencies,
    audit: state.bssAudit.audit,
  }),
  {
    getAudit, loadCurrencies, deleteFee, updateFee, confirmAudit,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'bss',
  jumpOut: true,
})
export default class FeeSummaryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    head: {},
    receives: [],
    pays: [],
    editItem: {},
  }
  componentDidMount() {
    this.props.getAudit(this.props.params.orderRelNo).then((result) => {
      if (!result.error) {
        this.setState({
          head: result.data.head,
          receives: result.data.details.receives,
          pays: result.data.details.pays,
        });
      }
    });
    this.props.loadCurrencies();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  recColumns = [{
    title: '业务流水号',
    dataIndex: 'biz_expense_no',
    width: 180,
  }, {
    title: '费用名称',
    dataIndex: 'fee_name',
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
  }, {
    title: '营收金额(人民币)',
    dataIndex: 'base_amount',
    width: 150,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          disabled
          value={this.state.editItem.base_amount}
        />);
      }
      return o;
    },
  }, {
    title: '外币金额',
    dataIndex: 'orig_amount',
    width: 150,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          value={this.state.editItem.orig_amount}
          onChange={e => this.handleColumnChange(e.target.value, 'orig_amount')}
        />);
      }
      return o;
    },
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (
          <Select
            size="small"
            showSearch
            optionFilterProp="children"
            value={this.state.editItem.currency}
            style={{ width: '100%' }}
            allowClear
            onChange={value => this.handleColumnChange(value, 'currency')}
          >
            {this.props.currencies.map(currency =>
              (<Option key={currency.currency} value={currency.currency}>
                {currency.name}
              </Option>))}
          </Select>
        );
      }
      return this.props.currencies.find(curr => curr.currency === o) &&
        this.props.currencies.find(curr => curr.currency === o).name;
    },
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 100,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          value={this.state.editItem.exchange_rate}
          onChange={e => this.handleColumnChange(e.target.value, 'exchange_rate')}
        />);
      }
      return o;
    },
  }, {
    title: '调整金额',
    dataIndex: 'adj_amount',
    width: 150,
  }, {
    title: '审核人员',
    dataIndex: 'auditted_by',
    width: 150,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<span>
          <RowAction icon="save" onClick={() => this.handleOk('receives')} tooltip={this.gmsg('confirm')} row={record} />
          <RowAction icon="close" onClick={this.handleCancel} tooltip={this.gmsg('cancel')} row={record} />
        </span>);
      }
      return (<span><RowAction onClick={this.handleEdit} label="调整" row={record} />
        <span className="ant-divider" />
        <RowAction onClick={() => this.handleDelete(record, 'receives')} label="排除" row={record} />
      </span>);
    },
  }]
  payColumns = [{
    title: '结算对象',
    dataIndex: 'buyer_name',
    width: 180,
  }, {
    title: '费用名称',
    dataIndex: 'fee_name',
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
  }, {
    title: '成本金额(人民币)',
    dataIndex: 'base_amount',
    width: 150,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          disabled
          value={this.state.editItem.base_amount}
        />);
      }
      return o;
    },
  }, {
    title: '外币金额',
    dataIndex: 'orig_amount',
    width: 150,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          value={this.state.editItem.orig_amount}
          onChange={e => this.handleColumnChange(e.target.value, 'orig_amount')}
        />);
      }
      return o;
    },
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 100,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (
          <Select
            size="small"
            showSearch
            optionFilterProp="children"
            value={this.state.editItem.currency}
            style={{ width: '100%' }}
            allowClear
            onChange={value => this.handleColumnChange(value, 'currency')}
          >
            {this.props.currencies.map(currency =>
              (<Option key={currency.currency} value={currency.currency}>
                {currency.name}
              </Option>))}
          </Select>
        );
      }
      return this.props.currencies.find(curr => curr.currency === o) &&
        this.props.currencies.find(curr => curr.currency === o).name;
    },
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 100,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          size="small"
          value={this.state.editItem.exchange_rate}
          onChange={e => this.handleColumnChange(e.target.value, 'exchange_rate')}
        />);
      }
      return o;
    },
  }, {
    title: '调整金额',
    dataIndex: 'adj_amount',
    width: 150,
  }, {
    title: '审核人员',
    dataIndex: 'auditted_by',
    width: 150,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<span>
          <RowAction icon="save" onClick={() => this.handleOk('pays')} tooltip={this.gmsg('confirm')} row={record} />
          <RowAction icon="close" onClick={this.handleCancel} tooltip={this.gmsg('cancel')} row={record} />
        </span>);
      }
      return (<span><RowAction onClick={this.handleEdit} label="调整" row={record} />
        <span className="ant-divider" />
        <RowAction onClick={() => this.handleDelete(record, 'pays')} label="排除" row={record} />
      </span>);
    },
  }]
  handleDelete = (row, dataType) => {
    const head = { ...this.state.head };
    let dataSource = [];
    if (dataType === 'receives') {
      dataSource = [...this.state.receives];
      head.receivable_amount = (head.receivable_amount - row.sum_amount).toFixed(3);
      head.profit_amount = (head.profit_amount - row.sum_amount).toFixed(3);
    } else {
      dataSource = [...this.state.pays];
      head.payable_amount = (head.payable_amount - row.sum_amount).toFixed(3);
      head.profit_amount = (head.profit_amount + row.sum_amount).toFixed(3);
    }
    const index = dataSource.findIndex(data => data.id === row.id);
    dataSource.splice(index, 1);
    if (dataType === 'receives') {
      this.setState({ receives: dataSource, head });
    } else {
      this.setState({ pays: dataSource, head });
    }
    this.props.deleteFee(row.id, row.sum_amount, dataType, this.props.params.orderRelNo);
  }
  handleEdit = (row) => {
    this.setState({
      editItem: { ...row },
    });
  }
  handleCancel = () => {
    this.setState({
      editItem: {},
    });
  }
  handleColumnChange = (value, field) => {
    const editOne = { ...this.state.editItem };
    if (field === 'orig_amount') {
      if (editOne.exchange_rate) {
        editOne.base_amount = editOne.exchange_rate * value;
      } else {
        editOne.base_amount = Number(value);
      }
      const data = parseFloat(value);
      if (!Number.isNaN(data)) {
        editOne[field] = data;
      }
    }
    if (field === 'exchange_rate') {
      if (editOne.orig_amount) {
        editOne.base_amount = editOne.orig_amount * value;
      }
      const data = parseFloat(value);
      if (!Number.isNaN(data)) {
        editOne[field] = data;
      }
    }
    if (field === 'currency') {
      const { currencies } = this.props;
      if (value) {
        const currency = currencies.find(curr => curr.currency === value);
        editOne.exchange_rate = currency.exchange_rate;
        editOne.base_amount = editOne.orig_amount * currency.exchange_rate;
      } else {
        editOne.exchange_rate = '';
        editOne.base_amount = editOne.orig_amount;
      }
      editOne[field] = value;
    }
    this.setState({
      editItem: editOne,
    });
  }
  handleOk = (dataType) => {
    const item = this.state.editItem;
    const head = { ...this.state.head };
    let dataSource = [];
    if (dataType === 'receives') {
      dataSource = [...this.state.receives];
    } else {
      dataSource = [...this.state.pays];
    }
    const index = dataSource.findIndex(data => data.id === item.id);
    const delta = item.base_amount - dataSource[index].base_amount;
    dataSource[index] = item;
    item.delta = delta;
    if (dataType === 'receives') {
      head.receivable_amount += delta;
      head.profit_amount += delta;
    } else {
      head.payable_amount += delta;
      head.profit_amount -= delta;
    }
    this.props.updateFee(item, dataType, this.props.params.orderRelNo);
    if (dataType === 'receives') {
      this.setState({
        editItem: {},
        head,
        receives: dataSource,
      });
    } else {
      this.setState({
        editItem: {},
        head,
        pays: dataSource,
      });
    }
  }
  handleConfirm = () => {
    this.props.confirmAudit(this.props.params.orderRelNo).then((result) => {
      if (!result.error) {
        this.context.router.push('/bss/audit');
      }
    });
  }
  render() {
    const { head, receives, pays } = this.state;
    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('fee'), this.msg('feeSummary'), this.props.params.orderRelNo]}>
          <PageHeader.Actions>
            <Button disabled={head.status === 2} type="primary" icon="check-circle-o" onClick={this.handleConfirm}>
              {this.msg('confirm')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <Row type="flex">
              <Col span={14}>
                <DescriptionList col={2}>
                  <Description term="业务编号">{this.props.params.orderRelNo}</Description>
                  <Description term="订单日期">{head.created_date && moment(head.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                  <Description term="客户单号">{head.cust_order_no}</Description>
                  <Description term="客户">{head.owner_name}</Description>
                </DescriptionList>
              </Col>
              <Col span={10} className="extra">
                <div>
                  <p>应收金额</p>
                  <p>{head.receivable_amount}</p>
                </div>
                <div>
                  <p>应付金额</p>
                  <p>{head.payable_amount}</p>
                </div>
                <div>
                  <p>利润</p>
                  <p>{head.profit_amount}</p>
                </div>
                <div>
                  <p>毛利率</p>
                  <p>{head.gross_profit_ratio}</p>
                </div>
              </Col>
            </Row>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="receiveDetails">
                <TabPane tab="应收明细" key="receiveDetails" >
                  <DataPane

                    columns={this.recColumns}
                    dataSource={receives}
                    rowKey="id"
                    loading={this.state.loading}
                  />
                </TabPane>
                <TabPane tab="应付明细" key="putawayDetails" >
                  <DataPane
                    columns={this.payColumns}
                    dataSource={pays}
                    rowKey="id"
                    loading={this.state.loading}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
