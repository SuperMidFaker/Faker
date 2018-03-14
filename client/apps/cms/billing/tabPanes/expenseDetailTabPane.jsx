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
  }
  componentWillMount() {
    const newData = this.props.dataSource.map(data => ({ ...data, disabled: true }));
    this.setState({
      dataSource: newData,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      const newData = nextProps.dataSource.map(data => ({ ...data, disabled: true }));
      this.setState({
        dataSource: newData,
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
    render: (o, record) => (<Input
      disabled={record.disabled}
      value={o}
      onChange={e => this.handleChange(e, 'base_amount', record.id)}
    />),
  }, {
    title: '外币金额',
    dataIndex: 'orig_amount',
    width: 150,
    align: 'right',
    render: (o, record) => {
      if (record.exchange_rate && record.base_amount) {
        return (record.base_amount * record.exchange_rate).toFixed(2);
      }
      return '';
    },
  }, {
    title: '外币币制',
    dataIndex: 'currency',
    width: 180,
    render: (o, record) => {
      if (record.disabled) {
        return this.props.currencies.find(curr => curr.curr_code === o) &&
        this.props.currencies.find(curr => curr.curr_code === o).curr_name;
      }
      return (
        <Select
          showSearch
          optionFilterProp="children"
          value={o}
          style={{ width: 150 }}
          onSelect={value => this.handleSelect(value, record.id)}
        >
          {this.props.currencies.map(currency =>
                (<Option key={currency.curr_code} value={currency.curr_code}>
                  {currency.curr_name}
                </Option>))}
        </Select>
      );
    },
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 100,
    align: 'right',
    render: (o, record) => (<Input
      disabled={record.disabled}
      value={o}
      onChange={e => this.handleChange(e, 'exchange_rate', record.id)}
    />),
  }, {
    title: '开票税率',
    dataIndex: 'tax_rate',
    width: 100,
    align: 'right',
    render: (o, record) => (<Input
      disabled={record.disabled}
      value={o}
      onChange={e => this.handleChange(e, 'tax_rate', record.id)}
    />),
  }, {
    title: '税金',
    dataIndex: 'tax',
    width: 150,
    align: 'right',
    render: (o, record) => (<Input
      disabled={record.disabled}
      value={o}
      onChange={e => this.handleChange(e, 'tax', record.id)}
    />),
  }, {
    title: '备注',
    dataIndex: 'remark',
    render: (o, record) => (<Input
      disabled={record.disabled}
      value={o}
      onChange={e => this.handleChange(e, 'remark', record.id)}
    />),
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    fixed: 'right',
    render: (o, record) => {
      if (record.fee_status < 2) {
        if (!record.disabled) {
          return (<span><RowAction onClick={this.handleOk} label="确认" row={record} />
            <span className="ant-divider" />
            <RowAction onClick={this.handleDelete} label="排除" row={record} />
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
    const dataSource = [...this.state.dataSource];
    const editOne = dataSource.find(data => data.id === row.id);
    editOne.disabled = false;
    this.setState({
      dataSource,
    });
  }
  handleChange = (e, filed, id) => {
    const dataSource = [...this.state.dataSource];
    const editOne = dataSource.find(data => data.id === id);
    editOne[filed] = e.target.value;
    this.setState({
      dataSource,
    });
  }
  handleSelect = (value, id) => {
    const dataSource = [...this.state.dataSource];
    const editOne = dataSource.find(data => data.id === id);
    editOne.currency = value;
    this.setState({
      dataSource,
    });
  }
  handleOk = (row) => {
    this.props.updateFee(row);
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
