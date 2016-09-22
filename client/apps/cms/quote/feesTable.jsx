import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CHARGE_MODE, FEE_STYLE } from 'common/constants';
import { Select, Table, Button, Input, Switch } from 'antd';

const formatMsg = format(messages);
const Option = Select.Option;

function getRowKey(row) {
  return row.id;
}
function ColumnInput(props) {
  const { inEdit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  if (record.fee_style === 1) {
    return <span></span>;
  } else {
    return inEdit ? <Input value={record[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
  }
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
function CustomInput(props) {
  const { record, field, onChange, placeholder } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  let inEdit = false;
  if (record.category === 'custom') {
    inEdit = true;
  }
  return inEdit ? <Input value={record[field] || ''} placeholder={placeholder} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
CustomInput.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
};
function TaxInput(props) {
  const { inEdit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  return inEdit ? <Input disabled={!record.invoice_en} value={record[field] || ''} onChange={handleChange} addonAfter="%" />
  : <span>{record[field] || ''}</span>;
}
TaxInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
function ColumnSwitch(props) {
  const { record, field, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  return <Switch size="small" defaultChecked={record[field]} value={record[field] || true} onChange={handleChange} />;
}
ColumnSwitch.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
function ColumnSelect(props) {
  const { inEdit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={record[field]} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? foundOpts[0].text : '';
    return <span>{label}</span>;
  }
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
    quoteData: state.cmsQuote.quoteData,
  }),
)
export default class FeesTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    addFee: {},
    addedit: false,
    coops: [],
    disBase: false,
  };
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAddFees = () => {
    const addFee = {
      fee_name: '',
      fee_code: '',
      fee_style: 0,
      charge_mode: 0,
      lot_num: 1,
      free_num: 0,
      invoice_en: true,
      tax_rate: 6,
      enabled: true,
      category: 'custom',
    };
    this.setState({ addFee, addedit: true });
    this.props.quoteData.fees.push(addFee);
    this.forceUpdate();
  }
  render() {
    const { quoteData } = this.props;
    const msg = key => formatMsg(this.props.intl, key);
    const dataSource = this.props.quoteData.fees;
    const columns = [
      {
        title: msg('serialNo'),
        dataIndex: 'key',
        width: 60,
      }, {
        title: msg('feeName'),
        dataIndex: 'fee_name',
        width: 100,
        render: (o, record) =>
          <CustomInput field="fee_name" placeholder="自定义费用名称" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeCode'),
        dataIndex: 'fee_code',
        width: 100,
        render: (o, record) =>
          <CustomInput field="fee_code" placeholder="自定义费用代码" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeStyle'),
        dataIndex: 'fee_style',
        width: 150,
        render: (o, record) =>
        <ColumnSelect field="fee_style" inEdit record={record}
          onChange={this.handleEditChange} options={FEE_STYLE}
        />,
      }, {
        title: msg('chargeMode'),
        dataIndex: 'charge_mode',
        width: 150,
        render: (o, record) =>
        <ColumnSelect field="charge_mode" inEdit record={record}
          onChange={this.handleEditChange} options={CHARGE_MODE}
        />,
      }, {
        title: msg('lotNum'),
        dataIndex: 'lot_num',
        width: 150,
        render: (o, record) =>
          <ColumnInput field="lot_num" inEdit record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('freeNum'),
        dataIndex: 'free_num',
        width: 150,
        render: (o, record) =>
          <ColumnInput field="free_num" inEdit record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('unitPrice'),
        dataIndex: 'unit_price',
        width: 150,
        render: (o, record) =>
          <ColumnInput field="unit_price" inEdit record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('invoiceEn'),
        dataIndex: 'invoice_en',
        width: 60,
        render: (o, record) =>
          <ColumnSwitch field="invoice_en" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 150,
        render: (o, record) =>
          <TaxInput field="tax_rate" inEdit record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('enabledOp'),
        dataIndex: 'enabled',
        width: 60,
        render: (o, record) =>
          <ColumnSwitch field="enabled" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('operation'),
        dataIndex: 'operation',
        width: 60,
      },
    ];
    return (
      <div className="page-body">
        <div className="panel-body table-panel">
          <Table bordered pagination={false} rowKey={getRowKey} columns={columns} dataSource={dataSource} loading={quoteData.loading} />
          <div style={{ padding: 20 }}>
            <Button type="primary" onClick={this.handleAddFees}>{msg('addCosts')}</Button>
          </div>
        </div>
      </div>
    );
  }
}
