import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Card, Row, Col, Table, Form, Modal, Select, Tag, Input, message } from 'antd';
import { getSuppliers } from 'common/reducers/cwmReceive';
import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import HeadForm from '../form/headForm';
import messages from '../../../message.i18n';
import { loadManifestTemplates, closeNormalDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginNormalDecl } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    visible: state.cwmShFtz.clearanceModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    ownerCusCode: state.cwmShFtz.clearanceModal.ownerCusCode,
    normalRegs: state.cwmShFtz.batchout_regs,
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
    trxModes: state.cwmShFtz.params.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: tm.trx_spec,
    })),
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
      search: `${ep.value}${ep.text}`,
    })),
    submitting: state.cwmShFtz.submitting,
    suppliers: state.cwmReceive.suppliers,
    brokers: state.cwmWarehouse.brokers,
  }),
  { loadManifestTemplates, closeNormalDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginNormalDecl, getSuppliers }
)
@Form.create()
export default class NormalDeclModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    ownerCusCode: '',
    relDateRange: [],
    relNo: '',
    normalRegs: [],
    regDetails: [],
    supplier: '',
    currency: '',
    template: undefined,
    ftzRelNo: '',
    searchText: '',
    dutyMode: '1',
    destCountry: '142',
  }
  componentWillMount() {
    this.props.loadParams();
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: (window.innerHeight - 460),
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.normalRegs !== this.props.normalRegs) {
      this.setState({ normalRegs: nextProps.normalRegs });
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  regDetailColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: 'HS编码',
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
    width: 240,
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
        const regDetails = this.state.regDetails.filter(reg => reg.ftz_rel_no !== relNo).concat(
          result.data.map(dt => ({ ...dt, ftz_rel_no: relNo })));
        const normalRegs = this.state.normalRegs.map(pr => pr.ftz_rel_no === relNo ? { ...pr, added: true } : pr);
        this.setState({ regDetails, normalRegs });
      }
    });
  }
  handleDelDetail = (detail) => {
    const regDetails = this.state.regDetails.filter(reg => reg.id !== detail.id);
    const normalRegs = this.state.normalRegs.map(pr => pr.ftz_rel_no === detail.ftz_rel_no ? { ...pr, added: false } : pr);
    this.setState({ regDetails, normalRegs });
  }
  batchDelete = () => {
    const { selectedRowKeys, regDetails } = this.state;
    const normalRegs = [...this.state.normalRegs];
    const newRegDetails = [];
    for (let i = 0; i < regDetails.length; i++) {
      const detail = regDetails[i];
      if (!selectedRowKeys.find(key => key === detail.id)) {
        newRegDetails.push(detail);
      } else {
        normalRegs.find(pr => pr.ftz_rel_no === detail.ftz_rel_no).added = false;
      }
    }
    this.setState({
      normalRegs,
      regDetails: newRegDetails,
      selectedRowKeys: [],
    });
  }
  handleCancel = () => {
    this.setState({ ownerCusCode: '',
      normalRegs: [],
      regDetails: [],
      relNo: '',
      relDateRange: [],
      ftzRelNo: '',
      supplier: '',
      currency: '',
      template: undefined,
      destCountry: '',
      dutyMode: '',
    });
    this.props.form.resetFields();
    this.props.closeNormalDeclModal();
  }
  handleTemplateChange = (template) => {
    this.setState({ template });
  }
  handleSupplierChange = (supplier) => {
    this.setState({ supplier });
    const { ownerCusCode, relNo, relDateRange, currency } = this.state;
    const trxMode = this.props.form.getFieldValue('trxn_mode');
    this.props.loadBatchOutRegs({
      tenantId: this.props.tenantId,
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'normal',
      rel_no: relNo,
      start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
      end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
      currency,
      supplier,
      trxMode,
    });
  }
  handleCurrencyChange = (currency) => {
    this.setState({ currency });
    const { ownerCusCode, relNo, relDateRange, supplier } = this.state;
    const trxMode = this.props.form.getFieldValue('trxn_mode');
    this.props.loadBatchOutRegs({
      tenantId: this.props.tenantId,
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'normal',
      rel_no: relNo,
      start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
      end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
      currency,
      supplier,
      trxMode,
    });
  }
  handleRelNoChange = (ev) => {
    this.setState({ relNo: ev.target.value });
  }
  handleRelRangeChange = (relDateRange) => {
    this.setState({ relDateRange });
  }
  handleFtzRelNoChange = (ev) => {
    this.setState({ ftzRelNo: ev.target.value });
  }
  handleNormalOutsQuery = () => {
    const { ownerCusCode, relNo, relDateRange, currency, supplier } = this.state;
    const trxMode = this.props.form.getFieldValue('trxn_mode');
    this.props.loadBatchOutRegs({
      tenantId: this.props.tenantId,
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'normal',
      rel_no: relNo,
      start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
      end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
      currency,
      supplier,
      trxMode,
    });
  }
  handleBatchClear = () => {
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
    const { loginId, loginName, tenantName } = this.props;
    const { destCountry, dutyMode } = this.state;
    this.props.form.validateFields((errors, values) => {
      const fbroker = this.props.brokers.find(bk => bk.customs_code === values.broker);
      const broker = fbroker ? { name: fbroker.name, partner_id: fbroker.partner_id, tenant_id: fbroker.partner_tenant_id } : { name: tenantName };
      this.props.beginNormalDecl({
        ietype: values.ietype,
        template: this.state.template,
        detailIds,
        relCounts,
        owner,
        loginId,
        loginName,
        broker,
        trxnMode: values.trxn_mode,
        destCountry,
        dutyMode,
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
  handleOwnerChange = (ownerCusCode) => {
    this.props.loadBatchOutRegs({
      tenantId: this.props.tenantId,
      owner_cus_code: ownerCusCode,
      whse_code: this.props.defaultWhse.code,
      rel_type: 'normal',
    });
    const owner = this.props.owners.find(ow => ow.customs_code === ownerCusCode);
    this.setState({
      ownerCusCode,
      regDetails: [],
      relNo: '',
      relDateRange: [],
      ftzRelNo: '',
      template: undefined,
    });
    if (owner) {
      this.props.loadManifestTemplates({
        owner_partner_id: owner.id,
        tenant_id: this.props.tenantId,
        ietype: 0,
      });
      this.props.getSuppliers(this.props.tenantId, this.props.defaultWhse.code, owner.id);
    }
  }
  handleSearch = (searchText) => {
    this.setState({ searchText });
  }
  handleDutyModeChange = (dutyMode) => {
    this.setState({ dutyMode });
  }
  handleDestCountryChange = (destCountry) => {
    this.setState({ destCountry });
  }
  render() {
    const { submitting, billTemplates, exemptions, tradeCountries } = this.props;
    const { relNo, ownerCusCode, template, regDetails, dutyMode, destCountry } = this.state;
    const dataSource = regDetails.filter((item) => {
      if (this.state.ftzRelNo) {
        const reg = new RegExp(this.state.ftzRelNo);
        return reg.test(item.ftz_rel_no);
      } else {
        return true;
      }
    });
    const normalRegColumns = [{
      title: '出库单号',
      dataIndex: 'ftz_rel_no',
    }, {
      title: '供货商',
      dataIndex: 'supplier',
      width: 150,
      filterDropdown: (
        <div className="filter-dropdown">
          <Select allowClear onChange={this.handleSupplierChange} style={{ width: 150 }} value={this.state.supplier}>
            {this.props.suppliers.map(data => (
              <Option key={data.code} value={data.code}>
                {data.name}
              </Option>))}
          </Select>
        </div>
      ),
    }, {
      title: '币制',
      dataIndex: 'currency',
      width: 80,
      render: o => o && this.props.currencies.find(currency => currency.value === o).text,
      filterDropdown: (
        <div className="filter-dropdown">
          <Select allowClear placeholder="币制" onChange={this.handleCurrencyChange} style={{ width: 80 }} value={this.state.currency}>
            {this.props.currencies.map(data => (
              <Option key={data.value} value={data.value}>
                {data.text}
              </Option>))}
          </Select>
        </div>
      ),
    }, {
      title: '货主',
      dataIndex: 'owner_name',
      width: 150,
    }, {
      title: '成交方式',
      dataIndex: 'trxn_mode',
      width: 100,
      render: o => o && this.props.trxModes.find(trx => trx.value === o).text,
    }, {
      title: '出库日期',
      width: 150,
      dataIndex: 'ftz_rel_date',
      render: o => o && moment(o).format('YYYY.MM.DD'),
    }, {
      title: '添加',
      width: 80,
      fixed: 'right',
      render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddReg(record)} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const extraForm = (
      <div>
        <FormItem label="货主">
          <Select style={{ width: 150 }} disabled placeholder="请选择货主" value={ownerCusCode}>
            {this.props.owners.map(data => (
              <Option key={data.customs_code} value={data.customs_code}>
                {data.partner_code}{data.partner_code ? '|' : ''}{data.name}
              </Option>))}
          </Select>
        </FormItem>
        <FormItem label="出库单号">
          <Input value={relNo} onChange={this.handleRelNoChange} />
        </FormItem>
        <Button type="primary" ghost size="large" onClick={this.handleNormalOutsQuery}>查找</Button>
      </div>);
    const title = (<div>
      <span>新建普通出库报关</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={this.state.regDetails.length === 0} loading={submitting} onClick={this.handleBatchClear}>保存</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card noHovering bodyStyle={{ paddingBottom: 16 }}>
          <HeadForm ownerCusCode={this.state.ownerCusCode} handleOwnerChange={this.handleOwnerChange} form={this.props.form} />
        </Card>
        <Form layout="inline">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="普通出库单" bodyStyle={{ padding: 0 }} noHovering>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    {extraForm}
                  </div>
                  <Table columns={normalRegColumns} dataSource={this.state.normalRegs} rowKey="id"
                    scroll={{ x: normalRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                  />
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="出库报关明细" bodyStyle={{ padding: 0 }} noHovering>
                <div className="table-panel table-fixed-layout">
                  <div className="toolbar">
                    <Search size="large" placeholder="出库单号" style={{ width: 200 }} onChange={this.handleFtzRelNoChange} onSearch={this.handleSearch} />
                    <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                      <h3>已选中{this.state.selectedRowKeys.length}项</h3>
                      {this.state.selectedRowKeys.length !== 0 && <Button onClick={this.batchDelete}>批量删除</Button>}
                    </div>
                    <div className="toolbar-right">
                      <FormItem label="征免方式">
                        <Select showSearch showArrow optionFilterProp="search" value={dutyMode} onChange={this.handleDutyModeChange} style={{ width: 100 }} >
                          {
                            exemptions.map(data => (
                              <Option key={data.value} search={`${data.search}`} >
                                {`${data.value}|${data.text}`}
                              </Option>)
                            )}
                        </Select>
                      </FormItem>
                      <FormItem label="最终目的国">
                        <Select showSearch showArrow optionFilterProp="search" value={destCountry} onChange={this.handleDestCountryChange} style={{ width: 100 }}>
                          {
                            tradeCountries.map(data => (
                              <Option key={data.value} search={`${data.search}`} >
                                {`${data.value}|${data.text}`}
                              </Option>)
                            )}
                        </Select>
                      </FormItem>
                      <FormItem label="制单规则">
                        <Select allowClear size="large" onChange={this.handleTemplateChange} style={{ width: 200 }} value={template}>
                          {billTemplates && billTemplates.map(data => (<Option key={data.name} value={data.id}>{data.name}</Option>))}
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                  <Table columns={this.regDetailColumns} dataSource={dataSource} rowKey="id" rowSelection={rowSelection}
                    scroll={{ x: this.regDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 500), 0), y: this.state.scrollY }}
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
