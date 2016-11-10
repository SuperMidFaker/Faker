import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import { feeUpdate, feeAdd, feeDelete, saveQuoteModel } from 'common/reducers/cmsQuote';
import messages from './message.i18n';
import RowUpdater from 'client/apps/cms/common/delegation/rowUpdater';
import { CHARGE_MODE, FEE_STYLE } from 'common/constants';
import { Select, Table, Button, Input, Switch, message } from 'antd';

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
  let style = {};
  if (!record.enabled) {
    style = { color: '#CCCCCC' };
  }
  if (record.fee_style === 'cushion') {
    return <span />;
  } else {
    return inEdit ? <Input value={record[field] || ''} disabled={!record.enabled} onChange={handleChange} />
    : <span style={style}>{record[field] || ''}</span>;
  }
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};
function CustomInput(props) {
  const { Edit, record, field, onChange, placeholder } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  let inEdit = false;
  if (record.category === 'custom' && Edit) {
    inEdit = true;
  }
  let style = {};
  if (!record.enabled) {
    style = { color: '#CCCCCC' };
  }
  return inEdit ? <Input value={record[field] || ''} disabled={!record.enabled} placeholder={placeholder} onChange={handleChange} />
    : <span style={style}>{record[field] || ''}</span>;
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
  let style = {};
  if (!(record.invoice_en && record.enabled)) {
    style = { color: '#CCCCCC' };
  }
  return inEdit ? <Input disabled={!(record.invoice_en && record.enabled)} value={record[field] || ''} onChange={handleChange} addonAfter="%" />
  : <span style={style}>{record[field] || ''}%</span>;
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
  return <Switch size="small" disabled={!record.enabled && field !== 'enabled'} checked={record[field]} value={record[field] || true} onChange={handleChange} />;
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
      <Select value={record[field]} disabled={!record.enabled} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    let style = {};
    if (!record.enabled) {
      style = { color: '#CCCCCC' };
    }
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? foundOpts[0].text : '';
    return <span style={style}>{label}</span>;
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
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { feeUpdate, feeAdd, feeDelete, saveQuoteModel }
)
export default class FeesTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.object.isRequired,
    action: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
    feeUpdate: PropTypes.func.isRequired,
    feeAdd: PropTypes.func.isRequired,
    feeDelete: PropTypes.func.isRequired,
    saveQuoteModel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    addedit: false,
    coops: [],
    editIndex: -1,
    count: 0,
  };

  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    if (record.fee_code === 'ALL_IN' && record[field] === true) {
      this.props.quoteData.fees.forEach((fs) => {
        if (fs.fee_code === 'BGF' || fs.fee_code === 'PDF' || fs.fee_code === 'LDF') {
          fs.enabled = false; // eslint-disable-line no-param-reassign
        }
      });
    }
    if (record.fee_code === 'ALL_IN' && record[field] === false) {
      this.props.quoteData.fees.forEach((fs) => {
        if (fs.fee_code === 'BGF' || fs.fee_code === 'PDF' || fs.fee_code === 'LDF') {
          fs.enabled = true; // eslint-disable-line no-param-reassign
        }
      });
    }
    this.forceUpdate();
  }
  handleAddFees = () => {
    const addFee = {
      fee_name: '',
      fee_code: '',
      fee_style: 'service',
      charge_mode: '0',
      lot_num: 1,
      free_num: 0,
      invoice_en: true,
      tax_rate: 6,
      enabled: true,
      category: 'custom',
    };
    this.setState({
      editIndex: this.props.quoteData.fees.length,
      addedit: true,
    });
    this.props.quoteData.fees.push(addFee);
    this.forceUpdate();
  }
  handleModify = (row, index) => {
    this.setState({
      editIndex: index,
    });
  }
  handleSave = (row) => {
    const count = this.state.count + 1;
    const param = {};
    param.quoteId = this.props.quoteData._id;
    param.tenantId = this.props.tenantId;
    param.modifyById = this.props.loginId;
    param.modifyBy = this.props.loginName;
    param.modifyCount = this.props.quoteData.modify_count + count;
    this.setState({
      editIndex: -1,
      addedit: false,
      count,
    });
    if (row._id) {
      this.props.feeUpdate(
        param,
        row,
      ).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功', 5);
        }
      });
    } else {
      this.props.feeAdd(
        param,
        row,
      ).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功', 5);
        }
      });
    }
  }
  handleDelete = (row, index) => {
    const count = this.state.count + 1;
    const param = {};
    param.quoteId = this.props.quoteData._id;
    param.tenantId = this.props.tenantId;
    param.modifyById = this.props.loginId;
    param.modifyBy = this.props.loginName;
    param.modifyCount = this.props.quoteData.modify_count + count;
    this.setState({
      editIndex: -1,
      count,
    });
    this.props.feeDelete(
      param,
      row._id,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
      }
    });
    this.props.quoteData.fees.splice(index, 1);
  }
  handleModelSave = () => {
    this.props.saveQuoteModel(
      this.props.tenantId,
      this.props.quoteData.fees
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handleMdlFeeDelete = (row, index) => {
    const count = this.state.count + 1;
    this.setState({
      editIndex: -1,
      count,
    });
    this.props.quoteData.fees.splice(index, 1);
  }

  render() {
    const { quoteData, action, editable } = this.props;
    const { editIndex, addedit } = this.state;
    const msg = key => formatMsg(this.props.intl, key);
    const dataSource = quoteData.fees;
    const columns = [
      {
        title: msg('serialNo'),
        width: 50,
        render: (o, record, index) => {
          return <span>{index + 1}</span>;
        },
      }, {
        title: msg('feeName'),
        dataIndex: 'fee_name',
        width: 150,
        render: (o, record, index) =>
          <CustomInput field="fee_name" Edit={addedit && (index === editIndex)} placeholder="自定义费用名称" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeCode'),
        dataIndex: 'fee_code',
        width: 150,
        render: (o, record, index) =>
          <CustomInput field="fee_code" Edit={addedit && (index === editIndex)} placeholder="自定义费用代码" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeStyle'),
        dataIndex: 'fee_style',
        width: 150,
        render: (o, record, index) =>
          <ColumnSelect field="fee_style" inEdit={editable || (index === editIndex)} record={record}
            onChange={this.handleEditChange} options={FEE_STYLE}
          />,
      }, {
        title: msg('chargeMode'),
        dataIndex: 'charge_mode',
        width: 150,
        render: (o, record, index) =>
          <ColumnSelect field="charge_mode" inEdit={editable || (index === editIndex)} record={record}
            onChange={this.handleEditChange} options={CHARGE_MODE}
          />,
      }, {
        title: msg('lotNum'),
        dataIndex: 'lot_num',
        width: 100,
        render: (o, record, index) =>
          <ColumnInput field="lot_num" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('freeNum'),
        dataIndex: 'free_num',
        width: 100,
        render: (o, record, index) =>
          <ColumnInput field="free_num" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('unitPrice'),
        dataIndex: 'unit_price',
        width: 150,
        render: (o, record, index) =>
          <ColumnInput field="unit_price" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('invoiceEn'),
        dataIndex: 'invoice_en',
        width: 80,
        render: (o, record) =>
          <ColumnSwitch field="invoice_en" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 100,
        render: (o, record, index) =>
          <TaxInput field="tax_rate" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('enabledOp'),
        dataIndex: 'enabled',
        width: 80,
        render: (o, record) =>
          <ColumnSwitch field="enabled" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('operation'),
        width: 80,
        render: (o, record, index) => {
          if (record.category === 'custom' && action === 'create') {
            return (
              <RowUpdater onHit={this.handleDelete} label={msg('delete')} row={record} index={index} />
            );
          } else if (action === 'edit') {
            if (index === editIndex) {
              return (
                <RowUpdater onHit={this.handleSave} label={msg('save')} row={record} index={index} />
              );
            } else if (record.category === 'custom') {
              return (
                <span>
                  <RowUpdater onHit={this.handleModify} label={msg('modify')} row={record} index={index} />
                  <span className="ant-divider" />
                  <RowUpdater onHit={this.handleDelete} label={msg('delete')} row={record} index={index} />
                </span>
              );
            } else if (record.category !== 'custom') {
              return (
                <RowUpdater onHit={this.handleModify} label={msg('modify')} row={record} index={index} />
              );
            }
          } else if (record.category === 'custom' && action === 'model') {
            return (
              <RowUpdater onHit={this.handleMdlFeeDelete} label={msg('delete')} row={record} index={index} />
            );
          } else {
            return <span />;
          }
        },
      },
    ];
    return (
      <Table pagination={false} rowKey={getRowKey} columns={columns} dataSource={dataSource} loading={quoteData.loading} size="middle" scroll={{ y: 500 }}
        title={() => (action === 'model') && <Button type="primary" size="large" onClick={this.handleModelSave}>{msg('save')}</Button>}
        footer={() => (action === 'model') && <Button type="primary" onClick={this.handleAddFees}>{msg('addCosts')}</Button>}
      />
    );
  }
}
