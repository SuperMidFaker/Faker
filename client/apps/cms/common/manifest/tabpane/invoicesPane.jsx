import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Input, Select, message } from 'antd';
import { loadContainers, saveContainer, delContainer } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
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
  record: PropTypes.object.isRequired,
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
ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
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
  { loadContainers, saveContainer, delContainer }
)
export default class InvoicesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    invoices: PropTypes.array,
    billHead: PropTypes.object,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadContainers(this.props.billHead.delg_no);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.billHead !== nextProps.billHead ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'container')) {
      this.props.loadContainers(nextProps.billHead.delg_no);
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
  handleAdd = () => {
    const { billHead } = this.props;
    const addOne = {
      delg_no: billHead.delg_no,
      bill_seq_no: billHead.bill_seq_no,
      creater_login_id: this.props.loginId,
      container_id: '',
      container_wt: 2.2,
      container_spec: '1',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveContainer(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.delContainer(record.id).then((result) => {
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

  render() {
    const columns = [{
      title: this.msg('invoiceNo'),
      dataIndex: 'invoice_no',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_no"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceDate'),
      dataIndex: 'invoice_date',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_date"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('orderNo'),
      dataIndex: 'order_no',
      render: (o, record) =>
        (<ColumnInput
          field="order_no"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceType'),
      dataIndex: 'invoice_type',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_type"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('invoiceStatus'),
      dataIndex: 'invoice_status',
      render: (o, record) =>
        (<ColumnInput
          field="invoice_status"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalAmount'),
      dataIndex: 'total_amount',
      render: (o, record) =>
        (<ColumnInput
          field="total_amount"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalQuant'),
      dataIndex: 'total_quant',
      render: (o, record) =>
        (<ColumnInput
          field="total_quant"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('totalNetWt'),
      dataIndex: 'total_net_wt',
      render: (o, record) =>
        (<ColumnInput
          field="total_net_wt"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('pieces'),
      dataIndex: 'pieces',
      render: (o, record) =>
        (<ColumnInput
          field="pieces"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('grossWt'),
      dataIndex: 'gross_wt',
      render: (o, record) =>
        (<ColumnInput
          field="gross_wt"
          inEdit={!record.id}
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
          <Button type="primary" onClick={this.handleAdd} icon="plus">{this.msg('add')}</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
