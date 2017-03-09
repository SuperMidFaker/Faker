import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Dropdown, Menu, Table, Icon, Input, Select, message, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from './rowUpdater';
import { updateHeadNetWt, loadBillBody, openAmountModel, deleteSelectedBodies } from 'common/reducers/cmsManifest';
import { getItemForBody, getHscodeForBody } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import ExcelUpload from 'client/components/excelUploader';
import messages from './message.i18n';
import { createFilename } from 'client/util/dataTransform';
import AmountModel from '../modals/amountDivid';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return inEdit ? <Input value={edit[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  edit: PropTypes.object,
  onChange: PropTypes.func,
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
      <Select value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
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
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    exemptions: state.cmsManifest.params.exemptionWays,
    loginId: state.account.loginId,
    billHead: state.cmsManifest.billHead,
    bodyItem: state.cmsTradeitem.bodyItem,
    bodyHscode: state.cmsTradeitem.bodyHscode,
    entryHead: state.cmsManifest.entryHead,
  }),
  { updateHeadNetWt, loadBillBody, openAmountModel, getItemForBody, getHscodeForBody, deleteSelectedBodies }
)
export default class SheetBodyPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    type: PropTypes.oneOf(['bill', 'entry']),
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
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    if (!props.readonly && this.props.type !== 'entry') {
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      if (!nextProps.readonly && this.props.type !== 'entry') {
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
        let unit1Val = '';
        let unit2Val = '';
        let gunitVal = '';
        if (item.unit_1) {
          const unit1 = this.props.units.filter(unit => unit.text === item.unit_1)[0];
          unit1Val = unit1.value;
        }
        if (item.unit_2) {
          const unit2 = this.props.units.filter(unit => unit.text === item.unit_2)[0];
          unit2Val = unit2.value;
        }
        if (item.g_unit) {
          const gunit = this.props.units.filter(unit => unit.text === item.g_unit)[0];
          gunitVal = gunit.value;
        }
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
        let unit1Val = '';
        let unit2Val = '';
        if (hscode.first_unit) {
          const unit1 = this.props.units.filter(unit => unit.text === hscode.first_unit)[0];
          unit1Val = unit1.value;
        }
        if (hscode.second_unit) {
          const unit2 = this.props.units.filter(unit => unit.text === hscode.second_unit)[0];
          unit2Val = unit2.value;
        }
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
    const { type, readonly, units, countries, currencies, exemptions } = this.props;
    const { editIndex, bodies, editBody, pagination } = this.state;
    const totalCount = bodies.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      width: 45,
      fixed: 'left',
    }];
    if (type === 'bill') {
      columns.push({
        title: this.msg('copGNo'),
        width: 120,
        render: (o, record, index) =>
          <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
            onChange={this.handleEditChange} edit={editBody}
          />,
      }, {
        title: this.msg('emGNo'),
        width: 50,
        render: (o, record, index) =>
          <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
            onChange={this.handleEditChange} edit={editBody}
          />,
      });
    }
    columns.push({
      title: this.msg('codeT'),
      width: 110,
      render: (o, record, index) =>
        <ColumnInput field="codes" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
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
        <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('element'),
      width: 380,
      render: (o, record, index) =>
        <ColumnInput field="element" inEdit={index === editIndex} record={record}
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
      width: 60,
      render: (o, record, index) =>
        <ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody}
        />,
    }, {
      title: this.msg('unit'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
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
      width: 90,
      fixed: 'right',
      render: (o, record, index) => {
        if (readonly || this.props.type === 'entry') {
          return <span />;
        } else if (index === editIndex) {
          return (
            <span>
              <RowUpdater onHit={this.handleSave} label={this.msg('save')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleCancel} label={this.msg('cancel')} />
            </span>
          );
        } else if (index + 1 + (pagination.current - 1) * pagination.pageSize === totalCount) {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('append')}
                index={index} row={{}}
              />
            </span>
          );
        } else {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('edit')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDel} label={this.msg('delete')}
                row={record} index={index}
              />
            </span>
          );
        }
      },
    });
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
      const { billHead, tenantId } = this.props;
      this.props.getItemForBody({
        tenantId,
        delgNo: billHead.delg_no,
        tradeCode: billHead.trade_co,
        copProdNo: value,
      });
    }
    if (field === 'codes' && !this.props.bodyItem) {
      this.props.getHscodeForBody({ hscode: value });
    }
  }
  handleEdit = (row, index) => {
    if (this.props.headNo) {
      this.setState({
        editIndex: index,
        editBody: row,
      });
    } else {
      message.error(this.msg('headUncreated'));
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
          message.error(result.error.message);
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
          message.error(result.error.message);
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
        message.error(result.error.message);
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
  handleNetWetSummary = (ev) => {
    ev.stopPropagation();
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
  handleGrossWtDivid = (ev) => {
    ev.stopPropagation();
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
  handleTotalPriceDivid = (ev) => {
    ev.stopPropagation();
    this.props.loadBillBody(this.props.billSeqNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.openAmountModel();
      }
    });
  }
  handleMenuClick = (e) => {
    if (e.key === 'download') {
      window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/model/download/${createFilename('billbodyModel')}.xlsx`);
    } else if (e.key === 'downloadRelated') {
      window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/related/model/download/${createFilename('relatedModel')}.xlsx`);
    } else if (e.key === 'export') {
      window.open(`${API_ROOTS.default}v1/cms/manifest/billbody/export/${createFilename('billbodyExport')}.xlsx?billSeqNo=${this.props.billSeqNo}`);
    }
  }
  handleUploaded = () => {
    this.props.loadBillBody(this.props.billSeqNo);
  }
  handleEntrybodyExport = () => {
    const preSeqNo = this.props.entryHead.pre_entry_seq_no;
    const timestamp = Date.now().toString().substr(-6);
    window.open(`${API_ROOTS.default}v1/cms/manifest/declare/export/entry_${preSeqNo}_${timestamp}.xlsx?headId=${this.props.headNo}`);
  }
  handleDeleteSelected = () => {
    const selectedIds = this.state.selectedRowKeys;
    this.props.deleteSelectedBodies(selectedIds).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadBillBody(this.props.billSeqNo);
      }
    });
  }
  render() {
    const { totGrossWt, totWetWt, totTrade, totPcs } = this.state;
    const selectedRows = this.state.selectedRowKeys;
    const disabled = this.props.readonly || this.props.type === 'entry';
    const rowSelection = {
      selectedRowKeys: selectedRows,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      getCheckboxProps: () => ({ disabled }),
    };
    const columns = this.getColumns();
    let billBodyToolbar = (
      <Button type="primary" onClick={() => this.handleMenuClick({ key: 'export' })}>
        <Icon type="export" /> 导出数据
      </Button>
    );
    if (this.props.type === 'bill') {
      const menu = (
        <Menu onClick={this.handleMenuClick}>
          <Menu.Item key="download"><Icon type="download" /> 下载模板(非关联)</Menu.Item>
          {!this.props.readonly &&
          <Menu.Item key="importData">
            <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/manifest/billbody/import`}
              formData={{
                data: JSON.stringify({
                  bill_seq_no: this.props.billSeqNo,
                  tenant_id: this.props.tenantId,
                  creater_login_id: this.props.loginId,
                }),
              }} onUploaded={this.handleUploaded}
            >
              <Icon type="file-excel" /> {this.msg('unrelatedImport')}
            </ExcelUpload>
          </Menu.Item>
          }
          <Menu.Item key="downloadRelated"><Icon type="download" /> 下载模板(关联)</Menu.Item>
          {!this.props.readonly &&
          <Menu.Item key="importRelatedData">
            <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/manifest/billbody/related/import`}
              formData={{
                data: JSON.stringify({
                  bill_seq_no: this.props.billSeqNo,
                  tenant_id: this.props.tenantId,
                  creater_login_id: this.props.loginId,
                  delgNo: this.props.billHead.delg_no,
                  tradeCode: this.props.billHead.trade_co,
                }),
              }} onUploaded={this.handleUploaded}
            >
              <Icon type="file-excel" /> {this.msg('relatedImport')}
            </ExcelUpload>
          </Menu.Item>
          }
          <Menu.Item key="export"><Icon type="export" /> 导出数据</Menu.Item>
        </Menu>);
      billBodyToolbar = (
        <span>
          {selectedRows.length > 0 &&
            <Popconfirm title={'是否删除所有选择项？'} onConfirm={() => this.handleDeleteSelected()}>
              <Button type="danger" size="large" icon="delete">
                批量删除
              </Button>
            </Popconfirm>}
          <Button icon="pie-chart" onClick={this.handleTotalPriceDivid}>金额平摊</Button>
          <Button icon="arrows-alt" onClick={this.handleGrossWtDivid}>毛重分摊</Button>
          <Button icon="shrink" onClick={this.handleNetWetSummary}>净重汇总</Button>
          <Dropdown overlay={menu} type="primary">
            <Button type="primary" onClick={this.handleButtonClick}>
              {this.msg('importBody')} <Icon type="down" />
            </Button>
          </Dropdown>
        </span>);
    }
    return (
      <div className="pane">
        <div className="pane-header">
          <span style={{ marginLeft: 10 }}>总毛重: </span><span style={{ color: '#FF9933' }}>{totGrossWt.toFixed(3)}</span>
          <span style={{ marginLeft: 10 }}>总净重: </span><span style={{ color: '#FF9933' }}>{totWetWt.toFixed(3)}</span>
          <span style={{ marginLeft: 10 }}>总金额: </span><span style={{ color: '#FF9933' }}>{totTrade.toFixed(3)}</span>
          {this.props.type === 'bill' &&
            <span>
              <span style={{ marginLeft: 10 }}>总个数: </span>
              <span style={{ color: '#FF9933' }}>{totPcs.toFixed(3)}</span>
            </span>
          }
          <div className="toolbar-right">
            {billBodyToolbar}
            {this.props.type === 'entry' &&
              <Button icon="export" onClick={this.handleEntrybodyExport}>导出表体数据</Button>
            }
          </div>
        </div>
        <div className="panel-body table-panel">
          <Table bordered rowKey="id" columns={columns} dataSource={this.state.bodies} size="middle"
            scroll={{ x: 2600 }} pagination={this.state.pagination} rowSelection={rowSelection}
          />
          <AmountModel />
        </div>
      </div>);
  }
}
