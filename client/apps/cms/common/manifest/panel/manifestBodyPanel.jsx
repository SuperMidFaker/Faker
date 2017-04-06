import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Dropdown, Menu, Table, Icon, Tooltip, Tag, Input, Select, message, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateHeadNetWt, loadBillBody, openAmountModel, deleteSelectedBodies, openRuleModel } from 'common/reducers/cmsManifest';
import { getItemForBody, getHscodeForBody } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import ExcelUpload from 'client/components/excelUploader';
import { createFilename } from 'client/util/dataTransform';
import AmountModel from '../modals/amountDivid';
import RowUpdater from 'client/components/rowUpdater';
import messages from '../../form/message.i18n';
import RelateImportRuleModal from '../modals/relateImportRules';
import { loadHscodes } from 'common/reducers/cmsHsCode';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange, type, autosize } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  const typeStr = (!type) ? 'text' : type;
  if (inEdit) {
    return (<Input type={typeStr} autosize={autosize} value={edit[field] || ''} onChange={handleChange} />);
  } else if (field === 'cop_g_no' && record.feedback === 'noMatch') {
    return (<Tooltip title="物料库中未对该货号归类">
      <Tag color="red">{record[field] || ''}</Tag>
    </Tooltip>);
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

function ColumnSearchSelect(props) {
  const { inEdit, edit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select mode="combobox" optionFilterProp="search" value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option search={`${opt.search}`} value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else if (record.feedback === 'wrongHs') {
    return (<Tooltip title="错误的商品编码">
      <Tag color="red">{record[field] || ''}</Tag>
    </Tooltip>);
  } else {
    return <span>{record[field] || ''}</span>;
  }
}

ColumnSearchSelect.proptypes = {
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
    hscodes: state.cmsHsCode.hscodes,
    hscodeData: state.cmsHsCode.hscodes.data.map(un => ({
      value: un.hscode,
      text: un.hscode,
      search: un.hscode,
    })),
    loginId: state.account.loginId,
    billHead: state.cmsManifest.billHead,
    bodyItem: state.cmsTradeitem.bodyItem,
    bodyHscode: state.cmsTradeitem.bodyHscode,
    entryHead: state.cmsManifest.entryHead,
  }),
  { updateHeadNetWt, loadBillBody, openAmountModel, getItemForBody, getHscodeForBody, deleteSelectedBodies, openRuleModel, loadHscodes }
)
export default class ManifestBodyPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    readonly: PropTypes.bool,
    data: PropTypes.array.isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    billSeqNo: PropTypes.string,
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
    hscodes: PropTypes.object,
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    if (!props.readonly) {
      bodies.push({ id: '__ops' });
    }
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
      selectedRowKeys: [],
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
      if (!nextProps.readonly) {
        bodies.push({ id: '__ops' });
      }
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
            trade_curr: item.trade_curr,
            orig_country: item.orig_country,
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
            trade_curr: '',
            orig_country: '',
          },
        });
      }
    }
    if (nextProps.hscodes !== this.props.hscodes) {
      if (nextProps.hscodes.data.length === 1) {
        const hscode = nextProps.hscodes.data[0];
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
    const { readonly, units, countries, currencies, exemptions, hscodeData } = this.props;
    const { editIndex, bodies, editBody, pagination } = this.state;
    const totalCount = bodies.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      fixed: 'left',
      width: 45,
    }, {
      title: this.msg('copGNo'),
      fixed: 'left',
      width: 150,
      render: (o, record, index) =>
        <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('emGNo'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('codeT'),
      width: 110,
      render: (o, record, index) =>
        <ColumnSearchSelect field="codes" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={hscodeData} edit={editBody}
        />,
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record, index) =>
        <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('gModel'),
      width: 300,
      render: (o, record, index) =>
        <ColumnInput type="textarea" autosize field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('quantity'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="g_qty" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unit'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: this.msg('decPrice'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('decTotal'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="trade_total" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('currency'),
      width: 100,
      render: (o, record, index) =>
        <ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody}
        />,
    }, {
      title: this.msg('qty1'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="qty_1" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unit1'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="unit_1" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: this.msg('qty2'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="qty_2" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unit2'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="unit_2" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: this.msg('grosswt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('netwt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="duty_mode" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={exemptions} edit={editBody}
        />,
    }, {
      title: this.msg('ecountry'),
      width: 120,
      render: (o, record, index) =>
        <ColumnSelect field="dest_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('icountry'),
      width: 120,
      render: (o, record, index) =>
        <ColumnSelect field="orig_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('qtyPcs'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="qty_pcs" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unitPcs'),
      width: 100,
      render: (o, record, index) =>
        <ColumnSelect field="unit_pcs" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: this.msg('element'),
      width: 380,
      render: (o, record, index) =>
        <ColumnInput field="element" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('versionNo'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="version_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('processingFees'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="processing_fees" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('opColumn'),
      width: 80,
      fixed: 'right',
      render: (o, record, index) => {
        if (readonly) {
          return <span />;
        } else if (index === editIndex) {
          return (
            <span className="editable-row-operations">
              <RowUpdater onHit={this.handleSave} label={<Icon type="save" />}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleCancel} label={<Icon type="close" />} />
            </span>
          );
        } else if (index + 1 + (pagination.current - 1) * pagination.pageSize === totalCount) {
          return (
            <span className="editable-row-operations">
              <RowUpdater onHit={this.handleEdit} label={<Icon type="plus" />}
                index={index} row={{}}
              />
            </span>
          );
        } else {
          return (
            <span className="editable-row-operations">
              <RowUpdater onHit={this.handleEdit} label={<Icon type="edit" />}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDel} label={<Icon type="delete" />}
                row={record} index={index}
              />
            </span>
          );
        }
      },
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
  handleEditChange = (field, value) => {
    this.setState({
      editBody: { ...this.state.editBody, [field]: value },
    });
    if (field === 'cop_g_no') {
      const { billHead, tenantId, billSeqNo } = this.props;
      this.props.getItemForBody({
        tenantId,
        billSeqNo,
        delgNo: billHead.delg_no,
        copProdNo: value,
      });
    }
    if (field === 'codes') {
      // this.props.getHscodeForBody({ hscode: value });
      const { hscodes } = this.props;
      this.props.loadHscodes({
        tenantId: this.props.tenantId,
        pageSize: hscodes.pageSize,
        current: hscodes.current,
        searchText: value,
      });
    }
  }
  handleEdit = (row, index) => {
    if (this.props.headNo) {
      this.setState({
        editIndex: index,
        editBody: row,
      });
    } else {
      message.error(this.msg('headUncreated'), 10);
    }
  }
  handleSave = (row, index) => {
    const { editBody, pagination: origPagi } = this.state;
    const recordIdx = index + (origPagi.current - 1) * origPagi.pageSize;
    if (!editBody.wet_wt) {
      return message.error('净重必填');
    }
    // todo validate
    if (!editBody.id) {
      let gNO = 1;
      if (this.state.bodies.length > 1) {
        gNO += this.state.bodies[this.state.bodies.length - 2].g_no;
      }
      let body = { ...editBody, g_no: gNO };
      const { billSeqNo, headNo, loginId, tenantId } = this.props;
      this.props.onAdd({ billSeqNo, body, headNo, loginId, tenantId }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          body = result.data;
          body.codes = body.code_t + body.code_s;
          const bodies = [...this.state.bodies];
          bodies.splice(recordIdx, 0, body);
          const pagination = { ...origPagi, total: bodies.length };
          if (bodies.length > pagination.current * pagination.pageSize) {
            pagination.current += 1;
          }
          const calresult = calculateTotal(bodies);
          this.setState({
            editIndex: -1,
            editBody: {},
            totGrossWt: calresult.totGrossWt,
            totWetWt: calresult.totWetWt,
            totTrade: calresult.totTrade,
            totPcs: calresult.totPcs,
            bodies,
            pagination,
          });
        }
      });
    } else {
      this.props.onEdit(editBody).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          const bodies = [...this.state.bodies];
          bodies[recordIdx] = editBody;
          const calresult = calculateTotal(bodies);
          this.setState({
            editIndex: -1,
            editBody: {},
            totGrossWt: calresult.totGrossWt,
            totWetWt: calresult.totWetWt,
            totTrade: calresult.totTrade,
            totPcs: calresult.totPcs,
            bodies,
          });
        }
      });
    }
  }
  handleDel = (row, index) => {
    this.props.onDel(row.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const bodies = [...this.state.bodies];
        const recordIdx = index + (this.state.pagination.current - 1) * this.state.pagination.pageSize;
        bodies.splice(recordIdx, 1);
        const pagination = { ...this.state.pagination, total: bodies.length };
        if (pagination.current > 1 && (pagination.current - 1) * pagination.pageSize === pagination.total) {
          pagination.current -= 1;
        }
        const calresult = calculateTotal(bodies);
        this.setState({
          bodies,
          totGrossWt: calresult.totGrossWt,
          totWetWt: calresult.totWetWt,
          totTrade: calresult.totTrade,
          totPcs: calresult.totPcs,
          pagination,
        });
      }
    });
  }
  handleCancel = () => {
    this.setState({
      editIndex: -1,
      editBody: {},
    });
  }
  handleButtonClick = (ev) => {
    ev.stopPropagation();
  }
  handleExportData = (ev) => {
    ev.stopPropagation();
  }
  handleNetWetSummary = () => {
    const bodyDatas = this.state.bodies;
    let wtSum = 0;
    bodyDatas.forEach((body) => {
      if (body.wet_wt) {
        wtSum += Number(body.wet_wt);
      }
    });
    if (wtSum > 0) {
      this.props.updateHeadNetWt(this.props.billSeqNo, wtSum).then(() => {
        const { headForm } = this.props;
        if (headForm) {
          headForm.setFieldsValue({ net_wt: wtSum });
        }
      });
    }
  }
  handleGrossWtDivid = () => {
    const totGrossWt = this.props.billHead.gross_wt;
    const bodyDatas = this.state.bodies;
    let wtSum = 0;
    bodyDatas.forEach((body) => {
      if (body.wet_wt) {
        wtSum += Number(body.wet_wt);
      }
    });
    const datas = [];
    let wts = 0;
    for (let i = 0; i < bodyDatas.length - 2; i++) {
      const body = bodyDatas[i];
      const grosswt = (totGrossWt * body.wet_wt / wtSum).toFixed(3);
      wts += Number(grosswt);
      const data = { ...body, gross_wt: grosswt };
      datas.push(data);
      this.props.onEdit(data);
    }
    const lastwt = totGrossWt - wts;
    const lastBody = bodyDatas[bodyDatas.length - 2];
    datas.push({ ...lastBody, gross_wt: lastwt });
    this.props.onEdit({ ...lastBody, gross_wt: lastwt });
    datas.push({});
    this.setState({ bodies: datas });
  }
  handleTotalPriceDivid = () => {
    this.props.loadBillBody(this.props.billSeqNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.openAmountModel();
      }
    });
  }
  handleDataMenuClick = (e) => {
    if (e.key === 'priceDivid') {
      this.handleTotalPriceDivid();
    } else if (e.key === 'wtDivid') {
      this.handleGrossWtDivid();
    } else if (e.key === 'wtSum') {
      this.handleNetWetSummary();
    }
  }
  handleUnrelatedImportMenuClick = (e) => {
    if (e.key === 'download') {
      window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/model/download/${createFilename('billbodyModel')}.xlsx`);
    }
  }
  handleRelatedImportMenuClick = (e) => {
    if (e.key === 'rule') {
      this.props.openRuleModel();
    } else if (e.key === 'downloadRelated') {
      window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/related/model/download/${createFilename('relatedModel')}.xlsx`);
    }
  }
  handleManifestBodyExport = () => {
    window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/export/${createFilename('billbodyExport')}.xlsx?billSeqNo=${this.props.billSeqNo}`);
  }
  handleUploaded = () => {
    this.props.loadBillBody(this.props.billSeqNo);
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteSelectedBodies(selectedIds).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
    this.setState({ selectedRowKeys: [] });
  }
  handleBodyDelete = () => {
    const ids = [];
    for (let i = 0; i < this.state.bodies.length - 1; i++) {
      const body = this.state.bodies[i];
      ids.push(body.id);
    }
    if (ids.length > 0) {
      this.props.deleteSelectedBodies(ids).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadBillBody(this.props.billSeqNo);
        }
      });
    }
  }
  handleMoreMenuClick = (e) => {
    if (e.key === 'exportBody') {
      this.handleManifestBodyExport();
    }
  }
  render() {
    const { totGrossWt, totWetWt, totTrade, totPcs } = this.state;
    const selectedRows = this.state.selectedRowKeys;
    const disabled = this.props.readonly;
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: () => ({ disabled }),
    };
    const columns = this.getColumns();
    const handlemenu = (
      <Menu onClick={this.handleDataMenuClick}>
        <Menu.Item key="priceDivid"><Icon type="pie-chart" /> 金额平摊</Menu.Item>
        <Menu.Item key="wtDivid"><Icon type="arrows-alt" /> 毛重分摊</Menu.Item>
        <Menu.Item key="wtSum"><Icon type="shrink" /> 净重汇总</Menu.Item>
      </Menu>);
    const unrelatedImportmenu = (
      <Menu onClick={this.handleUnrelatedImportMenuClick}>
        <Menu.Item key="download"><Icon type="file-excel" /> 下载模板</Menu.Item>
      </Menu>);
    const relatedImportmenu = (
      <Menu onClick={this.handleRelatedImportMenuClick}>
        <Menu.Item key="downloadRelated"><Icon type="file-excel" /> 下载模板</Menu.Item>
        <Menu.Item key="rule"><Icon type="setting" /> 关联导入规则</Menu.Item>
      </Menu>);
    const moremenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="exportBody"><Icon type="export" /> 导出表体</Menu.Item>
        <Menu.Item key="delete">
          <Popconfirm title="确定删除表体数据?" onConfirm={this.handleBodyDelete}>
            <a> <Icon type="delete" /> 清空表体</a>
          </Popconfirm>
        </Menu.Item>
      </Menu>);
    const billBodyToolbar = (
      <span>
        {this.props.readonly && <Button icon="export" onClick={this.handleManifestBodyExport}>导出</Button>}
        {!this.props.readonly &&
        <Dropdown.Button onClick={this.handleUnrelatedImport} overlay={unrelatedImportmenu} style={{ marginLeft: 8 }}>
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/manifest/billbody/import`}
            formData={{
              data: JSON.stringify({
                bill_seq_no: this.props.billSeqNo,
                tenant_id: this.props.tenantId,
                creater_login_id: this.props.loginId,
              }),
            }} onUploaded={this.handleUploaded}
          >
            {this.msg('unrelatedImport')}
          </ExcelUpload>
        </Dropdown.Button>
        }
        {!this.props.readonly &&
        <Dropdown.Button onClick={this.handleRelatedImport} overlay={relatedImportmenu} style={{ marginLeft: 8 }}>
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/manifest/billbody/related/import`}
            formData={{
              data: JSON.stringify({
                bill_seq_no: this.props.billHead.bill_seq_no,
                tenant_id: this.props.tenantId,
                creater_login_id: this.props.loginId,
                delgNo: this.props.billHead.delg_no,
                tradeCode: this.props.billHead.trade_co,
              }),
            }} onUploaded={this.handleUploaded}
          >
            {this.msg('relatedImport')}
          </ExcelUpload>
        </Dropdown.Button>
        }
        {!this.props.readonly && <Dropdown overlay={handlemenu}>
          <Button onClick={this.handleButtonClick} style={{ marginLeft: 8 }}>
            {this.msg('handle')} <Icon type="down" />
          </Button>
          </Dropdown>
        }
        {!this.props.readonly &&
          <Dropdown overlay={moremenu}>
            <Button onClick={this.handleButtonClick} style={{ marginLeft: 8 }}>
              {this.msg('more')} <Icon type="down" />
            </Button>
          </Dropdown>}
        {selectedRows.length > 0 &&
          <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
            <Button type="danger" icon="delete" style={{ marginLeft: 8 }}>
              批量删除
            </Button>
          </Popconfirm>}
      </span>);
    const stats = (<div><span style={{ marginLeft: 8 }}>总毛重: </span><span style={{ color: '#FF9933' }}>{totGrossWt.toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>总净重: </span><span style={{ color: '#FF9933' }}>{totWetWt.toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>总金额: </span><span style={{ color: '#FF9933' }}>{totTrade.toFixed(3)}</span>
      <span style={{ marginLeft: 8 }}>总个数: </span><span style={{ color: '#FF9933' }}>{totPcs.toFixed(3)}</span></div>);
    return (
      <div className="pane">
        <div className="panel-header">
          {billBodyToolbar}
          <div className="toolbar-right">
            <Alert message={stats} type="info" />
          </div>
        </div>
        <div className="panel-body table-panel">
          <Table rowKey="id" columns={columns} dataSource={this.state.bodies}
            scroll={{ x: 3000, y: this.state.wlScrollY }} pagination={this.state.pagination} rowSelection={rowSelection}
          />
          <AmountModel />
          <RelateImportRuleModal />
        </div>
      </div>);
  }
}
