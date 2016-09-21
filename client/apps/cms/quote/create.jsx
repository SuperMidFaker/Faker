import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { submitQuotes } from 'common/reducers/cmsQuote';
import { DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE, TARIFF_KINDS, CHARGE_MODE, FEE_STYLE } from 'common/constants';
import { Form, Select, Col, Row, Table, Card, Button, Input, Switch, message } from 'antd';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

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
    tenantId: state.account.tenantId,
    partners: state.cmsQuote.partners,
    clients: state.cmsQuote.clients,
    quoteData: state.cmsQuote.quoteData,
  }),
  { submitQuotes }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'newPrice'),
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
@Form.create()
export default class QuotingCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    partners: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
    quoteData: PropTypes.object.isRequired,
    submitQuotes: PropTypes.func.isRequired,
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
  handleClientChange = (value) => {
    if (typeof value === 'string') {
      return value;
    }
    const selPartnerId = Number(value);
    const partners = this.props.partners.filter(cl => cl.partner_id === selPartnerId);
    if (partners.length === 1) {
      const partner = partners[0];
      return partner.name;
    }
    return value;
  }
  handleEditChange = (record, field, value) => {
    record[field] = value;
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
  handleKindSelect = (value) => {
    const tariffKind = value;
    if (tariffKind === 'sales') {
      this.setState({ coops: this.props.clients, disBase: false });
    } else if (tariffKind === 'cost') {
      this.setState({ coops: this.props.partners, disBase: false });
    } else {
      this.setState({ disBase: true });
    }
  }
  handleSave = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    quoteData.tenantId = this.props.tenantId;
    const prom = this.props.submitQuotes(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
        this.context.router.push('/clearance/quote');
      }
    });
  }
  render() {
    const { form: { getFieldProps }, quoteData } = this.props;
    const { coops, disBase } = this.state;
    const msg = key => formatMsg(this.props.intl, key);
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
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
      <div>
        <header className="top-bar">
          <span>新建报价</span>
          <div className="tools">
            <Button type="primary" onClick={this.handleSave} >{msg('save')}</Button>
          </div>
        </header>
        <div className="main-content">
          <Card bodyStyle={{ padding: 16 }}>
            <Row>
              <Col sm={5}>
                <FormItem label={msg('tariffKinds')} {...formItemLayout}>
                  <Select style={{ width: '80%' }} onSelect={this.handleKindSelect}
                    {...getFieldProps('tariff_kind', {
                      rules: [{ required: true, message: '报价类型必选' }],
                    })}
                  >
                  {
                    TARIFF_KINDS.map(qt =>
                      <Option value={qt.value} key={qt.value}>{qt.text}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={5}>
                <FormItem label={msg('partners')} {...formItemLayout}>
                  <Select showSearch showArrow optionFilterProp="searched"
                    style={{ width: '80%' }} disabled={disBase}
                    {...getFieldProps('partners', {
                      rules: [{ required: true, message: '必选' }],
                      getValueFromEvent: this.handleClientChange,
                    })}
                  >
                  {
                    coops.map(pt => (
                      <Option searched={`${pt.partner_code}${pt.name}`}
                        value={pt.partner_id} key={pt.partner_id}
                      >{pt.name}</Option>)
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={5}>
                <FormItem label={msg('declareWay')} {...formItemLayout}>
                  <Select multiple style={{ width: '80%' }} placeholder="不限"
                    {...getFieldProps('decl_way_code', {
                      rules: [{ required: true, message: '报关类型必选', type: 'array' }],
                    })}
                  >
                  {
                    DECL_TYPE.map(dw =>
                      <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={5}>
                <FormItem label={msg('transMode')} {...formItemLayout}>
                  <Select multiple style={{ width: '80%' }} placeholder="不限"
                    {...getFieldProps('trans_mode', {
                      rules: [{ required: true, message: '运输方式必选', type: 'array' }],
                    })}
                  >
                  {
                    TRANS_MODE.map(tr =>
                      <Option value={tr.value} key={tr.value}>{tr.text}</Option>
                    )
                  }
                  </Select>
                </FormItem>
              </Col>
              <Col sm={4}>
                <FormItem label={msg('remark')} {...formItemLayout}>
                  <Select tags style={{ width: '80%' }}
                    {...getFieldProps('remarks')}
                  >
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table bordered pagination={false} rowKey={getRowKey} columns={columns} dataSource={dataSource} loading={quoteData.loading} />
              <div style={{ padding: 20 }}>
                <Button type="primary" onClick={this.handleAddFees}>{msg('addCosts')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
