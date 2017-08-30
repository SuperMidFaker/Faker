import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { notification, Button, Card, DatePicker, Table, Form, Modal, Select, Tag, Input, message } from 'antd';
import TrimSpan from 'client/components/trimSpan';
import { loadParams, showTransferInModal, loadEntryTransRegs, loadEntryTransInDetails, saveVirtualTransfer } from 'common/reducers/cwmShFtz';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmShFtz.transInModal.visible,
    ownerCusCode: state.cwmShFtz.transInModal.ownerCusCode,
    transRegs: state.cwmShFtz.transRegs,
    defaultWhse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    portionRegs: state.cwmShFtz.batchout_regs,
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
  }),
  { loadParams, showTransferInModal, loadEntryTransRegs, loadEntryTransInDetails, saveVirtualTransfer }
)
export default class TransferInModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    ownerCusCode: '',
    relDateRange: [],
    entryRegNo: '',
    portionRegs: [],
    regDetails: [],
    transRegs: [],
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
    if (nextProps.transRegs !== this.props.transRegs) {
      this.setState({ transRegs: nextProps.transRegs });
    }
    if (nextProps.visible && nextProps.ownerCusCode && nextProps.visible !== this.props.visible) {
      this.props.loadEntryTransRegs({
        whseCode: nextProps.defaultWhse.code,
        ownerCusCode: nextProps.ownerCusCode,
        tenantId: this.props.tenantId,
      });
      this.setState({ ownerCusCode: nextProps.ownerCusCode });
    }
  }

  entryRegColumns = [{
    title: 'ASN编号',
    dataIndex: 'asn_no',
    width: 180,
  }, {
    title: '海关入库单号',
    width: 200,
    dataIndex: 'ftz_ent_no',
  }, {
    title: '货主',
    dataIndex: 'owner_name',
  }, {
    title: '进库日期',
    dataIndex: 'ftz_ent_date',
    render: o => o && moment(o).format('YYYY.MM.DD'),
    width: 200,
  }, {
    title: '添加',
    width: 80,
    fixed: 'right',
    render: (o, record) => !record.added && <Button type="primary" size="small" icon="plus" onClick={() => this.handleAddReg(record)} />,
  }]

  regDetailColumns = [{
    title: '系统ID',
    dataIndex: 'id',
    width: 100,
  }, {
    title: '货号',
    dataIndex: 'product_no',
    width: 150,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 180,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
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
    dataIndex: 'unit',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '剩余数量',
    width: 100,
    dataIndex: 'stock_qty',
  }, {
    title: '剩余毛重',
    width: 100,
    dataIndex: 'stock_grosswt',
  }, {
    title: '剩余净重',
    width: 100,
    dataIndex: 'stock_netwt',
  }, {
    title: '剩余金额',
    width: 100,
    dataIndex: 'stock_amount',
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
    this.props.loadEntryTransInDetails({ preEntrySeqNo: row.pre_entry_seq_no }).then((result) => {
      if (!result.error) {
        const entNo = row.ftz_ent_no;
        const regDetails = this.state.regDetails.filter(reg => reg.ftz_ent_no !== entNo).concat(
          result.data.map(dt => ({ ...dt, ftz_ent_no: entNo })));
        const transRegs = this.state.transRegs.map(pr => pr.ftz_ent_no === entNo ? { ...pr, added: true } : pr);
        this.setState({ regDetails, transRegs });
      }
    });
  }
  handleDelDetail = (detail) => {
    const regDetails = this.state.regDetails.filter(reg => reg.id !== detail.id);
    const transRegs = this.state.transRegs.map(pr => pr.ftz_ent_no === detail.ftz_ent_no ? { ...pr, added: false } : pr);
    this.setState({ regDetails, transRegs });
  }
  handleCancel = () => {
    this.setState({ ownerCusCode: '', transRegs: [], regDetails: [], rel_no: '', relDateRange: [] });
    this.props.showTransferInModal({ visible: false });
  }
  handleOwnerChange = (ownerCusCode) => {
    this.setState({ ownerCusCode });
  }
  handleEntryNoChange = (ev) => {
    this.setState({ entryRegNo: ev.target.value });
  }
  handleRelRangeChange = (relDateRange) => {
    this.setState({ relDateRange });
  }
  handleFilterQuery = () => {
    const { ownerCusCode, entryRegNo, relDateRange } = this.state;
    this.props.loadEntryTransRegs({
      ownerCusCode,
      whseCode: this.props.defaultWhse.code,
      tenantId: this.props.tenantId,
      preSeqNo: entryRegNo,
      start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
      end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
    });
  }
  handleSaveTrans = () => {
    if (!this.state.ownerCusCode) {
      message.error('货主未选定');
      return;
    }
    const detailIds = [];
    const ftzEntDetailRegIds = new Map();
    this.state.regDetails.forEach((regd) => {
      detailIds.push(regd.id);
      let sysIds = String(regd.id);
      if (ftzEntDetailRegIds.has(regd.ftz_ent_detail_id)) {
        sysIds = ftzEntDetailRegIds.get(regd.ftz_ent_detail_id);
        sysIds = `${sysIds}${String(regd.id)}`;
      }
      ftzEntDetailRegIds.set(regd.ftz_ent_detail_id, sysIds);
    });
    const exceedEntIds = [];
    ftzEntDetailRegIds.forEach((sysIds, entId) => {
      if (sysIds.length > 80) {
        exceedEntIds.push(entId);
      }
    });
    if (exceedEntIds.length > 0) {
      notification.error({
        message: '数据问题',
        description: `以下明细ID${exceedEntIds.join(',')}合并系统ID后长度超过100, 分到多张移库单`,
      });
      return;
    }
    const owner = this.props.owners.filter(own => own.customs_code === this.state.ownerCusCode).map(own => ({
      partner_id: own.id,
      tenant_id: own.partner_tenant_id,
      customs_code: own.customs_code,
      name: own.name,
    }))[0];
    this.props.saveVirtualTransfer({ detailIds,
      owner,
      whseCode: this.props.defaultWhse.code,
      loginId: this.props.loginId,
      tenantId: this.props.tenantId }).then((result) => {
        if (!result.error) {
          this.handleCancel();
          this.props.reload();
        } else {
          message.error(result.error.message);
        }
      });
  }

  render() {
    const { entryRegNo, relDateRange, ownerCusCode } = this.state;
    const extraForm = (
      <Form layout="inline">
        <FormItem label="货主">
          <Select onChange={this.handleOwnerChange} placeholder="请选择货主" style={{ width: 200 }} value={ownerCusCode}>
            {this.props.owners.map(data => (
              <Option key={data.customs_code} value={data.customs_code}>
                {data.partner_code}{data.partner_code ? '|' : ''}{data.name}
              </Option>))}
          </Select>
        </FormItem>
        <FormItem label="海关入库单号">
          <Input value={entryRegNo} onChange={this.handleEntryNoChange} />
        </FormItem>
        <FormItem label="入库日期">
          <RangePicker onChange={this.handleRelRangeChange} value={relDateRange} />
        </FormItem>
        <Button type="primary" ghost size="large" onClick={this.handleFilterQuery}>查找</Button>
      </Form>);
    const title = (<div>
      <span>新建区内转入</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>取消</Button>
        <Button type="primary" disabled={this.state.regDetails.length === 0} onClick={this.handleSaveTrans}>保存</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        footer={null} visible={this.props.visible}
      >
        <Card title="入库单" extra={extraForm} bodyStyle={{ padding: 0 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={this.entryRegColumns} dataSource={this.state.transRegs} rowKey="id"
              scroll={{ x: this.entryRegColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
            />
          </div>
        </Card>
        <Card title="入库单明细" bodyStyle={{ padding: 0 }} noHovering>
          <div className="table-panel table-fixed-layout">
            <Table size="middle" columns={this.regDetailColumns} dataSource={this.state.regDetails} rowKey="id"
              scroll={{ x: this.regDetailColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
            />
          </div>
        </Card>
      </Modal>
    );
  }
}
