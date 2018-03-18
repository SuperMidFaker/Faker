import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input, Select, Button } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { updateFee, deleteFee, toggleAddSpecialModal, getExpenseDetails } from 'common/reducers/cmsExpense';
import { FEE_TYPE } from 'common/constants';
import AddSpeModal from '../modals/addSpeModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    currencies: state.cmsExpense.currencies,
  }),
  {
    updateFee, deleteFee, toggleAddSpecialModal, getExpenseDetails,
  }
)
export default class ExpenseDetailTabPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fullscreen: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    expense: PropTypes.shape({
      expense_no: PropTypes.string,
      quote_allow_special: PropTypes.bool,
    }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    dataSource: [],
    editItem: {},
  }
  /*
     expenseNo异步获取 首个tabPane加载时expenseNo为空 走componentWillReceiveProps
     切换到其他tabpane时 数据已经获取 走componentWillMount
   * */
  componentWillMount() {
    this.handleReload(this.props.expense.expense_no);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.expense !== this.props.expense) {
      this.handleReload(nextProps.expense.expense_no);
    }
  }
  handleReload = (expenseNo) => {
    this.props.getExpenseDetails(expenseNo).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: this.gmsg('seqNo'),
    dataIndex: 'seq_no',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (col, row, index) => index + 1,
  }, {
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
    width: 200,
  }, {
    title: this.msg('feeType'),
    dataIndex: 'fee_type',
    width: 100,
    render: (o) => {
      const type = FEE_TYPE.filter(fe => fe.key === o)[0];
      return type ? <span>{type.text}</span> : <span />;
    },
  }, {
    title: this.msg('baseAmount'),
    dataIndex: 'base_amount',
    width: 150,
    align: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return this.state.editItem.base_amount;
      }
      return o;
    },
  }, {
    title: this.msg('origAmount'),
    dataIndex: 'orig_amount',
    width: 150,
    align: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          value={this.state.editItem.orig_amount}
          onChange={e => this.handleColumnChange(e.target.value, 'orig_amount')}
        />);
      }
      return o;
    },
  }, {
    title: this.msg('origCurrency'),
    dataIndex: 'currency',
    width: 180,
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (
          <Select
            showSearch
            optionFilterProp="children"
            value={this.state.editItem.currency}
            style={{ width: 150 }}
            onSelect={value => this.handleColumnChange(value, 'currency')}
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
    title: this.msg('exchangeRate'),
    dataIndex: 'exchange_rate',
    width: 100,
    align: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          value={this.state.editItem.exchange_rate}
          onChange={e => this.handleColumnChange(e.target.value, 'exchange_rate')}
        />);
      }
      return o;
    },
  }, {
    title: this.msg('taxRate'),
    dataIndex: 'tax_rate',
    width: 100,
    align: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          value={this.state.editItem.tax_rate}
          onChange={e => this.handleColumnChange(e.target.value, 'tax_rate')}
        />);
      }
      return o;
    },
  }, {
    title: this.msg('taxValue'),
    dataIndex: 'tax',
    width: 150,
    align: 'right',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          value={this.state.editItem.tax}
          onChange={e => this.handleColumnChange(e.target.value, 'tax')}
        />);
      }
      return o;
    },
  }, {
    title: this.gmsg('remark'),
    dataIndex: 'remark',
    render: (o, record) => {
      if (this.state.editItem.id === record.id) {
        return (<Input
          value={this.state.editItem.remark}
          onChange={e => this.handleColumnChange(e.target.value, 'remark')}
        />);
      }
      return o;
    },
  }, {
    title: this.gmsg('op'),
    dataIndex: 'OPS_COL',
    width: 90,
    fixed: 'right',
    render: (o, record) => {
      if (record.fee_status < 2) {
        if (this.state.editItem.id === record.id) {
          return (<span><RowAction onClick={this.handleOk} label={this.gmsg('confirm')} row={record} />
            <span className="ant-divider" />
            <RowAction onClick={this.handleCancel} label={this.gmsg('cancel')} row={record} />
          </span>);
        }
        return (<span><RowAction onClick={this.handleEdit} label={this.gmsg('adjust')} row={record} />
          <span className="ant-divider" />
          <RowAction onClick={this.handleDelete} label={this.gmsg('delete')} row={record} />
        </span>);
      }
      return '';
    },
  }]
  handleEdit = (row) => {
    this.setState({
      editItem: { ...row },
    });
  }
  handleColumnChange = (value, field) => {
    const editOne = { ...this.state.editItem };
    if (field === 'orig_amount') {
      if (editOne.exchange_rate) {
        editOne.base_amount = editOne.exchange_rate * value;
      }
    } else if (field === 'exchange_rate') {
      if (editOne.orig_amount) {
        editOne.base_amount = editOne.orig_amount * value;
      }
    }
    if (field === 'currency') {
      const { currencies } = this.props;
      const currency = currencies.find(curr => curr.currency === value);
      editOne.exchange_rate = currency.exchange_rate;
      editOne.base_amount = editOne.orig_amount * currency.exchange_rate;
    }
    editOne[field] = value;
    this.setState({
      editItem: editOne,
    });
  }
  handleOk = () => {
    const item = this.state.editItem;
    const dataSource = [...this.state.dataSource];
    const index = dataSource.findIndex(data => data.id === item.id);
    const delta = item.base_amount - dataSource[index].base_amount;
    dataSource[index] = item;
    item.delta = delta;
    this.props.updateFee(item, this.props.expense.expense_no);
    this.setState({
      editItem: {},
      dataSource,
    });
  }
  handleCancel = () => {
    this.setState({
      editItem: {},
    });
  }
  handleDelete = (row) => {
    this.props.deleteFee(row.id);
    const dataSource = [...this.state.dataSource];
    const index = dataSource.findIndex(data => data.id === row.id);
    dataSource.splice(index, 1);
    this.setState({ dataSource });
  }
  handleAddSpecial = () => {
    this.props.toggleAddSpecialModal(true);
  }
  render() {
    const {
      fullscreen, loading, expense,
    } = this.props;
    const { dataSource } = this.state;
    return (
      <DataPane
        fullscreen={fullscreen}
        columns={this.columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
      >
        <DataPane.Toolbar>
          {!!expense.quote_allow_special &&
          <Button onClick={this.handleAddSpecial}>添加特殊费用</Button>}
        </DataPane.Toolbar>
        <AddSpeModal expenseNo={expense.expense_no} reload={this.handleReload} />
      </DataPane>
    );
  }
}
