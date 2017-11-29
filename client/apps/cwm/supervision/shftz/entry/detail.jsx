import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Breadcrumb, Form, Layout, InputNumber, Popover, Radio, Steps, Button, Card, Tag, message, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import EditableCell from 'client/components/EditableCell';
import TrimSpan from 'client/components/trimSpan';
// import RowUpdater from 'client/components/rowUpdater';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadEntryDetails, loadParams, updateEntryReg, refreshEntryRegFtzCargos, splitCustomEntryDetails, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus } from 'common/reducers/cwmShFtz';
import { string2Bytes } from 'client/util/dataTransform';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const Step = Steps.Step;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadEntryDetails({ preEntrySeqNo: params.preEntrySeqNo })));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    username: state.account.username,
    primaryEntryReg: state.cwmShFtz.entry_asn,
    entryRegs: state.cwmShFtz.entry_regs,
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
    whse: state.cwmContext.defaultWhse,
    submitting: state.cwmShFtz.submitting,
  }),
  { loadEntryDetails, updateEntryReg, refreshEntryRegFtzCargos, splitCustomEntryDetails, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZEntryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    reg: {
      details: [],
    },
    selectedRowKeys: [],
    sendable: false,
    queryable: false,
    fullscreen: true,
    alertInfo: '',
    tabKey: '',
    nonCargono: false,
    filingDetails: [],
    merged: [],
    splitNum: 2,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const queryable = nextProps.primaryEntryReg.reg_status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      let regDetailExist = true;
      nextProps.entryRegs.forEach((entReg) => { regDetailExist = regDetailExist && entReg.details.length > 0; });
      let sendable = nextProps.primaryEntryReg.inbound_no && regDetailExist && nextProps.primaryEntryReg.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
      let unsentReason = !nextProps.primaryEntryReg.inbound_no ? '收货通知ASN尚未释放' : '';
      if (sendable) {
        if (nextProps.primaryEntryReg.cus_decl_no && nextProps.primaryEntryReg.ie_date && nextProps.primaryEntryReg.ftz_ent_date) {
          sendable = true;
          nextProps.entryRegs.forEach((er) => {
            const invalidDets = [];
            for (let i = 0; i < er.details.length; i++) {
              const det = er.details[i];
              if (!det.country || !det.currency || !det.unit || !det.net_wt) {
                invalidDets.push(det.asn_seq_no);
              }
            }
            if (invalidDets.length > 0) {
              sendable = false;
              unsentReason = `${unsentReason ? '\n' : ''}${er.pre_ftz_ent_no}: 行号${invalidDets.join(',')}数据不完整`;
            }
          });
        } else {
          unsentReason = `${nextProps.primaryEntryReg.pre_entry_seq_no}报关单号或进口时间或入库时间为空`;
          sendable = false;
        }
      }
      const newState = { queryable, sendable, alertInfo: unsentReason };
      if (this.state.tabKey === '') {
        newState.tabKey = nextProps.entryRegs[0].pre_ftz_ent_no;
      }
      if (nextProps.primaryEntryReg.portion_enabled) {
        for (let i = 0; i < nextProps.entryRegs.length; i++) {
          const nonCargono = nextProps.entryRegs[i].details.filter(det => !det.ftz_cargo_no).length !== 0;
          if (nonCargono) {
            newState.nonCargono = true;
            break;
          }
        }
      }
      newState.reg = nextProps.entryRegs[0];
      newState.filingDetails = newState.reg.details;
      newState.view = 'splitted';
      this.setState(newState);
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleRefreshFtzCargo = () => {
    const preEntrySeqNo = this.props.params.preEntrySeqNo;
    const asnNo = this.props.primaryEntryReg.asn_no;
    this.props.refreshEntryRegFtzCargos(asnNo, preEntrySeqNo).then((result) => {
      if (!result.error) {
        this.props.loadEntryDetails({ preEntrySeqNo });
        notification.success({
          message: '操作成功',
          description: '备件号刷新成功',
          placement: 'topLeft',
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleSend = () => {
    if (this.state.nonCargono) {
      notification.warn({
        message: '货号未备案',
        description: '部分货号无备案料号, 是否以生成临时备案料号调用备案',
        btn: (<div>
          <a role="presentation" onClick={() => this.handleRegSend(true)}>直接备案</a>
          <span className="ant-divider" />
          <a role="presentation" onClick={this.handleCargoAdd}>添加对应备案料号</a>
        </div>),
        key: 'confirm-cargono',
        duration: 0,
      });
    } else {
      this.handleRegSend(false);
    }
  }
  handleRegSend = (close) => {
    if (close) {
      notification.close('confirm-cargono');
    }
    const primaryEntryReg = this.props.primaryEntryReg;
    const preEntrySeqNo = this.props.params.preEntrySeqNo;
    this.props.fileEntryRegs(primaryEntryReg.asn_no, preEntrySeqNo, this.props.whse.code).then((result) => {
      if (!result.error) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === primaryEntryReg.ftz_ent_type)[0];
        this.props.loadEntryDetails({ preEntrySeqNo });
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          notification.success({
            message: '操作成功',
            description: `${preEntrySeqNo} 已发送至 上海自贸区海关监管系统 ${entType && entType.text}`,
            placement: 'topLeft',
          });
        }
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleEntryRegsPrint = () => {
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: [], Sheets: {}, Props: {} };
    this.props.entryRegs.forEach((er) => {
      wb.SheetNames.push(er.pre_ftz_ent_no);
      const mergedRegDetails = [];
      const details = [...er.details];
      details.sort((era, erb) => era.ent_g_no - erb.ent_g_no).forEach((erd) => {
        if (mergedRegDetails[erd.ent_g_no - 1]) {
          mergedRegDetails[erd.ent_g_no - 1].qty += erd.qty;
          mergedRegDetails[erd.ent_g_no - 1].net_wt += erd.net_wt;
          mergedRegDetails[erd.ent_g_no - 1].gross_wt += erd.gross_wt;
          mergedRegDetails[erd.ent_g_no - 1].amount += erd.amount;
          mergedRegDetails[erd.ent_g_no - 1].amount_usd += erd.amount_usd;
        } else {
          mergedRegDetails.push({ ftz_cargo_no: erd.ftz_cargo_no,
            hscode: erd.hscode,
            g_name: erd.g_name,
            model: erd.model,
            unit: erd.unit,
            qty: erd.qty,
            net_wt: erd.net_wt,
            gross_wt: erd.gross_wt,
            amount: erd.amount,
            currency: erd.currency,
            country: erd.country,
            amount_usd: erd.amount_usd,
            tag: `*${er.pre_ftz_ent_no}_${erd.ent_g_no}`,
          });
        }
      });
      const csvData = mergedRegDetails.map(mrd => ({
        备件号: mrd.ftz_cargo_no,
        HS: mrd.hscode,
        中文品名: mrd.g_name,
        规格型号: mrd.model,
        单位: mrd.unit,
        报关单剩余数量: mrd.qty,
        数量: mrd.qty,
        净重: mrd.net_wt,
        毛重: mrd.gross_wt,
        金额: mrd.amount,
        币值: mrd.currency,
        原产国: mrd.country,
        美元货值: mrd.amount_usd,
        库位: null,
        标签: mrd.tag,
      }));
      wb.Sheets[er.pre_ftz_ent_no] = XLSX.utils.json_to_sheet(csvData);
    });
    const primaryEntryReg = this.props.primaryEntryReg;
    FileSaver.saveAs(new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }), `${primaryEntryReg.cus_decl_no}_进区凭单.xlsx`);
  }
  handleQuery = () => {
    const preEntrySeqNo = this.props.params.preEntrySeqNo;
    const primaryEntryReg = this.props.primaryEntryReg;
    const asnNo = primaryEntryReg.asn_no;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    this.props.queryEntryRegInfos(asnNo, preEntrySeqNo, whseCode, ftzWhseCode).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          this.props.loadEntryDetails({ preEntrySeqNo });
          notification.success({
            message: '操作成功',
            description: '备案明细ID已获取',
          });
        }
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleCancelReg = () => {
    const preEntrySeqNo = this.props.params.preEntrySeqNo;
    this.props.checkEntryRegStatus(preEntrySeqNo, CWM_SHFTZ_APIREG_STATUS.pending).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleCargoAdd = () => {
    notification.close('confirm-cargono');
    this.context.router.push('/cwm/supervision/shftz/cargo');
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
      reg: this.props.entryRegs[tabKey],
      filingDetails: this.props.entryRegs[tabKey].details,
      view: 'splitted',
    });
    this.handleDeselectRows();
  }
  handleInfoSave = (preFtzEntNo, field, value) => {
    this.props.updateEntryReg(preFtzEntNo, field, value).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      } else {
        message.success('修改成功');
      }
    });
  }
  handleInboundPage = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.primaryEntryReg.inbound_no}`);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleViewChange = (ev) => {
    const { reg } = this.state;
    const details = [...reg.details];
    let filingDetails = details;
    if (ev.target.value === 'merged') {
      filingDetails = [];
      details.sort((era, erb) => era.ent_g_no - erb.ent_g_no).forEach((erd) => {
        if (filingDetails[erd.ent_g_no - 1]) {
          filingDetails[erd.ent_g_no - 1].qty += erd.qty;
          filingDetails[erd.ent_g_no - 1].stock_qty += erd.stock_qty;
          filingDetails[erd.ent_g_no - 1].net_wt += erd.net_wt;
          filingDetails[erd.ent_g_no - 1].stock_netwt += erd.stock_netwt;
          filingDetails[erd.ent_g_no - 1].gross_wt += erd.gross_wt;
          filingDetails[erd.ent_g_no - 1].stock_grosswt += erd.stock_grosswt;
          filingDetails[erd.ent_g_no - 1].amount += erd.amount;
          filingDetails[erd.ent_g_no - 1].stock_amount += erd.stock_amount;
          filingDetails[erd.ent_g_no - 1].amount_usd += erd.amount_usd;
          filingDetails[erd.ent_g_no - 1].stock_amountusd += erd.stock_amountusd;
          filingDetails[erd.ent_g_no - 1].freight += erd.freight;
          filingDetails[erd.ent_g_no - 1].stock_freight += erd.stock_freight;
        } else {
          filingDetails.push(Object.assign({}, erd, {
            asn_seq_no: null,
            product_no: null,
          }));
        }
      });
      filingDetails = filingDetails.map(fld => Object.assign({}, fld, {
        net_wt: parseFloat(fld.net_wt.toFixed(6)),
        stock_netwt: parseFloat(fld.stock_netwt.toFixed(6)),
        gross_wt: parseFloat(fld.gross_wt.toFixed(6)),
        stock_grosswt: parseFloat(fld.stock_grosswt.toFixed(6)),
        amount: parseFloat(fld.amount.toFixed(2)),
        stock_amount: parseFloat(fld.stock_amount.toFixed(2)),
        freight: parseFloat(fld.freight.toFixed(2)),
        stock_freight: parseFloat(fld.stock_freight.toFixed(2)),
      }));
    }
    this.setState({
      view: ev.target.value,
      filingDetails,
    });
  }
  handleSplitNumber = (value) => {
    this.setState({ splitNum: value });
  }
  handleRegSequenceSplit = () => {
    const splitNum = this.state.splitNum;
    const preEntrySeqNo = this.props.params.preEntrySeqNo;
    this.props.splitCustomEntryDetails({ preEntrySeqNo, splitNum }).then((result) => {
      if (!result.error) {
        this.props.loadEntryDetails({ preEntrySeqNo });
        notification.success({
          message: '操作成功',
          description: `成功拆分为${splitNum}份进区凭单`,
        });
      } else {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  columns = [{
    title: 'ASN行',
    dataIndex: 'asn_seq_no',
    width: 70,
    fixed: 'left',
  }, {
    title: '备件号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '分拨',
    dataIndex: 'cargo_type',
    width: 80,
    render: cargo => cargo === '14' ? <Tag color="green">可分拨</Tag> : <Tag>非分拨</Tag>,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '项号',
    dataIndex: 'ent_g_no',
    width: 60,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 150,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 250,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '剩余数量',
    dataIndex: 'stock_qty',
    width: 100,
    render: o => (<b>{o}</b>),
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
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '剩余净重',
    width: 100,
    dataIndex: 'stock_netwt',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
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
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '运费',
    width: 100,
    dataIndex: 'freight',
  }, {
    title: '剩余运费',
    width: 100,
    dataIndex: 'stock_freight',
  }, {
    title: '运费币制',
    width: 100,
    dataIndex: 'freight_currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  render() {
    const { primaryEntryReg, entryRegs, whse, submitting } = this.props;
    const { reg, alertInfo, splitNum, filingDetails } = this.state;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === primaryEntryReg.ftz_ent_type)[0];
    const entryEditable = primaryEntryReg.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送备案';
    const inbStatus = primaryEntryReg.inbound_no && CWM_INBOUND_STATUS_INDICATOR.filter(status => status.value === primaryEntryReg.inbound_status)[0];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const tabList = [];
    entryRegs.forEach((r, index) => tabList.push({ tab: r.ftz_ent_no || r.pre_ftz_ent_no, key: index }));
    const stat = filingDetails && filingDetails.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.qty,
      total_amount: acc.total_amount + regd.amount,
      total_net_wt: acc.total_net_wt + regd.net_wt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    });
    // const qtySplitPopover = (<span><InputNumber min={2} max={5} defaultValue={2} /><Button type="primary" style={{ marginLeft: 8 }}>确定</Button></span>);
    // const movePopover = (<span>
    //   <Select style={{ width: 240 }} value={reg.pre_entry_seq_no}>
    //     {entryRegs.map(opt => <Option key={opt.pre_entry_seq_no}>{opt.ftz_ent_no || opt.pre_entry_seq_no}</Option>)}
    //   </Select>
    // </span>);
    return (
      <div>
        <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
              <Breadcrumb.Item>
                {whse.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {primaryEntryReg.cus_decl_no || this.props.params.preEntrySeqNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            {primaryEntryReg.inbound_no &&
              <Button icon="link" onClick={this.handleInboundPage}>
                关联入库操作 <Badge status={inbStatus.badge} text={inbStatus.text} />
              </Button>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {/*
              primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.completed &&
              <Button icon="close" loading={submitting} onClick={this.handleCancelReg}>回退备案</Button>
            */}
            {this.state.queryable &&
              <Button icon="sync" loading={submitting} onClick={this.handleQuery}>获取监管ID</Button>}
            {this.state.nonCargono &&
              <Button icon="sync" loading={submitting} onClick={this.handleRefreshFtzCargo}>同步备件号</Button>}
            { entryRegs.length === 1 && entryEditable &&
            <Popover placement="bottom" title="份数" content={<span>
              <InputNumber min={2} max={entryRegs[0].details.length} value={splitNum} onChange={this.handleSplitNumber} />
              <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleRegSequenceSplit}>确定</Button>
            </span>} trigger="click"
            >
              <Button>拆分进区凭单</Button>
            </Popover>}
            {primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
              <Button icon="file-excel" onClick={this.handleEntryRegsPrint}>导出进区凭单数据</Button>}
            {entryEditable && entryRegs.length === 1 &&
              <Button type="primary" ghost={sent} icon="cloud-upload-o" loading={submitting} onClick={this.handleSend} disabled={!this.state.sendable}>{sendText}</Button>
            }
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          {entryEditable && alertInfo && <Alert message={alertInfo} type="info" showIcon closable />}
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} hoverable={false}>
              <DescriptionList col={3}>
                <Description term="进区凭单号">
                  <EditableCell value={reg.ftz_ent_no} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_ftz_ent_no, 'ftz_ent_no', value)}
                  />
                </Description>
                <Description term="报关单号">
                  <EditableCell value={primaryEntryReg.cus_decl_no} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_ftz_ent_no, 'cus_decl_no', value)}
                  />
                </Description>
                <Description term="经营单位">{primaryEntryReg.owner_name}</Description>
                <Description term="进出口日期">{primaryEntryReg.ie_date && moment(primaryEntryReg.ie_date).format('YYYY.MM.DD')}</Description>
                <Description term="备案更新时间">{primaryEntryReg.last_update_date && moment(primaryEntryReg.last_update_date).format('YYYY.MM.DD HH:mm')}</Description>
                <Description term="进区更新时间">{primaryEntryReg.ftz_ent_date && moment(primaryEntryReg.ftz_ent_date).format('YYYY-MM-DD HH:mm')}</Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={reg.status}>
                  <Step title="待进区" />
                  <Step title="已备案" />
                  <Step title="已进区" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} onSizeChange={this.toggleFullscreen}>
              <DataPane header="备案明细" fullscreen={this.state.fullscreen}
                columns={this.columns} rowSelection={rowSelection} indentSize={0}
                dataSource={filingDetails} rowKey="id" loading={this.state.loading}
              >
                <DataPane.Toolbar>
                  <RadioGroup value={this.state.view} onChange={this.handleViewChange} >
                    <RadioButton value="splitted">归并前明细</RadioButton>
                    <RadioButton value="merged">归并后明细</RadioButton>
                  </RadioGroup>
                  {/* <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
                    {primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending && reg.details.length > 1 &&
                    <Button onClick={this.handleItemSplit} disabled={this.state.selectedRowKeys.length === reg.details.length}>按项拆分</Button>}
                    {primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
                    <Popover placement="bottom" title="份数" content={qtySplitPopover} trigger="click">
                      <Button onClick={this.handleAverageQtySplit}>按数量平均拆分</Button> {/* TODO:需排除选择项的数量等于1 }
                    </Popover>}
                    {primaryEntryReg.reg_status === CWM_SHFTZ_APIREG_STATUS.pending && entryRegs.length > 1 &&
                    <Popover placement="bottom" content={movePopover} trigger="click"> {/* TODO:已拆分后显示此按钮 }
                      <Button onClick={this.handleMoveInto}>移到至...</Button>
                    </Popover>}
                  </DataPane.BulkActions> */}
                  <DataPane.Extra>
                    <Summary>
                      <Summary.Item label="总数量">{stat && stat.total_qty}</Summary.Item>
                      <Summary.Item label="总净重" addonAfter="KG">{stat && stat.total_net_wt.toFixed(3)}</Summary.Item>
                      <Summary.Item label="总金额">{stat && stat.total_amount.toFixed(3)}</Summary.Item>
                    </Summary>
                  </DataPane.Extra>
                </DataPane.Toolbar>
              </DataPane>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
