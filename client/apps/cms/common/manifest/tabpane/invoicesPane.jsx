import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Input, Select, message, DatePicker } from 'antd';
import { loadInvoices, addInvoice, deleteInvoice, updateInvoice } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import moment from 'moment';
import messages from './message.i18n';

const { Option } = Select;
const formatMsg = format(messages);

function ColumnInput(props) {
  const {
    inEdit, record, field, onChange,
  } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  return inEdit ? <Input value={record[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({
    id: PropTypes.number,
    invoice_no: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
function ColumnSelect(props) {
  const {
    inEdit, record, field, options, onChange,
  } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={record[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map(opt =>
            <Option value={opt.text} key={opt.value}>{opt.value} | {opt.text}</Option>)
        }
      </Select>
    );
  }
  const option = options.find(item => item.value === record[field]);
  return <span>{option ? option.text : ''}</span>;
}
ColumnSelect.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({
    id: PropTypes.number,
    invoice_no: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({
  })),
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    tabKey: state.cmsManifest.tabKey,
    billHead: state.cmsManifest.billHead,
    invoices: state.cmsManifest.invoices,
  }),
  {
    loadInvoices, addInvoice, deleteInvoice, updateInvoice,
  }
)
export default class InvoicesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    invoices: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      invoice_no: PropTypes.string,
    })),
    billHead: PropTypes.shape({
      delg_no: PropTypes.string,
      bill_seq_no: PropTypes.string,
    }),
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadInvoices(this.props.billHead.delg_no);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.billHead !== nextProps.billHead ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'invoice')) {
      this.props.loadInvoices(nextProps.billHead.delg_no);
    }
    if (this.props.invoices !== nextProps.invoices) {
      this.setState({ datas: nextProps.invoices });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleDateChange = (data, dataString, record) => {
    record.invoice_date = dataString; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const { billHead } = this.props;
    const addOne = {
      delg_no: billHead.delg_no,
      bill_seq_no: billHead.bill_seq_no,
      edit: true,
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.addInvoice(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
        this.props.loadInvoices(this.props.billHead.delg_no);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.deleteInvoice(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  handleCancel = (record, index) => {
    const datas = [...this.state.datas];
    datas.splice(index, 1);
    this.setState({ datas });
  }
  handleEdit = (index) => {
    const datas = [...this.state.datas];
    datas[index].edit = true;
    this.setState({
      datas,
    });
  }
  handleUpdate = (record, index) => {
    this.props.updateInvoice(record).then((result) => {
      if (!result.error) {
        message.info('保存成功', 5);
        const datas = [...this.state.datas];
        datas[index].edit = false;
        this.setState({
          datas,
        });
      }
    });
  }
  render() {
    const columns = [{
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_no"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceDate'),
      dataIndex: 'invoice_date',
      render: (o, record) => (<DatePicker
        defaultValue={record.invoice_date ? moment(record.invoice_date, 'YYYY-MM-DD') : ''}
        disabled={!record.edit}
        onChange={(data, dataString) => this.handleDateChange(data, dataString, record)}
      />),
    }, {
      title: this.msg('orderNo'),
      dataIndex: 'order_no',
      render: (o, record) =>
        (<ColumnInput
          field="order_no"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceType'),
      dataIndex: 'invoice_type',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_type"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceStatus'),
      dataIndex: 'invoice_status',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_status"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalAmount'),
      dataIndex: 'total_amount',
      render: (o, record) =>
        (<ColumnInput
          field="total_amount"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalQuant'),
      dataIndex: 'total_quant',
      render: (o, record) =>
        (<ColumnInput
          field="total_quant"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalNetWt'),
      dataIndex: 'total_net_wt',
      render: (o, record) =>
        (<ColumnInput
          field="total_net_wt"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('pieces'),
      dataIndex: 'pieces',
      render: (o, record) =>
        (<ColumnInput
          field="pieces"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('grossWt'),
      dataIndex: 'gross_wt',
      render: (o, record) =>
        (<ColumnInput
          field="gross_wt"
          inEdit={record.edit}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      width: 100,
      fixed: 'right',
      render: (o, record, index) => {
        if (record.id) {
          return (<span>
            <RowAction shape="circle" danger confirm="确定删除?" onConfirm={() => this.handleDelete(record, index)} icon="delete" row={record} />
            {record.edit ? (
              <RowAction shape="circle" primary onClick={() => this.handleUpdate(record, index)} icon="save" tooltip="保存" row={record} />
            ) : (
              <RowAction shape="circle" onClick={() => this.handleEdit(index)} icon="edit" row={record} />
            )}
          </span>);
        }
        return (<span>
          <RowAction shape="circle" primary onClick={this.handleSave} icon="save" tooltip="保存" row={record} />
          <RowAction shape="circle" onClick={() => this.handleCancel(record, index)} icon="close" tooltip="取消" row={record} />
        </span>);
      },
    }];
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        bordered
        scrollOffset={312}
        dataSource={this.state.datas}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" ghost onClick={this.handleAdd} icon="plus">{this.msg('add')}</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
