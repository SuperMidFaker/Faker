import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { format } from 'client/common/i18n/helpers';
import { feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote } from 'common/reducers/cmsQuote';
import messages from './message.i18n';
import RowAction from 'client/components/RowAction';
import { CHARGE_PARAM, FEE_STYLE, FEE_CATEGORY } from 'common/constants';
import { Select, Table, Button, Input, Switch, message, Mention } from 'antd';

const formatMsg = format(messages);
const Option = Select.Option;
const Nav = Mention.Nav;

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
  if (record.fee_style === 'advance' && field !== 'fee_name') {
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
  const { record, field, onChange, inEdit } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  let style = {};
  if (!(record.invoice_en && record.enabled)) {
    style = { color: '#CCCCCC' };
  }
  if (inEdit) {
    return <Switch size="small" disabled={(!record.enabled && field !== 'enabled')} checked={record[field]} value={record[field] || true} onChange={handleChange} />;
  } else {
    const val = record[field] ? '是' : '否';
    return <span style={style}>{val}</span>;
  }
}
ColumnSwitch.propTypes = {
  inEdit: PropTypes.bool,
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
  if (record.fee_style === 'advance' && field === 'charge_param') {
    return <span />;
  }
  if (inEdit) {
    return (
      <Select value={record[field]} disabled={!record.enabled} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map(opt => <Option value={opt.value} key={opt.value}>{opt.text}</Option>)
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
  { feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote }
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
    dataSource: [],
    editable: false,
    batchSaved: 0,
    suggestions: [],
  };
  componentWillMount() {
    this.setState({ dataSource: this.props.quoteData.fees, editable: this.props.editable });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.quoteData !== this.props.quoteData) {
      this.setState({ dataSource: nextProps.quoteData.fees });
    }
  }
  formulaParams = [
    { value: 'shipmt_qty', text: '运单数量' },
    { value: 'decl_qty', text: '报关单数量' },
    { value: 'decl_sheet_qty', text: '报关单联数' },
    { value: 'decl_item_qty', text: '品名数量' },
    { value: 'trade_item_qty', text: '料件数量' },
    { value: 'trade_amt', text: '货值' },
    { value: 'cert_qty', text: '证书数量' },
  ];
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
      charge_param: 'shipmt_qty',
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
          message.success('保存成功', 5);
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
          message.success('保存成功', 5);
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
  handleCancel = () => {
    this.setState({
      editIndex: -1,
    });
    if (this.props.quoteData.status === 'draft') {
      this.props.loadEditQuote(this.props.quoteData.quote_no, this.props.quoteData.version);
    } else {
      this.props.loadEditQuote(this.props.quoteData.quote_no, this.props.quoteData.next_version);
    }
  }
  handleMdlFeeDelete = (row, index) => {
    const count = this.state.count + 1;
    this.setState({
      editIndex: -1,
      count,
    });
    this.props.quoteData.fees.splice(index, 1);
  }
  handleTableChange = (pagination, filters) => {
    if (filters.category || filters.fee_style) {
      const data = this.props.quoteData.fees;
      let fees = [];
      let catgfees = [];
      let stylfees = [];
      if (filters.category) {
        for (let i = 0; i < filters.category.length; i++) {
          const factor = filters.category[i];
          catgfees = catgfees.concat(data.filter(da => da.category === factor));
        }
      }
      if (filters.fee_style) {
        for (let i = 0; i < filters.fee_style.length; i++) {
          const factor = filters.fee_style[i];
          stylfees = stylfees.concat(data.filter(da => da.fee_style === factor));
        }
      }
      if (catgfees.length > 0 && stylfees.length > 0) {
        catgfees.forEach((fe) => {
          fees = fees.concat(stylfees.filter(sf =>
            (sf.category === fe.category && sf.fee_code === fe.fee_code))
          );
        });
      } else {
        fees = catgfees.length > 0 ? catgfees : stylfees;
        if (fees.length === 0) {
          fees = data;
        }
      }
      this.setState({ dataSource: fees });
    }
  }
  handlebatchSave = () => {
    this.setState({ editable: this.props.editable, batchSaved: 0 });
    this.props.saveQuoteBatchEdit(
      this.props.quoteData
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handlebatchCancel = () => {
    this.setState({ editable: this.props.editable, batchSaved: 0 });
    if (this.props.quoteData.status === 'draft') {
      this.props.loadEditQuote(this.props.quoteData.quote_no, this.props.quoteData.version);
    } else {
      this.props.loadEditQuote(this.props.quoteData.quote_no, this.props.quoteData.next_version);
    }
  }
  handlebatchModify = () => {
    this.setState({ editable: true, batchSaved: 1 });
  }

  handleBatchEnChange = (key, value) => {
    if (key === 'invoiceEn') {
      this.props.quoteData.fees.forEach((fs) => {
        fs.invoice_en = value; // eslint-disable-line no-param-reassign
      });
    }
    if (key === 'enabled') {
      this.props.quoteData.fees.forEach((fs) => {
        fs.enabled = value; // eslint-disable-line no-param-reassign
      });
    }
    this.forceUpdate();
  }
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = this.formulaParams.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1
    );
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  handleonChange = (record, editorState) => {
    record.formula_factor = Mention.toString(editorState); // eslint-disable-line no-param-reassign
  }
  renderToolbar = () => {
    const { action } = this.props;
    const msg = key => formatMsg(this.props.intl, key);
    if (action === 'edit') {
      return (
        <div className="toolbar">
          <Button type="default" icon="plus-circle-o" style={{ marginRight: 8 }} onClick={this.handleAddFees}>{msg('addCosts')}</Button>
          {this.state.batchSaved === 0 && <Button icon="edit" onClick={this.handlebatchModify}>{msg('batchModify')}</Button>}
          {this.state.batchSaved === 1 && <Button type="primary" style={{ marginRight: 8 }} onClick={this.handlebatchSave}>{msg('confirm')}</Button>}
          {this.state.batchSaved === 1 && <Button type="ghost" onClick={this.handlebatchCancel}>{msg('cancel')}</Button>}
        </div>
      );
    } else if (action === 'model') {
      return (
        <div className="toolbar">
          <Button type="primary" onClick={this.handleModelSave}>{msg('save')}</Button>
        </div>
      );
    }
  }
  render() {
    const { quoteData, action } = this.props;
    const { editIndex, addedit, dataSource, editable, batchSaved } = this.state;
    const msg = key => formatMsg(this.props.intl, key);
    const columns = [
      {
        title: msg('serialNo'),
        width: 50,
        render: (o, record, index) => <span>{index + 1}</span>,
      }, {
        title: msg('feeName'),
        dataIndex: 'fee_name',
        width: 150,
        render: (o, record, index) =>
          <ColumnInput field="fee_name" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeCode'),
        dataIndex: 'fee_code',
        width: 150,
        render: (o, record, index) =>
          <CustomInput field="fee_code" Edit={addedit && (index === editIndex)} placeholder="自定义费用代码" record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('feeCategory'),
        dataIndex: 'category',
        filters: [
          { text: '代理', value: 'agency_expenses' },
          { text: '报关', value: 'customs_expenses' },
          { text: '报检', value: 'ciq_expenses' },
          { text: '鉴定办证', value: 'certs_expenses' },
          { text: '杂项', value: 'misc_expenses' },
        ],
        width: 150,
        render: (o, record, index) =>
          (<ColumnSelect field="category" inEdit={editable || (index === editIndex)} record={record}
            onChange={this.handleEditChange} options={FEE_CATEGORY}
          />),
      }, {
        title: msg('feeStyle'),
        dataIndex: 'fee_style',
        filters: [
          { text: '服务', value: 'service' },
          { text: '代垫', value: 'advance' },
        ],
        width: 150,
        render: (o, record, index) =>
          (<ColumnSelect field="fee_style" inEdit={editable || (index === editIndex)} record={record}
            onChange={this.handleEditChange} options={FEE_STYLE}
          />),
      }, {
        title: msg('chargeParam'),
        dataIndex: 'charge_param',
        width: 150,
        render: (o, record, index) =>
          (<ColumnSelect field="charge_param" inEdit={editable || (index === editIndex)} record={record}
            onChange={this.handleEditChange} options={CHARGE_PARAM}
          />),
      }, {
        title: msg('formulaFactor'),
        dataIndex: 'formula_factor',
        width: 150,
        render: (o, record, index) => {
          const inEdit = editable || (index === editIndex);
          if (record.charge_param === '$formula' && inEdit) {
            return (<Mention suggestions={this.state.suggestions} prefix="$" onSearchChange={this.handleSearch} defaultValue={Mention.toContentState(o)}
              placeholder="$公式" onChange={editorState => this.handleonChange(record, editorState)} multiLines style={{ width: '100%', height: '100%' }}
            />);
          } else {
            return <ColumnInput field="formula_factor" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />;
          }
        },
      }, {
        title: (
          <div>
            {msg('invoiceEn')}
            {batchSaved === 1 && <Switch size="small" onChange={value => this.handleBatchEnChange('invoiceEn', value)} />}
          </div>
        ),
        dataIndex: 'invoice_en',
        width: 80,
        render: (o, record, index) =>
          <ColumnSwitch field="invoice_en" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 100,
        render: (o, record, index) =>
          <TaxInput field="tax_rate" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }, {
        title: (
          <div>
            {msg('enabledOp')}
            {batchSaved === 1 && <Switch size="small" onChange={value => this.handleBatchEnChange('enabled', value)} />}
          </div>
        ),
        dataIndex: 'enabled',
        width: 80,
        render: (o, record, index) =>
          <ColumnSwitch field="enabled" inEdit={editable || (index === editIndex)} record={record} onChange={this.handleEditChange} />,
      }];
    if (action !== 'view') {
      columns.push({
        title: msg('operation'),
        width: 80,
        render: (o, record, index) => {
          if (record.category === 'custom' && action === 'create') {
            return (
              <RowAction onClick={this.handleDelete} label={msg('delete')} row={record} index={index} />
            );
          } else if (action === 'edit' && batchSaved === 0) {
            if (index === editIndex) {
              return (
                <span>
                  <RowAction onClick={this.handleSave} label={msg('confirm')} row={record} index={index} />
                  <span className="ant-divider" />
                  <RowAction onClick={this.handleCancel} label={msg('cancel')} />
                </span>
              );
            } else if (record.category === 'custom') {
              return (
                <span>
                  <RowAction onClick={this.handleModify} label={msg('modify')} row={record} index={index} />
                  <span className="ant-divider" />
                  <RowAction onClick={this.handleDelete} label={msg('delete')} row={record} index={index} />
                </span>
              );
            } else if (record.category !== 'custom') {
              return (
                <RowAction onClick={this.handleModify} label={msg('modify')} row={record} index={index} />
              );
            }
          } else if (action === 'edit' && batchSaved === 1) {
            if (record.category === 'custom') {
              return (
                <RowAction onClick={this.handleDelete} label={msg('delete')} row={record} index={index} />
              );
            }
          } else if (record.category === 'custom' && action === 'model') {
            return (
              <RowAction onClick={this.handleMdlFeeDelete} label={msg('delete')} row={record} index={index} />
            );
          } else {
            return <span />;
          }
        },
      });
    }
    return (
      <div>
        {this.renderToolbar()}
        <Table pagination={false} rowKey={getRowKey} columns={columns} dataSource={dataSource}
          loading={quoteData.loading} onChange={this.handleTableChange} scroll={{ y: 450 }}
          footer={() => (action === 'model') && <Button type="primary" onClick={this.handleAddFees}>{msg('addCosts')}</Button>}
        />
      </div>
    );
  }
}
