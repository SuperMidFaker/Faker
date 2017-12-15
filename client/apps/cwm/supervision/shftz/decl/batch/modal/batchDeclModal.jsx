import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Table, Form, Modal, Radio, Row, Col, Select, Tag, Input, message, Checkbox } from 'antd';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';
import { loadBrokers } from 'common/reducers/cwmWarehouse';
import { loadManifestTemplates, closeBatchDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginBatchDecl } from 'common/reducers/cwmShFtz';
import { getSuppliers } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantName: state.account.tenantName,
    customsCode: state.account.customsCode,
    visible: state.cwmShFtz.batchDeclModal.visible,
    submitting: state.cwmShFtz.submitting,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners.filter(owner => owner.portion_enabled),
    ownerCusCode: state.cwmShFtz.batchDeclModal.ownerCusCode,
    portionRegs: state.cwmShFtz.batchout_regs,
    billTemplates: state.cwmShFtz.billTemplates,
    loginId: state.account.loginId,
    loginName: state.account.username,
    units: state.cwmShFtz.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cwmShFtz.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
      search: `${tc.cntry_co}${tc.cntry_name_en}${tc.cntry_name_cn}${tc.cntry_en_short}`,
    })),
    trxModes: state.cwmShFtz.params.trxModes.map(tx => ({
      value: tx.trx_mode,
      text: tx.trx_spec,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
    })),
    suppliers: state.cwmReceive.suppliers,
    brokers: state.cwmWarehouse.brokers,
  }),
  {
    loadBrokers, loadManifestTemplates, closeBatchDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginBatchDecl, getSuppliers,
  }
)
@Form.create()
export default class BatchDeclModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerCusCode: '',
    relDateRange: [],
    relNo: '',
    portionRegs: [],
    regDetails: [],
    supplier: '',
    currency: '',
    template: undefined,
    groupVals: ['supplier', 'trxn_mode', 'currency'],
    ftzRelNo: '',
    selectedRowKeys: [],
    selectedRows: [],
    destCountry: '142',
    dutyMode: '1',
    portionRowSelKeys: [],
    portionSelRows: [],
  }
  componentWillMount() {
    this.props.loadParams();
    this.props.loadBrokers(this.props.defaultWhse.code);
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460),
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.portionRegs !== this.props.portionRegs) {
      this.setState({ portionRegs: nextProps.portionRegs });
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  portionRegColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: '货主',
    dataIndex: 'owner_name',
    width: 200,
  }, {
    title: '收货单位',
    dataIndex: 'receiver_name',
    width: 200,
  }, {
    title: '出库日期',
    dataIndex: 'ftz_rel_date',
    render: o => o && moment(o).format('YYYY.MM.DD'),
    width: 180,
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddReg(record)} />,
  }]

  regDetailColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
    width: 120,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    render: o => <TrimSpan text={o} maxLen={30} />,
    width: 260,
  }, {
    title: '原产国',
    dataIndex: 'country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '单位',
    dataIndex: 'out_unit',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '供货商',
    width: 100,
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    width: 100,
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}| ${mode.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
  }, {
    title: '币制',
    width: 100,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '目的国',
    dataIndex: 'dest_country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      return country ? <Tag>{`${country.value}| ${country.text}`}</Tag> : o;
    },
  }, {
    title: '删除',
    width: 80,
    fixed: 'right',
    render: (o, record) => (<span><Button type="danger" size="small" ghost icon="minus" onClick={() => this.handleDelDetail(record)} /></span>),
  }]
  handleAddReg = (row) => {
    this.props.loadBatchRegDetails(row.pre_entry_seq_no).then((result) => {
      if (!result.error) {
        const relNo = row.ftz_rel_no;
        const regDetails = this.state.regDetails.filter(reg => reg.ftz_rel_no !== relNo).concat(result.data.map(dt => ({ ...dt, ftz_rel_no: relNo })));
        const portionRegs = this.state.portionRegs.map(pr => pr.ftz_rel_no === relNo ? { ...pr, added: true } : pr);
        this.setState({ regDetails, portionRegs });
      }
    });
  }
  batchAdd = () => {
    const { portionSelRows } = this.state;
    const preEntrySeqNos = portionSelRows.map(item => item.pre_entry_seq_no);
    const relNos = portionSelRows.map(item => item.ftz_rel_no);
    this.props.loadBatchRegDetails(preEntrySeqNos).then((result) => {
      if (!result.error) {
        const regDetails = this.state.regDetails.filter(reg => !relNos.find(no => no === reg.ftz_rel_no)).concat(result.data);
        const portionRegs = this.state.portionRegs.map(pr => relNos.find(no => no === pr.ftz_rel_no) ? { ...pr, added: true } : pr);
        this.setState({
          regDetails, portionRegs, portionRowSelKeys: [], portionSelRows: [],
        });
      }
    });
  }
  handleDelDetail = (detail) => {
    const regDetails = this.state.regDetails.filter(reg => reg.ftz_rel_detail_id !== detail.ftz_rel_detail_id);
    const portionRegs = this.state.portionRegs.map(pr => pr.ftz_rel_no === detail.ftz_rel_no ? { ...pr, added: false } : pr);
    this.setState({ regDetails, portionRegs });
    message.info(`出库明细ID${detail.ftz_rel_detail_id}已删除`);
  }
  batchDelete = () => {
    const { selectedRows, regDetails } = this.state;
    const portionRegs = [...this.state.portionRegs];
    const newRegDetails = [];
    for (let i = 0; i < regDetails.length; i++) {
      const detail = regDetails[i];
      if (!selectedRows.find(seldetail => seldetail.ftz_rel_detail_id === detail.ftz_rel_detail_id)) {
        newRegDetails.push(detail);
      } else {
        portionRegs.find(pr => pr.ftz_rel_no === detail.ftz_rel_no).added = false;
      }
    }
    this.setState({
      portionRegs,
      regDetails: newRegDetails,
      selectedRowKeys: [],
      selectedRows: [],
    });
  }
  handleCancel = () => {
    this.setState({
      ownerCusCode: '',
      portionRegs: [],
      regDetails: [],
      relNo: '',
      relDateRange: [],
      template: undefined,
      destCountry: '',
      dutyMode: '',
      portionRowSelKeys: [],
      portionSelRows: [],
    });
    this.props.closeBatchDeclModal();
    this.props.form.resetFields();
  }
  handleOwnerChange = (ownerCusCode) => {
    this.props.loadBatchOutRegs({
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'portion',
    });
    this.setState({
      ownerCusCode,
      relDateRange: [],
      relNo: '',
      portionRegs: [],
      regDetails: [],
      template: undefined,
      groupVals: ['supplier', 'trxn_mode', 'currency'],
      ftzRelNo: '',
    });
    const owner = this.props.owners.find(ow => ow.customs_code === ownerCusCode);
    if (owner) {
      this.props.loadManifestTemplates({
        owner_partner_id: owner.id,
        ietype: 0,
      });
    }
    this.props.getSuppliers(this.props.defaultWhse.code, owner.id);
  }
  handleTemplateChange = (template) => {
    this.setState({ template });
  }
  handleRelNoChange = (ev) => {
    this.setState({ relNo: ev.target.value });
  }
  handleRelRangeChange = (relDateRange) => {
    this.setState({ relDateRange });
  }
  handlePortionOutsQuery = () => {
    const { ownerCusCode, relNo, relDateRange } = this.state;
    this.props.loadBatchOutRegs({
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'portion',
      rel_no: relNo,
      start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
      end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
    });
  }
  handleBatchDecl = () => {
    if (!this.state.ownerCusCode) {
      message.error('货主未选定');
      return;
    }
    const detailIds = [];
    const relCountObj = {};
    this.state.regDetails.forEach((regd) => {
      detailIds.push(regd.id);
      if (relCountObj[regd.ftz_rel_no]) {
        relCountObj[regd.ftz_rel_no] += 1;
      } else {
        relCountObj[regd.ftz_rel_no] = 1;
      }
    });
    const relCounts = Object.keys(relCountObj).map(relNo => ({
      rel_no: relNo,
      count: relCountObj[relNo],
    }));
    const owner = this.props.owners.filter(own => own.customs_code === this.state.ownerCusCode).map(own => ({
      partner_id: own.id,
      tenant_id: own.partner_tenant_id,
      customs_code: own.customs_code,
      name: own.name,
    }))[0];
    const {
      loginId, loginName, tenantName, defaultWhse,
    } = this.props;
    const {
      template, groupVals, destCountry, dutyMode,
    } = this.state;
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const fbroker = this.props.brokers.find(bk => bk.customs_code === values.broker);
      const broker = fbroker ? { name: fbroker.name, partner_id: fbroker.partner_id, tenant_id: fbroker.partner_tenant_id } : { name: tenantName };
      this.props.beginBatchDecl({
        template,
        detailIds,
        relCounts,
        owner,
        loginId,
        loginName,
        groupVals,
        broker,
        applyType: values.apply_type,
        ietype: values.ietype,
        destCountry,
        dutyMode,
        customsCode: defaultWhse.customs_code,
      }).then((result) => {
        if (!result.error) {
          this.handleCancel();
          this.props.reload();
        } else {
          message.error(result.error.message);
        }
      });
    });
  }
  handleCheckChange = (checkedValues) => {
    this.setState({ groupVals: checkedValues });
  }
  handleFtzRelNoChange = (ev) => {
    this.setState({ ftzRelNo: ev.target.value });
  }
  handleDutyModeChange = (dutyMode) => {
    this.setState({ dutyMode });
  }
  handleDestCountryChange = (destCountry) => {
    this.setState({ destCountry });
  }
  render() {
    const {
      form: { getFieldDecorator }, owners, brokers, customsCode, tenantName, submitting, billTemplates, exemptions, tradeCountries,
    } = this.props;
    const {
      relNo, ownerCusCode, template, regDetails, dutyMode, destCountry,
    } = this.state;
    const dataSource = regDetails.filter((item) => {
      if (this.state.ftzRelNo) {
        const reg = new RegExp(this.state.ftzRelNo);
        return reg.test(item.ftz_rel_no);
      } else {
        return true;
      }
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      selectedRows: this.state.selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    const portionRowSelection = {
      selectedRowKeys: this.state.portionRowSelKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ portionRowSelKeys: selectedRowKeys, portionSelRows: selectedRows });
      },
      selections: [{
        key: 'all-data',
        text: 'Select All Data',
        onSelect: () => {
          const selectedRowKeys = this.state.portionRegs.map(item => item.id);
          this.setState({
            portionRowSelKeys: selectedRowKeys,
            portionSelRows: this.state.portionRegs,
          });
        },
      }],
    };
    const title = (<div>
      <span>新建分拨集中报关</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" loading={submitting} disabled={this.state.regDetails.length === 0} onClick={this.handleBatchDecl}>保存</Button>
      </div>
    </div>);
    const detailExtra = (
      <FormItem label="拆分选项">
        <Checkbox.Group onChange={this.handleCheckChange} value={this.state.groupVals}>
          <Checkbox value="supplier">供货商</Checkbox>
          <Checkbox value="trxn_mode">成交方式</Checkbox>
          <Checkbox value="currency">币制</Checkbox>
        </Checkbox.Group>
      </FormItem>
    );
    return (
      <Modal maskClosable={false} title={title} width="100%" wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card hoverable={false} bodyStyle={{ paddingBottom: 16 }}>
          <Form className="form-layout-compact">
            <Row gutter={16}>
              <Col span={4}>
                <FormItem label="货主">
                  {getFieldDecorator('owner', {
 initialValue: ownerCusCode,
                    rules: [{ required: true, message: '收货单位必选' }],
                  })(<Select placeholder="请选择收货单位" onChange={this.handleOwnerChange} showSearch optionFilterProp="children" >
                    {owners.map(owner => (<Option value={owner.customs_code} key={owner.customs_code}>{owner.name}</Option>))}
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label="报关代理">
                  {getFieldDecorator('broker', { rules: [{ required: true, message: '报关代理必选' }] })(<Select placeholder="请选择报关代理" >
                    {brokers.map(broker => (<Option value={broker.customs_code} key={broker.customs_code}>{broker.name}</Option>)).concat(<Option value={customsCode} key={customsCode}>{tenantName}</Option>)}
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label="报关申请类型">
                  {getFieldDecorator('apply_type', {
                    initialValue: '0',
                  })(<Select placeholder="请选择报关申请类型">
                    <Option value="0" key="0">普通报关申请单</Option>
                    <Option value="1" key="1">跨关区报关申请单</Option>
                    <Option value="2" key="2">保展报关申请单</Option>
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem label="进出口标识">
                  {getFieldDecorator('ietype', { initialValue: 'import' })(<RadioGroup>
                    <RadioButton value="import">进口</RadioButton>
                    <RadioButton value="export">出口</RadioButton>
                  </RadioGroup>)}
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem label="征免方式">
                  <Select allowClear optionFilterProp="children" value={dutyMode} onChange={this.handleDutyModeChange}>
                    {exemptions.map(data => (
                      <Option key={data.value}>{`${data.value}|${data.text}`}</Option>
                      ))}
                  </Select>
                </FormItem>
              </Col>

              <Col span={3}>
                <FormItem label="最终目的国">
                  <Select showSearch showArrow allowClear optionFilterProp="search" value={destCountry} onChange={this.handleDestCountryChange}>
                    {tradeCountries.map(data => (
                      <Option key={data.value} search={`${data.search}`} >{`${data.value}|${data.text}`}</Option>
            ))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem label="制单规则">
                  <Select allowClear onChange={this.handleTemplateChange} value={template}>
                    {billTemplates && billTemplates.map(data => (<Option key={data.name} value={data.id}>{data.name}</Option>))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
        <Form layout="inline">
          <Row gutter={8}>
            <Col sm={24} md={8} lg={10}>
              <Card title="分拨出库单" bodyStyle={{ padding: 0 }} hoverable={false}>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Input placeholder="出库单号" value={relNo} onChange={this.handleRelNoChange} style={{ width: 200, marginRight: 8 }} />
                    <Button icon="search" onClick={this.handlePortionOutsQuery} />
                    <div className={`bulk-actions ${this.state.portionRowSelKeys.length === 0 ? 'hide' : ''}`}>
                      <h3>已选中{this.state.portionRowSelKeys.length}项</h3>
                      {this.state.portionRowSelKeys.length !== 0 && <Button onClick={this.batchAdd}>批量添加</Button>}
                    </div>
                  </div>
                  <Table columns={this.portionRegColumns} dataSource={this.state.portionRegs} rowKey="id" rowSelection={portionRowSelection}
                    scroll={{ x: this.portionRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
            <Col sm={24} md={16} lg={14}>
              <Card title="集中报关明细" extra={detailExtra} bodyStyle={{ padding: 0 }} hoverable={false}>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Search placeholder="出库单号" style={{ width: 200 }} onChange={this.handleFtzRelNoChange}
                      value={this.state.ftzRelNo}
                    />
                    <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                      <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                      {this.state.selectedRowKeys.length !== 0 && <Button onClick={this.batchDelete}>批量删除</Button>}
                    </div>
                  </div>
                  <Table columns={this.regDetailColumns} dataSource={dataSource} rowKey="id" rowSelection={rowSelection}
                    scroll={{ x: this.regDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
