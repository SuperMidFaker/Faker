import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Dropdown, Menu, Icon, Tooltip, Tag, Input, Select, message, notification, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadBill, addNewBillBody, delBillBody, editBillBody, updateHeadNetWt, loadBillBody, openAmountModel, refreshRelatedBodies,
  deleteSelectedBodies, resetBillBody, openRuleModel, showEditBodyModal, showDeclElementsModal, updateBillBody } from 'common/reducers/cmsManifest';
import { toggleDeclImportModal } from 'common/reducers/cmsManifestImport';
import { getItemForBody } from 'common/reducers/cmsTradeitem';
import { loadAdaptors } from 'common/reducers/saasLineFileAdaptor';
import Summary from 'client/components/Summary';
import DataPane from 'client/components/DataPane';
import EditBodyModal from '../modals/editBodyModal';
import DeclElementsModal from '../../modal/declElementsModal';
import ImportDeclaredBodyModal from '../modals/importDeclaredBodyModal';
import ImportDataPanel from 'client/components/ImportDataPanel';
import AmountModel from '../modals/amountDivid';
import RowAction from 'client/components/RowAction';
import RelateImportRuleModal from '../modals/relateImportRules';
import { dividGrossWt } from './helper';
import { loadHscodes, getElementByHscode } from 'common/reducers/cmsHsCode';
import { createFilename } from 'client/util/dataTransform';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

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
          options.map(opt => <Option search={opt.search} value={opt.value} key={opt.value}>{`${opt.value}|${opt.text}`}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? `${foundOpts[0].value}|${foundOpts[0].text}` : '';
    return label && label.length > 0 ? <Tag>{label}</Tag> : <span />;
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
      <Select showSearch showArrow={false} mode="combobox" optionFilterProp="search" value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map(opt => <Option search={opt.search} value={opt.value} key={opt.value}>{opt.text}</Option>)
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

function calculateTotal(bodies, currencies) {
  let totGrossWt = 0;
  let totWetWt = 0;
  let totTrade = 0;
  let totPcs = 0;
  const tradeCurrGroup = {};
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.gross_wt) {
      totGrossWt += Number(body.gross_wt);
    }
    if (body.wet_wt) {
      totWetWt += Number(body.wet_wt);
    }
    if (body.trade_total) {
      const currency = currencies.find(curr => curr.value === body.trade_curr);
      const rate = currency ? currency.rate_cny : 1;
      totTrade += Number(body.trade_total * rate);
      if (parseFloat(rate) !== 1) {
        if (tradeCurrGroup[currency.text]) {
          tradeCurrGroup[currency.text].trade += body.trade_total;
        } else {
          tradeCurrGroup[currency.text] = { trade: body.trade_total };
        }
      }
    }
    if (body.qty_pcs) {
      totPcs += Number(body.qty_pcs);
    }
  }
  return { totGrossWt, totWetWt, totTrade, totPcs, tradeCurrGroup };
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
      rate_cny: cr.rate_CNY,
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
    billMeta: state.cmsManifest.billMeta,
    adaptors: state.saasLineFileAdaptor.adaptors,
  }),
  { loadBill,
    addNewBillBody,
    delBillBody,
    editBillBody,
    updateHeadNetWt,
    loadBillBody,
    openAmountModel,
    showEditBodyModal,
    getItemForBody,
    deleteSelectedBodies,
    resetBillBody,
    refreshRelatedBodies,
    openRuleModel,
    loadHscodes,
    showDeclElementsModal,
    updateBillBody,
    getElementByHscode,
    toggleDeclImportModal,
    loadAdaptors,
  }
)
export default class ManifestBodyPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    readonly: PropTypes.bool,
    data: PropTypes.array.isRequired,
    billSeqNo: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    exemptions: PropTypes.array,
    billHead: PropTypes.object,
    headForm: PropTypes.object,
    hscodes: PropTypes.object,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
      repoId: PropTypes.number,
    }),
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    /*
    if (!props.readonly) {
      bodies.push({ id: '__ops' });
    }
    */
    const calresult = calculateTotal(bodies, props.currencies);
    this.state = {
      editIndex: -1,
      editBody: {},
      bodies,
      totGrossWt: calresult.totGrossWt,
      totWetWt: calresult.totWetWt,
      totTrade: calresult.totTrade,
      totPcs: calresult.totPcs,
      tradeCurrGroup: calresult.tradeCurrGroup,
      tableMask: false,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: false,
        showSizeChanger: true,
        onChange: this.handlePageChange,
      },
      selectedRowKeys: [],
      importPanelVisible: false,
      importPanel: { endpoint: '', template: '', title: '' },
    };
  }
  componentDidMount() {
    this.props.loadAdaptors(this.props.billHead.owner_cuspartner_id,
      [LINE_FILE_ADAPTOR_MODELS.CMS_MANIFEST_BODY.key],
      true);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      // if (!nextProps.readonly) {
        // bodies.push({ id: '__ops' });
      // }
      const calresult = calculateTotal(bodies, this.props.currencies);
      this.setState({
        bodies,
        totGrossWt: calresult.totGrossWt,
        totWetWt: calresult.totWetWt,
        totTrade: calresult.totTrade,
        totPcs: calresult.totPcs,
        tradeCurrGroup: calresult.tradeCurrGroup,
        pagination: { ...this.state.pagination, total: bodies.length },
      });
    }
  }
  getColumns() {
    const { readonly, units, countries, currencies, exemptions, hscodeData } = this.props;
    const { editIndex, editBody } = this.state;
    // const totalCount = bodies.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      className: 'cell-align-center',
      width: 45,
      fixed: 'left',
    }, {
      title: this.msg('copGNo'),
      width: 150,
      dataIndex: 'cop_g_no',
      render: (o, record, index) => {
        if (readonly) {
          return <span>{o}</span>;
        } else if (index === editIndex) {
          return (<Input onChange={this.handleCopGnoChange} />);
        } else if (record.feedback === 'noMatch') {
          return (<Tooltip title="物料库中未对该货号归类"><Tag color="red">
            <a onClick={() => this.handleEditBody(record)}>{o}</a>
          </Tag></Tooltip>);
        } else if (record.feedback === 'incomplete') {
          return (<Tooltip title="货号原产国或目的国或币制或征免方式为空"><Tag color="red">
            <a onClick={() => this.handleEditBody(record)}>{o}</a>
          </Tag></Tooltip>);
        } else {
          return (
            <a onClick={() => this.handleEditBody(record)}>{o}</a>
          );
        }
      },
    }, {
      title: this.msg('emGNo'),
      width: 100,
      render: (o, record, index) =>
        (<ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('codeT'),
      width: 110,
      render: (o, record, index) =>
        (<ColumnSearchSelect field="codes" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={hscodeData} edit={editBody}
        />),
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record, index) =>
        (<ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('enName'),
      width: 200,
      render: (o, record, index) =>
        (<ColumnInput field="en_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('gModel'),
      width: 400,
      onCellClick: record => record.cop_g_no && this.handleShowDeclElementModal(record),
      render: (o, record, index) =>
        (<ColumnInput type="textarea" autosize field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('quantity')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="g_qty" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('unit'),
      width: 80,
      className: 'cell-align-center',
      render: (o, record, index) =>
        (<ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('decPrice')}</div>,
      width: 100,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} decimal={3}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('decTotal')}</div>,
      width: 100,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="trade_total" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('currency'),
      width: 100,
      className: 'cell-align-center',
      render: (o, record, index) =>
        (<ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('grosswt')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('netwt')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('qty1')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="qty_1" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('unit1'),
      width: 80,
      className: 'cell-align-center',
      render: (o, record, index) =>
        (<ColumnSelect field="unit_1" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />),
    }, {
      title: <div className="cell-align-right">{this.msg('qty2')}</div>,
      width: 80,
      className: 'cell-align-right',
      render: (o, record, index) =>
        (<ColumnInput field="qty_2" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} decimal={3}
        />),
    }, {
      title: this.msg('unit2'),
      width: 80,
      className: 'cell-align-center',
      render: (o, record, index) =>
        (<ColumnSelect field="unit_2" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />),
    }, {
      title: this.msg('exemptionWay'),
      width: 100,
      render: (o, record, index) =>
        (<ColumnSelect field="duty_mode" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={exemptions} edit={editBody}
        />),
    }, {
      title: this.msg('ecountry'),
      width: 120,
      render: (o, record, index) =>
        (<ColumnSelect field="dest_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />),
    }, {
      title: this.msg('icountry'),
      width: 120,
      render: (o, record, index) =>
        (<ColumnSelect field="orig_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />),
    }, {
      title: this.msg('qtyPcs'),
      width: 100,
      render: (o, record, index) =>
        (<ColumnInput field="qty_pcs" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('unitPcs'),
      width: 100,
      render: (o, record, index) =>
        (<ColumnSelect field="unit_pcs" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />),
/*    }, {
      title: this.msg('element'),
      render: (o, record, index) =>
        (<ColumnInput field="element" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />), */
    }, {
      title: this.msg('versionNo'),
      width: 80,
      render: (o, record, index) =>
        (<ColumnInput field="version_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />),
    }, {
      title: this.msg('processingFees'),
      width: 80,
      render: (o, record, index) =>
        (<ColumnInput field="processing_fees" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} decimal={3}
        />),
    }, {
      title: this.msg('freightFee'),
      dataIndex: 'freight',
      width: 100,
      render: freight => freight > 0 ? freight : null,
    }, {
      dataIndex: 'OPS_COL',
      width: 100,
      fixed: 'right',
      render: (o, record, index) => (
        <span>
          <RowAction onClick={this.handleEditBody} icon="edit" row={record} index={index} disabled={this.props.readonly} />
          <RowAction confirm="确认删除?" onConfirm={() => this.handleDel(record, index)} icon="delete" disabled={this.props.readonly} />
        </span>
          ),
    }];
    return columns;
  }
  handleShowDeclElementModal = (record) => {
    this.props.getElementByHscode(record.codes).then((result) => {
      if (!result.error) {
        this.props.showDeclElementsModal(result.data.declared_elements, record.id, record.g_model, this.props.readonly, record.g_name);
      }
    });
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
  handleCopGnoChange = (ev) => {
    this.handleEditChange('cop_g_no', ev.target.value);
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
    if (this.props.billSeqNo) {
      this.setState({
        editIndex: index,
        editBody: row,
      });
    } else {
      message.error(this.msg('headUncreated'), 10);
    }
  }
  handleEditBody = (row) => {
    this.setState({
      editBody: row,
    });
    this.props.showEditBodyModal(true);
  }
  handleAddBody = () => {
    this.setState({ editBody: {} });
    this.props.showEditBodyModal(true);
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
      const { billSeqNo, loginId, tenantId } = this.props;
      this.props.addNewBillBody({ billSeqNo, body, loginId, tenantId }).then((result) => {
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
          const calresult = calculateTotal(bodies, this.props.currencies);
          this.setState({
            editIndex: -1,
            editBody: {},
            totGrossWt: calresult.totGrossWt,
            totWetWt: calresult.totWetWt,
            totTrade: calresult.totTrade,
            totPcs: calresult.totPcs,
            tradeCurrGroup: calresult.tradeCurrGroup,
            bodies,
            pagination,
          });
        }
      });
    } else {
      this.props.editBillBody(editBody).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          const bodies = [...this.state.bodies];
          bodies[recordIdx] = editBody;
          const calresult = calculateTotal(bodies, this.props.currencies);
          this.setState({
            editIndex: -1,
            editBody: {},
            totGrossWt: calresult.totGrossWt,
            totWetWt: calresult.totWetWt,
            totTrade: calresult.totTrade,
            totPcs: calresult.totPcs,
            tradeCurrGroup: calresult.tradeCurrGroup,
            bodies,
          });
        }
      });
    }
  }
  handleDel = (row, index) => {
    this.props.delBillBody(row.id).then((result) => {
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
        const calresult = calculateTotal(bodies, this.props.currencies);
        this.setState({
          bodies,
          totGrossWt: calresult.totGrossWt,
          totWetWt: calresult.totWetWt,
          totTrade: calresult.totTrade,
          totPcs: calresult.totPcs,
          tradeCurrGroup: calresult.tradeCurrGroup,
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
        notification.success({
          message: '操作成功',
          description: `已汇总净重: ${wtSum.toFixed(3)}千克`,
        });
      });
    }
  }
  handleGrossWtDivid = () => {
    const totGrossWt = Number(this.props.billHead.gross_wt);
    if (!totGrossWt) {
      message.error('总毛重为空', 3);
      return;
    }
    const bodyDatas = this.state.bodies;
    if (bodyDatas.length > 1) {
      const grossWts = dividGrossWt(bodyDatas.slice(0, bodyDatas.length - 1).map(bd => bd.wet_wt || 0), totGrossWt);
      const datas = [];// server side todo
      for (let i = 0; i < bodyDatas.length - 1; i++) {
        const body = bodyDatas[i];
        const data = { ...body, gross_wt: grossWts[i] };
        datas.push(data);
        this.props.editBillBody(data);
      }
      datas.push(bodyDatas[bodyDatas.length - 1]);
      const calresult = calculateTotal(datas, this.props.currencies);
      this.setState({
        totGrossWt: calresult.totGrossWt,
        totWetWt: calresult.totWetWt,
        totTrade: calresult.totTrade,
        totPcs: calresult.totPcs,
        tradeCurrGroup: calresult.tradeCurrGroup,
        bodies: datas,
      });
      notification.success({
        message: '操作成功',
        description: `总毛重: ${totGrossWt.toFixed(2)}千克已分摊`,
      });
    }
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
  handleRelatedImportMenuClick = (e) => {
    if (e.key === 'rule') {
      this.props.openRuleModel();
    } else if (e.key === 'refresh') {
      this.handleRelatedRefresh();
    }
  }
  handleManifestBodyExport = () => {
    window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/export/${createFilename('billbodyExport')}.xlsx?billSeqNo=${this.props.billSeqNo}`);
  }
  handleBodyExportToItem = () => {
    const vurl = 'v1/cms/manifest/billbody/unclassified/to/item/export/';
    const billSeqNo = this.props.billSeqNo;
    const repoId = this.props.billMeta.repoId;
    window.open(`${API_ROOTS.default}${vurl}${createFilename('bodyExportToItem')}.xlsx?billSeqNo=${billSeqNo}&repoId=${repoId}`);
  }
  handleReload = (reloadHead) => {
    this.setState({ tableMask: true });
    this.props.loadBillBody(this.props.billSeqNo).then(() => {
      this.setState({ tableMask: false });
    });
    if (reloadHead) {
      this.props.loadBill(this.props.billSeqNo);
    }
    this.setState({ importPanelVisible: false });
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
  handleBodyReset = () => {
    this.props.resetBillBody(this.props.billSeqNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.success('表体已清空');
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
  }
  handleExportMenuClick = (e) => {
    if (e.key === 'all') {
      this.handleManifestBodyExport();
    } else if (e.key === 'expToItem') {
      this.handleBodyExportToItem();
    }
  }
  handleModelChange = (value, id) => {
    this.props.updateBillBody(id, value).then((result) => {
      if (!result.error) {
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
  }
  handleRelatedRefresh = () => {
    this.setState({ tableMask: true });
    this.props.refreshRelatedBodies(this.props.billSeqNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadBillBody(this.props.billSeqNo).then(() => {
          message.success('表体已刷新');
          this.setState({ tableMask: false });
        });
      }
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDeclBodyImport = () => {
    this.props.toggleDeclImportModal(true);
  }
  handleUnrelatedImport = () => {
    this.setState({ importPanelVisible: true,
      importPanel: {
        title: '直接导入',
        endpoint: `${API_ROOTS.default}v1/cms/manifest/billbody/import`,
        template: `${API_ROOTS.default}v1/cms/manifest/billbody/model/download/${createFilename('billbodyModel')}.xlsx`,
      },
    });
  }
  handleRelatedImport = () => {
    this.setState({ importPanelVisible: true,
      importPanel: {
        title: '关联导入',
        endpoint: `${API_ROOTS.default}v1/cms/manifest/billbody/related/import`,
        template: `${API_ROOTS.default}v1/cms/manifest/billbody/related/model/download/${createFilename('relatedModel')}.xlsx`,
      },
    });
  }
  handleManualBodyImport = () => {
    this.setState({ importPanelVisible: true,
      importPanel: {
        title: '手册导入',
        endpoint: `${API_ROOTS.default}v1/cms/manifest/billbody/related/manual/import`,
        template: `${API_ROOTS.default}v1/cms/manifest/billbody/model/download/${createFilename('billbodyModel')}.xlsx`,
      },
    });
  }
  renderToolbar() {
    const { readonly, billMeta } = this.props;
    const dataToolsMenu = (
      <Menu onClick={this.handleDataMenuClick}>
        <Menu.Item key="priceDivid">金额平摊</Menu.Item>
        <Menu.Item key="wtDivid">毛重分摊</Menu.Item>
        <Menu.Item key="wtSum">净重汇总</Menu.Item>
      </Menu>);
    const relatedImportMenu = (
      <Menu onClick={this.handleRelatedImportMenuClick}>
        {this.state.bodies.length > 0 && billMeta.repoId !== null &&
        <Menu.Item key="refresh"><Icon type="retweet" /> 重新关联归类数据</Menu.Item>}
        <Menu.Item key="rule"><Icon type="tool" /> 设置关联导入规则</Menu.Item>
      </Menu>);
    const exportMenu = (
      <Menu onClick={this.handleExportMenuClick}>
        <Menu.Item key="all">所有申报商品明细</Menu.Item>
        {billMeta.repoId !== null && <Menu.Item key="expToItem">未归类商品明细</Menu.Item>}
      </Menu>);
    if (readonly) {
      return (<Dropdown overlay={exportMenu}>
        <Button >
          <Icon type="export" /> 导出 <Icon type="down" />
        </Button>
      </Dropdown>);
    } else {
      return (<span>
        <Button icon="plus-circle-o" onClick={this.handleAddBody}>添加</Button>
        <Button icon="upload" onClick={this.handleUnrelatedImport} style={{ marginLeft: 8 }}>{this.msg('unrelatedImport')}</Button>
        <Dropdown.Button onClick={this.handleRelatedImport} overlay={relatedImportMenu} style={{ marginLeft: 8 }}>
          <Icon type="cloud-upload-o" /> {this.msg('relatedImport')}
        </Dropdown.Button>
        { this.props.billHead.manual_no &&
        <Button icon="book" onClick={this.handleManualBodyImport} style={{ marginLeft: 8 }}>手册账册关联导入</Button>}
        <Button icon="copy" onClick={this.handleDeclBodyImport} style={{ marginLeft: 8 }}>复制历史数据</Button>
        <Dropdown overlay={dataToolsMenu}>
          <Button style={{ marginLeft: 8 }}>
            <Icon type="tool" /> <Icon type="down" />
          </Button>
        </Dropdown>
        <Dropdown overlay={exportMenu}>
          <Button style={{ marginLeft: 8 }}>
            <Icon type="export" /> 导出 <Icon type="down" />
          </Button>
        </Dropdown>
        {/*
          <Popconfirm title="确定清空表体数据?" onConfirm={this.handleBodyReset}>
          <Button type="danger" icon="delete" style={{ marginLeft: 8 }}>清空</Button>
        </Popconfirm>
        */}
      </span>);
    }
  }

  render() {
    const { totGrossWt, totWetWt, totTrade, totPcs, tradeCurrGroup, editBody, importPanelVisible, importPanel } = this.state;
    const disabled = this.props.readonly;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: () => ({ disabled }),
    };
    const columns = this.getColumns();

    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={columns} rowSelection={rowSelection} bordered scrollOffset={312}
        dataSource={this.state.bodies} rowKey="id" loading={this.state.tableMask}
        onRow={record => ({
          onDoubleClick: () => { this.handleEditBody(record); },
        })}
      >
        <DataPane.Toolbar>
          {this.renderToolbar()}
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
              <Button type="danger" icon="delete" style={{ marginLeft: 8 }}>
              批量删除
            </Button>
            </Popconfirm>
          </DataPane.BulkActions>
          <DataPane.Actions>
            <Summary>
              <Summary.Item label="总毛重" addonAfter="KG">{totGrossWt.toFixed(2)}</Summary.Item>
              <Summary.Item label="总净重" addonAfter="KG">{totWetWt.toFixed(3)}</Summary.Item>
              <Summary.Item label="总金额(元)" addonAfter="元">{totTrade.toFixed(2)}</Summary.Item>
              {Object.keys(tradeCurrGroup).map(curr => <Summary.Item label={`${curr}金额`} key={curr}>{tradeCurrGroup[curr].trade.toFixed(2)}</Summary.Item>)}
              <Summary.Item label="总个数">{totPcs}</Summary.Item>
            </Summary>
          </DataPane.Actions>
        </DataPane.Toolbar>
        <AmountModel />
        <RelateImportRuleModal />
        <EditBodyModal editBody={editBody} billSeqNo={this.props.billSeqNo} />
        <DeclElementsModal onOk={this.handleModelChange} />
        <ImportDeclaredBodyModal reload={() => this.handleReload(true)} />
        <ImportDataPanel adaptors={this.props.adaptors} title={importPanel.title}
          visible={importPanelVisible}
          endpoint={importPanel.endpoint}
          formData={{ bill_seq_no: this.props.billHead.bill_seq_no }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.handleReload}
          template={importPanel.template}
        />
      </DataPane>
    );
  }
}
