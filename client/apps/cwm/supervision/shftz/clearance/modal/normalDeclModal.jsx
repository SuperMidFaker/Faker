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
import messages from '../../message.i18n';
import { closeNormalDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginNormalDecl } from 'common/reducers/cwmShFtz';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmShFtz.clearanceModal.visible,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    ownerCusCode: state.cwmShFtz.clearanceModal.ownerCusCode,
    normalRegs: state.cwmShFtz.batchout_regs,
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
    })),
    trxModes: state.cwmShFtz.params.trxModes.map(tm => ({
      value: tm.trx_mode,
      text: tm.trx_spec,
    })),
    submitting: state.cwmShFtz.submitting,
    suppliers: state.cwmReceive.suppliers,
  }),
  { closeNormalDeclModal, loadParams, loadBatchOutRegs, loadBatchRegDetails, beginNormalDecl, getSuppliers }
)
export default class NormalDeclModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerCusCode: '',
    relDateRange: [],
    relNo: '',
    ietype: 'import',
    normalRegs: [],
    regDetails: [],
    supplier: '',
    currency: '',
    trxMode: '',
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
    if (nextProps.visible && nextProps.ownerCusCode && nextProps.visible !== this.props.visible) {
      this.props.loadBatchOutRegs({
        tenantId: this.props.tenantId,
        owner_cus_code: nextProps.ownerCusCode,
        whse_code: nextProps.defaultWhse.code,
        rel_type: 'normal',
      });
      this.setState({ ownerCusCode: nextProps.ownerCusCode });
      const owner = this.props.owners.find(ow => ow.customs_code === nextProps.ownerCusCode);
      this.props.getSuppliers(this.props.tenantId, this.props.defaultWhse.code, owner.id);
    }
  }

  msg = key => formatMsg(this.props.intl, key);
  normalRegColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: '货主',
    dataIndex: 'owner_name',
  }, {
    title: '普通出库供应商',
    dataIndex: 'supplier',
    width: 150,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 80,
  }, {
    title: '成交方式',
    dataIndex: 'trxn_mode',
    width: 100,
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
  }]

  regDetailColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
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
  handleCancel = () => {
    this.setState({ ownerCusCode: '', normalRegs: [], regDetails: [], rel_no: '', relDateRange: [] });
    this.props.closeNormalDeclModal();
  }
  handleOwnerChange = (ownerCusCode) => {
    const owner = this.props.owners.find(ow => ow.customs_code === ownerCusCode);
    this.props.getSuppliers(this.props.tenantId, this.props.defaultWhse.code, owner.id);
    this.setState({ ownerCusCode });
  }
  handleSupplierChange = (supplier) => {
    this.setState({ supplier });
  }
  handleCurrencyChange = (currency) => {
    this.setState({ currency });
  }
  handleTrxModeChange = (trxMode) => {
    this.setState({ trxMode });
  }
  handleRelNoChange = (ev) => {
    this.setState({ relNo: ev.target.value });
  }
  handleRelRangeChange = (relDateRange) => {
    this.setState({ relDateRange });
  }
  handleNormalOutsQuery = () => {
    const { ownerCusCode, relNo, relDateRange, currency, supplier, trxMode } = this.state;
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
  handleIetypeChange = (ev) => {
    this.setState({ ietype: ev.target.value });
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
    const { loginId, loginName } = this.props;
    this.props.beginNormalDecl(this.state.ietype, detailIds, relCounts, owner, loginId, loginName).then((result) => {
      if (!result.error) {
        this.handleCancel();
        this.props.reload();
      } else {
        message.error(result.error.message);
      }
    });
  }

  render() {
    const { submitting } = this.props;
    const { relNo, ownerCusCode, supplier, currency, trxMode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const extraForm = (
      <Form layout="inline" style={{ marginLeft: 16 }}>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="货主">
              <Select onChange={this.handleOwnerChange} style={{ width: 200 }} placeholder="请选择货主" value={ownerCusCode}>
                {this.props.owners.map(data => (
                  <Option key={data.customs_code} value={data.customs_code}>
                    {data.partner_code}{data.partner_code ? '|' : ''}{data.name}
                  </Option>))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="供应商">
              <Select onChange={this.handleSupplierChange} style={{ width: 200 }} value={supplier}>
                {this.props.suppliers.map(data => (
                  <Option key={data.code} value={data.code}>
                    {data.name}
                  </Option>))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="成交方式">
              <Select onChange={this.handleTrxModeChange} style={{ width: 200 }} value={trxMode}>
                {this.props.trxModes.map(data => (
                  <Option key={data.value} value={data.value}>
                    {data.text}
                  </Option>))}
              </Select>
            </FormItem>
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="币制">
              <Select onChange={this.handleCurrencyChange} style={{ width: 200 }} value={currency}>
                {this.props.currencies.map(data => (
                  <Option key={data.value} value={data.value}>
                    {data.text}
                  </Option>))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label="出库单号">
              <Input value={relNo} onChange={this.handleRelNoChange} style={{ width: 200 }} />
            </FormItem>
          </Col>
          <Button type="primary" ghost size="large" onClick={this.handleNormalOutsQuery}>查找</Button>
        </Row>
      </Form>);
    const title = (<div>
      <span>新建出库清关</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={this.state.regDetails.length === 0} loading={submitting} onClick={this.handleBatchClear}>保存</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card noHovering bodyStyle={{ padding: 8, paddingBottom: 0 }}>
          <HeadForm />
        </Card>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="普通出库单" bodyStyle={{ padding: 0 }} noHovering>
              <div className="table-panel table-fixed-layout">
                <div className="toolbar">
                  {extraForm}
                </div>
                <Table size="middle" columns={this.normalRegColumns} dataSource={this.state.normalRegs} rowKey="id"
                  scroll={{ x: this.normalRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="报关清单明细" bodyStyle={{ padding: 0 }} noHovering>
              <div className="table-panel table-fixed-layout">
                <div className="toolbar">
                  <Search size="large" placeholder="出库单号" style={{ width: 200 }} onSearch={this.handleSearch} />
                </div>
                <Table size="middle" columns={this.regDetailColumns} dataSource={this.state.regDetails} rowKey="id"
                  scroll={{ x: this.regDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}
