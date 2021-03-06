import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import FileSaver from 'file-saver';
import { createFilename } from 'client/util/dataTransform';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Tabs, Layout, Steps, Button, Radio, Tag, notification, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import Drawer from 'client/components/Drawer';
import EditableCell from 'client/components/EditableCell';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadRelDetails, loadParams, updateRelReg, fileRelStockouts, exportNormalExitByRel, fileRelPortionouts, queryPortionoutInfos, cancelRelReg, editReleaseWt, clearNormalRel } from 'common/reducers/cwmShFtz';
import { showNormalRegSplitModal, undoNormalRegSplit } from 'common/reducers/cwmShFtzDecl';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_BONDED_REGTYPES, CWM_OUTBOUND_STATUS, CWM_OUTBOUND_STATUS_INDICATOR } from 'common/constants';
import NormalRegMergeSplitModal from './modal/normalRegMergeSplitModal';
import { formatMsg } from '../../message.i18n';

const { Content } = Layout;
const { Description } = DescriptionList;
const { Step } = Steps;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { TabPane } = Tabs;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadRelDetails(params.soNo, 'normal')));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    relSo: state.cwmShFtz.rel_so,
    relRegs: state.cwmShFtz.rel_regs,
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
    trxModes: state.cwmShFtz.params.trxModes.map(tx => ({
      value: tx.trx_mode,
      text: tx.trx_spec,
    })),
    whse: state.cwmContext.defaultWhse,
    submitting: state.cwmShFtz.submitting,
  }),
  {
    loadRelDetails,
    updateRelReg,
    fileRelStockouts,
    exportNormalExitByRel,
    fileRelPortionouts,
    queryPortionoutInfos,
    cancelRelReg,
    editReleaseWt,
    clearNormalRel,
    showNormalRegSplitModal,
    undoNormalRegSplit,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZNormalRelRegDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    reg: {},
    view: 'splitted',
    filingDetails: [],
    exitDetails: [],
    merged: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.relRegs !== this.props.relRegs && nextProps.relRegs.length > 0) {
      // if (this.state.tabKey === '') {
      const details = [...nextProps.relRegs[0].details];
      const detailMap = this.getMerged(details);
      this.setState({
        reg: nextProps.relRegs[0],
        filingDetails: nextProps.relRegs[0].details.filter(det => det.qty > 0),
        exitDetails: nextProps.relRegs[0].details.filter(det => det.normalreg_exit_no),
        merged: [...detailMap.values()],
      });
      // }
    }
  }
  getMerged = (details) => {
    const detailMap = new Map();
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      if (detailMap.has(detail.ftz_ent_detail_id)) {
        const merged = detailMap.get(detail.ftz_ent_detail_id);
        detailMap.set(detail.ftz_ent_detail_id, Object.assign(
          {}, merged,
          {
            qty: Number(merged.qty) + Number(detail.qty),
            gross_wt: Number((Number(merged.gross_wt) + Number(detail.gross_wt)).toFixed(4)),
            net_wt: Number((Number(merged.net_wt) + Number(detail.net_wt)).toFixed(4)),
            amount: Number((Number(merged.amount) + Number(detail.amount)).toFixed(2)),
            freight: Number((Number(merged.freight) + Number(detail.freight)).toFixed(2)),
          }
        ));
      } else {
        detailMap.set(detail.ftz_ent_detail_id, Object.assign({}, detail, {
          seq_no: detailMap.size + 1,
          product_no: null,
        }));
      }
    }
    return detailMap;
  }
  getStep = (status) => {
    if (status < 3) {
      return status;
    } else if (status === 3 || status === 4) {
      return 3;
    } else if (status === 5 || status === 6) {
      return 4;
    } else if (status === 7 || status === 8) {
      return 5;
    }
    return -1;
  }
  msg = formatMsg(this.props.intl)
  handleSend = () => {
    const { soNo } = this.props.params;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    const fileOp = this.props.fileRelStockouts(soNo, whseCode, ftzWhseCode);
    const relType = CWM_SO_BONDED_REGTYPES[0].text;
    if (fileOp) {
      fileOp.then((result) => {
        if (!result.error) {
          if (result.data.errorMsg) {
            notification.warn({
              message: '结果异常',
              description: result.data.errorMsg,
              duration: 15,
            });
          } else {
            notification.success({
              message: '操作成功',
              description: `${soNo} 已发送至 上海自贸区海关监管系统 ${relType}`,
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
  }
  handleCancelReg = () => {
    const { soNo } = this.props.params;
    this.props.cancelRelReg(soNo).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleWtChange = (val, id) => {
    const change = { gross_wt: val };
    this.props.editReleaseWt({ change, id }).then((result) => {
      if (!result.error) {
        this.props.loadRelDetails(this.props.params.soNo, 'normal');
      }
    });
  }
  handleTabChange = (tabKey) => {
    const detailMap = this.getMerged(this.props.relRegs[tabKey].details);
    this.setState({
      view: 'splitted',
      reg: this.props.relRegs[tabKey],
      filingDetails: this.props.relRegs[tabKey].details.filter(det => det.qty > 0),
      exitDetails: this.props.relRegs[tabKey].details.filter(det => det.normalreg_exit_no),
      merged: [...detailMap.values()],
    });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value).then((result) => {
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
  handleNormalCustomDecl = (preRegNo, cusDeclNo) => {
    this.props.clearNormalRel(preRegNo, cusDeclNo)
      .then((result) => {
        if (result.error) {
          if (result.error.message === 'cus_decl_no_empty') {
            message.error('报关单号不能为空');
            return;
          }
          message.error(result.error.message);
        }
      });
  }
  handleOutboundPage = () => {
    this.context.router.push(`/cwm/shipping/outbound/${this.props.relSo.outbound_no}`);
  }
  handleRegMergeSplit = () => {
    const { relSo, relRegs } = this.props;
    this.props.showNormalRegSplitModal({
      visible: true,
      pre_entry_seq_no: relRegs[0].pre_entry_seq_no,
      owner: {
        partner_id: relSo.owner_partner_id,
        tenant_id: relSo.owner_tenant_id,
      },
    });
  }
  handleUndoRegMergeSplit =() => {
    const { soNo } = this.props.params;
    this.props.undoNormalRegSplit(soNo).then((result) => {
      if (!result.error) {
        this.handleRelAndDetailsReload();
      }
    });
  }
  handleRelAndDetailsReload = () => {
    this.props.loadRelDetails(this.props.params.soNo, 'normal');
  }
  handleViewChange = (e) => {
    const { merged, reg } = this.state;
    let filingDetails;
    const exitDetails = reg.details.filter(det => det.normalreg_exit_no);
    if (e.target.value === 'merged') {
      filingDetails = merged;
    } else {
      filingDetails = reg.details.filter(det => det.qty > 0);
    }
    this.setState({
      view: e.target.value,
      filingDetails,
      exitDetails,
    });
  }
  handleExportExitVoucher = () => {
    const { reg } = this.state;
    this.props.exportNormalExitByRel(reg.ftz_rel_no).then((resp) => {
      if (!resp.error) {
        FileSaver.saveAs(
          new window.Blob([Buffer.from(resp.data)], { type: 'application/octet-stream' }),
          `${reg.ftz_rel_no}_出区凭单.xlsx`
        );
      } else {
        notification.error({
          message: '导出失败',
          description: resp.error.message,
        });
      }
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 60,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
    /* }, {
    title: '入库行号',
    dataIndex: 'asn_seq_no',
    width: 100, */
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 100,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '规格型号',
    dataIndex: 'model',
    width: 150,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
    width: 150,
    render: (o, record) => <EditableCell size="small" value={o} onSave={value => this.handleWtChange(value, record.id)} editable={!record.ftz_rel_no} />,
  }, {
    title: '净重',
    dataIndex: 'net_wt',
    width: 100,
  }, {
    title: '金额',
    dataIndex: 'amount',
    width: 100,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 100,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
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
    title: '运费',
    width: 100,
    dataIndex: 'freight',
  }, {
    title: '运费币制',
    width: 100,
    dataIndex: 'freight_currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '原产国',
    dataIndex: 'country',
    width: 100,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '报关单号',
    width: 150,
    dataIndex: 'out_cus_decl_no',
  }, {
    title: 'so编号',
    width: 120,
    dataIndex: 'so_no',
  }]
  exitColumns = [{
    title: '出区编号',
    dataIndex: 'normalreg_exit_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 100,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '数量',
    dataIndex: 'exit_qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'exit_grosswt',
    width: 150,
  }, {
    title: '净重',
    dataIndex: 'exit_netwt',
    width: 100,
  }, {
    title: '金额',
    dataIndex: 'exit_amount',
    width: 100,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 100,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  handleFilSearch = (searchText) => {
    let filingDetails = this.props.relRegs[0].details.filter(det => det.qty > 0);
    if (searchText) {
      filingDetails = filingDetails.filter((item) => {
        const reg = new RegExp(searchText);
        return reg.test(item.ftz_cargo_no) || reg.test(item.hscode)
        || reg.test(item.product_no) || reg.test(item.g_name);
      });
    }
    this.setState({ filingDetails });
  }
  handleExitSearch = (searchText) => {
    let exitDetails = this.props.relRegs[0].details.filter(det => det.normalreg_exit_no);
    if (searchText) {
      exitDetails = exitDetails.filter((item) => {
        const reg = new RegExp(searchText);
        return reg.test(item.ftz_cargo_no) || reg.test(item.hscode)
        || reg.test(item.product_no) || reg.test(item.g_name);
      });
    }
    this.setState({ exitDetails });
  }
  handleExport = () => {
    const { reg } = this.state;
    window.open(`${API_ROOTS.default}v1/cwm/shftz/release/details/export/${createFilename(`${reg.pre_entry_seq_no}`)}.xlsx?pre_entry_seq_no=${reg.pre_entry_seq_no}`);
  }
  render() {
    const {
      relSo, relRegs, submitting,
    } = this.props;
    const { reg, filingDetails, exitDetails } = this.state;
    if (relRegs.length === 0) {
      return null;
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const outboundStatus = relSo.outbound_status || CWM_OUTBOUND_STATUS.ALL_ALLOC.value;
    const relType = CWM_SO_BONDED_REGTYPES[0];
    const regStatus = reg.status;
    const relEditable = regStatus < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = regStatus === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送备案';
    let sendable = true;
    let whyunsent = '';
    if (outboundStatus < CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
      sendable = false;
      whyunsent = '出库单未配货';
    } else if (outboundStatus === CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
      whyunsent = '出库单部分配货';
    }
    if (sendable) {
      const nonOutDates = [];
      relRegs.forEach((rr) => {
        if (!rr.ftz_rel_date) {
          nonOutDates.push(rr.pre_entry_seq_no);
        }
      });
      if (nonOutDates.length > 0) {
        sendable = false;
        whyunsent = `${nonOutDates.join(',')}预计出区日期未填`;
      }
    }
    const outStatus = relSo.outbound_no && CWM_OUTBOUND_STATUS_INDICATOR.filter(status =>
      status.value === relSo.outbound_status)[0];
    const menus = [];
    relRegs.forEach((r, index) => menus.push({
      menu: r.ftz_rel_no || r.pre_entry_seq_no,
      key: String(index),
    }));
    const stat = filingDetails.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.qty,
      total_amount: acc.total_amount + regd.amount,
      total_net_wt: acc.total_net_wt + regd.net_wt,
      total_grosswt: acc.total_grosswt + regd.gross_wt,
      total_freight: acc.total_freight + regd.freight,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
      total_grosswt: 0,
      total_freight: 0,
    });
    const freightDetail = filingDetails.filter(fd => fd.freight_currency)[0];
    if (freightDetail) {
      const currency = this.props.currencies.filter(cur =>
        cur.value === freightDetail.freight_currency)[0];
      if (currency) {
        stat.freight_currency = currency.text;
      }
    }
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            relType && relType.ftztext,
            this.props.params.soNo,
          ]}
          menus={menus}
          onTabChange={this.handleTabChange}
        >
          <PageHeader.Nav>
            {relSo.outbound_no &&
            <Button icon="link" onClick={this.handleOutboundPage}>
              关联出库操作 <Badge status={outStatus.badge} text={outStatus.text} />
            </Button>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {relEditable && relRegs.length === 1 &&
              <Button onClick={this.handleRegMergeSplit}>拆分明细</Button>
            }
            {relEditable && relRegs.length > 1 &&
              <Button onClick={this.handleUndoRegMergeSplit}>取消明细拆分</Button>
            }
            {relEditable && relRegs.length === 1 &&
            <NormalRegMergeSplitModal reload={this.handleRelAndDetailsReload} />
            }
            {regStatus === CWM_SHFTZ_APIREG_STATUS.completed && <Button loading={submitting} icon="close" onClick={this.handleCancelReg}>回退备案</Button>}
            {relEditable &&
            <Button type="primary" ghost={sent} icon="cloud-upload-o" onClick={this.handleSend} loading={submitting} disabled={!sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="出区提货单号">
                <EditableCell
                  value={reg.ftz_rel_no}
                  editable={regStatus <= CWM_SHFTZ_APIREG_STATUS.completed}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_no', value)}
                />
              </Description>
              <Description term="货主">{reg.owner_cus_code}|{reg.owner_name}</Description>
              <Description term="提货单位">
                <EditableCell
                  value={reg.receiver_name}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'receiver_name', value)}
                />
              </Description>
              <Description term="运输单位">
                <EditableCell
                  value={reg.carrier_name}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'carrier_name', value)}
                />
              </Description>
              <Description term="报关单号">
                <EditableCell
                  value={reg.cus_decl_no}
                  onSave={value => this.handleNormalCustomDecl(reg.pre_entry_seq_no, value)}
                  editable={regStatus <= 6}
                />
              </Description>
              <Description term="发票号">
                <EditableCell
                  value={reg.invoice_no}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'invoice_no', value)}
                />
              </Description>
              <Description term="封志">
                <EditableCell
                  value={reg.seal_no}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'seal_no', value)}
                />
              </Description>
              <Description term="唛头">
                <EditableCell
                  value={reg.marks}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'marks', value)}
                />
              </Description>
              <Description term="出口日期">
                <EditableCell
                  type="date"
                  editable={relEditable}
                  value={reg.ie_date && moment(reg.ie_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ie_date', new Date(value))}
                />
              </Description>
              <Description term="报关日期">
                <EditableCell
                  type="date"
                  editable={relEditable}
                  value={reg.cus_decl_date && moment(reg.cus_decl_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'cus_decl_date', new Date(value))}
                />
              </Description>
              <Description term="预计出区日期">
                <EditableCell
                  type="date"
                  editable={relEditable}
                  value={reg.ftz_rel_date && moment(reg.ftz_rel_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_date', new Date(value))}
                />
              </Description>
              <Description term="备案日期">{reg.ftz_reg_date && moment(reg.ftz_reg_date).format('YYYY-MM-DD')}</Description>
            </DescriptionList>
            <Steps progressDot current={this.getStep(regStatus)} className="progress-tracker">
              <Step title="待备案" />
              <Step title="已发送" />
              <Step title="已备案" />
              <Step title="已委托" />
              <Step title="已清关" />
              <Step title="已出区" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            {relEditable && whyunsent && <Alert message={whyunsent} type="info" showIcon closable />}
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="regd">
                <TabPane tab="备案明细" key="regd">
                  <DataPane

                    columns={this.columns}
                    rowSelection={rowSelection}
                    indentSize={8}
                    dataSource={filingDetails}
                    rowKey="id"
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleFilSearch} />
                      <RadioGroup value={this.state.view} onChange={this.handleViewChange} >
                        <RadioButton value="splitted">拆分明细</RadioButton>
                        <RadioButton value="merged">合并明细</RadioButton>
                      </RadioGroup>
                      {this.state.view === 'splitted' && <Button icon="download" onClick={this.handleExport} style={{ marginLeft: 8 }}>导出</Button>}
                      <DataPane.Extra>
                        <Summary>
                          <Summary.Item label="总数量">{stat && stat.total_qty}</Summary.Item>
                          <Summary.Item label="总毛重" addonAfter="KG">{stat && stat.total_grosswt.toFixed(3)}</Summary.Item>
                          <Summary.Item label="总净重" addonAfter="KG">{stat && stat.total_net_wt.toFixed(3)}</Summary.Item>
                          <Summary.Item label="总金额">{stat && stat.total_amount.toFixed(3)}</Summary.Item>
                          {stat.total_freight && <Summary.Item label="总运费">{stat && stat.total_freight.toFixed(2)}</Summary.Item>}
                          {stat.total_freight && stat.freight_currency &&
                          <Tag style={{ marginLeft: 5 }}>{stat.freight_currency}</Tag>}
                        </Summary>
                      </DataPane.Extra>
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
                <TabPane tab="出区明细" key="exitd">
                  <DataPane

                    columns={this.exitColumns}
                    rowSelection={rowSelection}
                    indentSize={8}
                    dataSource={exitDetails}
                    rowKey="id"
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleExitSearch} />
                      {exitDetails.length > 0 &&
                      <DataPane.Actions>
                        <Button type="primary" onClick={this.handleExportExitVoucher}>导出出区凭单</Button>
                      </DataPane.Actions>}
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
