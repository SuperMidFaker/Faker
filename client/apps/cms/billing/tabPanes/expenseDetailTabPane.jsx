import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { updateFee, deleteFee } from 'common/reducers/cmsExpense';
import { FEE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    currencies: state.cmsExpense.currencies,
  }),
  { updateFee, deleteFee }
)
export default class ExpenseDetailTabPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dataSource: PropTypes.arrayOf(PropTypes.shape({
      fee_name: PropTypes.string,
    })),
    fullscreen: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    dataSource: [],
    editItem: {},
  }
  /*
     dataSource异步获取 首个tabPane加载时dataSource为空 走componentWillReceiveProps
     切换到其他tabpane时 数据已经获取 走componentWillMount
   * */
  componentWillMount() {
    this.setState({
      dataSource: this.props.dataSource,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      this.setState({
        dataSource: nextProps.dataSource,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (col, row, index) => index + 1,
  }, {
    title: '费用名称',
    dataIndex: 'fee_name',
    width: 200,
  }, {
    title: '费用类型',
    dataIndex: 'fee_type',
    width: 100,
    render: (o) => {
      const type = FEE_TYPE.filter(fe => fe.key === o)[0];
      return type ? <span>{type.text}</span> : <span />;
    },
  }, {
    title: '计费金额(人民币)',
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
    title: '外币金额',
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
    title: '外币币制',
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
    title: '汇率',
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
    title: '开票税率',
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
    title: '税金',
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
    title: '备注',
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
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    fixed: 'right',
    render: (o, record) => {
      if (record.fee_status < 2) {
        if (this.state.editItem.id === record.id) {
          return (<span><RowAction onClick={this.handleOk} label="确认" row={record} />
            <span className="ant-divider" />
            <RowAction onClick={this.handleCancel} label="取消" row={record} />
          </span>);
        }
        return (<span><RowAction onClick={this.handleEdit} label="调整" row={record} />
          <span className="ant-divider" />
          <RowAction onClick={this.handleDelete} label="排除" row={record} />
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
      if (editOne.exchange_rate) {
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
    this.props.updateFee(item);
    const dataSource = [...this.state.dataSource];
    const index = dataSource.findIndex(data => data.id === item.id);
    dataSource[index] = item;
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
  }
  render() {
    const { fullscreen, loading } = this.props;
    const { dataSource } = this.state;
    return (
      <DataPane
        fullscreen={fullscreen}
        columns={this.columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
      >
        <DataPane.Toolbar />
      </DataPane>
    );
  }
}
