import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Table, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../form/message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange, type, autosize, decimal } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  const typeStr = (!type) ? 'text' : type;
  if (inEdit) {
    return (<Input type={typeStr} autosize={autosize} value={edit[field] || ''} onChange={handleChange} />);
  } else if (decimal) {
    return <span>{record[field] ? parseFloat(record[field]).toFixed(decimal) : ''}</span>;
  } else {
    return <span>{record[field] || ''}</span>;
  }
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  edit: PropTypes.object,
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text', 'textarea']),
  autosize: PropTypes.bool,
  decimal: PropTypes.number,
};

function ColumnSelect(props) {
  const { inEdit, edit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select showSearch showArrow optionFilterProp="search" value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option search={`${opt.search}`} value={opt.value} key={`${opt.value}${idx}`}>{`${opt.value}|${opt.text}`}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? `${foundOpts[0].value}|${foundOpts[0].text}` : '';
    return <span>{label}</span>;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  edit: PropTypes.object,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

function calculateTotal(bodies) {
  let totGrossWt = 0;
  let totWetWt = 0;
  let totTrade = 0;
  let totPcs = 0;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.gross_wt) {
      totGrossWt += Number(body.gross_wt);
    }
    if (body.wet_wt) {
      totWetWt += Number(body.wet_wt);
    }
    if (body.trade_total) {
      totTrade += Number(body.trade_total);
    }
    if (body.qty_pcs) {
      totPcs += Number(body.qty_pcs);
    }
  }
  return { totGrossWt, totWetWt, totTrade, totPcs };
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
      search: `${un.unit_code}${un.unit_name}`,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
      search: `${cr.curr_code}${cr.curr_symb}${cr.curr_name}`,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
      search: `${ep.value}${ep.text}`,
    })),
    loginId: state.account.loginId,
    billHead: state.cmsManifest.billHead,
    bodyItem: state.cmsTradeitem.bodyItem,
    bodyHscode: state.cmsTradeitem.bodyHscode,
    entryHead: state.cmsManifest.entryHead,
  })
)
export default class CDFBodyPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    data: PropTypes.array.isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loginId: PropTypes.number.isRequired,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    exemptions: PropTypes.array,
    billHead: PropTypes.object,
    entryHead: PropTypes.object,
    bodyItem: PropTypes.object,
    bodyHscode: PropTypes.object,
    headForm: PropTypes.object,
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    const calresult = calculateTotal(bodies);
    this.state = {
      editIndex: -1,
      editBody: {},
      bodies,
      totGrossWt: calresult.totGrossWt,
      totWetWt: calresult.totWetWt,
      totTrade: calresult.totTrade,
      totPcs: calresult.totPcs,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: true,
        onChange: this.handlePageChange,
      },
    };
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ wlScrollY: window.innerHeight - 320 });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      const calresult = calculateTotal(bodies);
      this.setState({
        bodies,
        totGrossWt: calresult.totGrossWt,
        totWetWt: calresult.totWetWt,
        totTrade: calresult.totTrade,
        totPcs: calresult.totPcs,
        pagination: { ...this.state.pagination, total: bodies.length },
      });
    }
    if (nextProps.bodyItem !== this.props.bodyItem) {
      const item = nextProps.bodyItem;
      if (item) {
        const unit1 = this.props.units.filter(unit => unit.value === item.unit_1)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.value === item.unit_2)[0];
        const unit2Val = unit2 ? unit2.value : '';
        const unitg = this.props.units.filter(unit => unit.value === item.g_unit)[0];
        const gunitVal = unitg ? unitg.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: item.hscode,
            g_name: item.g_name,
            g_model: item.g_model,
            element: item.element,
            g_unit: gunitVal,
            unit_1: unit1Val,
            unit_2: unit2Val,
            fixed_unit: item.fixed_unit,
            fixed_qty: item.fixed_qty,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            codes: '',
            g_name: '',
            g_model: '',
            element: '',
            g_unit: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
    if (nextProps.bodyHscode !== this.props.bodyHscode) {
      const hscode = nextProps.bodyHscode;
      if (hscode) {
        const unit1 = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
        const unit1Val = unit1 ? unit1.value : '';
        const unit2 = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
        const unit2Val = unit2 ? unit2.value : '';
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: hscode.product_name,
            element: hscode.declared_elements,
            unit_1: unit1Val,
            unit_2: unit2Val,
          },
        });
      } else {
        this.setState({
          editBody: {
            ...this.state.editBody,
            g_name: '',
            element: '',
            unit_1: '',
            unit_2: '',
          },
        });
      }
    }
  }

  getColumns() {
    const { units, countries, currencies, exemptions } = this.props;
    const { editIndex, editBody } = this.state;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      fixed: 'left',
      width: 45,
    }, {
      title: this.msg('codeT'),
      width: 110,
      fixed: 'left',
      render: (o, record, index) =>
        <ColumnInput field="codes" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record, index) =>
        <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('gModel'),
      width: 300,
      render: (o, record, index) =>
        <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('quantity')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="g_qty" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('unit'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          options={units} edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('decPrice')}</div>,
      width: 100,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('decTotal')}</div>,
      width: 100,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="trade_total" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('currency'),
      width: 100,
      render: (o, record, index) =>
        <ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          options={currencies} edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('qty1')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="qty_1" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('unit1'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="unit_1" inEdit={index === editIndex} record={record}
          options={units} edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('qty2')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="qty_2" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('unit2'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="unit_2" inEdit={index === editIndex} record={record}
          options={units} edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('grosswt')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: <div className="cell-align-right">{this.msg('netwt')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="duty_mode" inEdit={index === editIndex} record={record}
          options={exemptions} edit={editBody}
        />,
    }, {
      title: this.msg('ecountry'),
      width: 120,
      render: (o, record, index) =>
        <ColumnSelect field="dest_country" inEdit={index === editIndex} record={record}
          options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('icountry'),
      width: 120,
      render: (o, record, index) =>
        <ColumnSelect field="orig_country" inEdit={index === editIndex} record={record}
          options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('qtyPcs'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="qty_pcs" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('unitPcs'),
      width: 100,
      render: (o, record, index) =>
        <ColumnSelect field="unit_pcs" inEdit={index === editIndex} record={record}
          options={units} edit={editBody}
        />,
    }, {
      title: this.msg('customs'),
      width: 100,
      dataIndex: 'customs',
    }, {
      title: this.msg('inspection'),
      width: 100,
      dataIndex: 'inspection',
    }, {
      title: this.msg('element'),
      render: (o, record, index) =>
        <ColumnInput field="element" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('versionNo'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="version_no" inEdit={index === editIndex} record={record}
          edit={editBody}
        />,
    }, {
      title: this.msg('processingFees'),
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        <ColumnInput field="processing_fees" inEdit={index === editIndex} record={record}
          edit={editBody} decimal={3}
        />,
    }];
    return columns;
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleEntrybodyExport = () => {
    const preSeqNo = this.props.entryHead.pre_entry_seq_no;
    const timestamp = Date.now().toString().substr(-6);
    window.open(`${API_ROOTS.default}v1/cms/manifest/declare/export/entry_${preSeqNo}_${timestamp}.xlsx?headId=${this.props.headNo}`);
  }

  render() {
    const { totGrossWt, totWetWt, totTrade } = this.state;
    const columns = this.getColumns();
    const stats = (<div><span style={{ marginLeft: 8 }}>总毛重: </span><span style={{ color: '#FF9933' }}>{totGrossWt.toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>总净重: </span><span style={{ color: '#FF9933' }}>{totWetWt.toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>总金额: </span><span style={{ color: '#FF9933' }}>{totTrade.toFixed(3)}</span></div>);
    return (
      <div className="pane">
        <div className="panel-header">
          <Button icon="export" onClick={this.handleEntrybodyExport}>导出表体数据</Button>
          <div className="toolbar-right">
            <Alert message={stats} type="info" />
          </div>
        </div>
        <div className="panel-body table-panel">
          <Table rowKey="id" columns={columns} dataSource={this.state.bodies}
            scroll={{ x: 2800, y: this.state.wlScrollY }} pagination={this.state.pagination}
          />
        </div>
      </div>);
  }
}
