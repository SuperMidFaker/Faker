import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Tabs, Breadcrumb, Form, Layout, Icon, Steps, Button, Card, Popover, Radio, Tag, notification, Checkbox, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import EditableCell from 'client/components/EditableCell';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadRelDetails, loadParams, updateRelReg, fileRelStockouts,
  fileRelPortionouts, queryPortionoutInfos, cancelRelReg, editReleaseWt, splitRelDetails } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_BONDED_REGTYPES, CWM_OUTBOUND_STATUS, CWM_OUTBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const Step = Steps.Step;
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
    loginId: state.account.loginId,
    username: state.account.username,
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
  { loadRelDetails,
    updateRelReg,
    fileRelStockouts,
    fileRelPortionouts,
    queryPortionoutInfos,
    cancelRelReg,
    editReleaseWt,
    splitRelDetails }
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
    tabKey: '',
    editable: false,
    groupVals: ['supplier', 'trxn_mode', 'currency'],
    fullscreen: true,
    view: 'splitted',
    filingDetails: [],
    exitDetails: [],
    merged: [],
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
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
        tabKey: nextProps.relRegs[0].pre_entry_seq_no,
        editable: nextProps.relRegs[0].reg_status < CWM_SHFTZ_APIREG_STATUS.completed,
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
        detailMap.set(detail.ftz_ent_detail_id, Object.assign({}, merged,
          { qty: (Number(merged.qty) + Number(detail.qty)).toFixed(2),
            gross_wt: (Number(merged.gross_wt) + Number(detail.gross_wt)).toFixed(4),
            net_wt: (Number(merged.net_wt) + Number(detail.net_wt)).toFixed(4),
            amount: (Number(merged.amount) + Number(detail.amount)).toFixed(2),
            freight: (Number(merged.freight) + Number(detail.freight)).toFixed(2) }));
      } else {
        detailMap.set(detail.ftz_ent_detail_id, detail);
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
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    const soNo = this.props.params.soNo;
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
    const soNo = this.props.params.soNo;
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
      tabKey,
      reg: this.props.relRegs[tabKey],
      filingDetails: this.props.relRegs[tabKey].details.filter(det => det.qty > 0),
      eixtDetails: this.props.relRegs[tabKey].details.filter(det => det.normalreg_exit_no),
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
  handleOutboundPage = () => {
    this.context.router.push(`/cwm/shipping/outbound/${this.props.relSo.outbound_no}`);
  }
  handleCheckChange = (checkedValues) => {
    this.setState({ groupVals: checkedValues });
  }
  handleDetailSplit = () => {
    const soNo = this.props.params.soNo;
    this.props.splitRelDetails({ soNo, groupVals: this.state.groupVals, loginId: this.props.loginId }).then((result) => {
      if (!result.error) {
        message.success('明细已拆分');
        this.props.loadRelDetails(soNo, 'normal');
      }
    });
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
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
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
    width: 150,
    render: (o, record) => <EditableCell size="small" value={o} onSave={value => this.handleWtChange(value, record.id)} />,
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
  render() {
    const { relSo, relRegs, whse, submitting } = this.props;
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
    }
    if (sendable) {
      const nonOutDates = [];
      relRegs.forEach((r) => {
        if (!r.ftz_rel_date) {
          nonOutDates.push(r.pre_entry_seq_no);
        }
      });
      if (nonOutDates.length > 0) {
        sendable = false;
        whyunsent = `${nonOutDates.join(',')}预计出区日期未填`;
      }
    }
    const outStatus = relSo.outbound_no && CWM_OUTBOUND_STATUS_INDICATOR.filter(status => status.value === relSo.outbound_status)[0];
    let splitExtra = null;
    if (outboundStatus >= CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value && regStatus < CWM_SHFTZ_APIREG_STATUS.processing) {
      splitExtra = (<Form layout="inline">
        <Form.Item>
          <Checkbox.Group onChange={this.handleCheckChange} value={this.state.groupVals}>
            <Checkbox value="supplier">供货商</Checkbox>
            <Checkbox value="trxn_mode">成交方式</Checkbox>
            <Checkbox value="currency">币制</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" disabled={!this.state.groupVals.length > 0} onClick={this.handleDetailSplit}>确定</Button>
        </Form.Item>
      </Form>);
    }
    const tabList = [];
    relRegs.forEach((r, index) => tabList.push({ tab: r.ftz_rel_no || r.pre_entry_seq_no, key: index }));
    const stat = reg.details && reg.details.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.qty,
      total_amount: acc.total_amount + regd.amount,
      total_net_wt: acc.total_net_wt + regd.net_wt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    });
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
                {relType && <Tag color={relType.tagcolor}>{relType.ftztext}</Tag>}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.soNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            {relSo.outbound_no &&
            <Button icon="link" onClick={this.handleOutboundPage}>
              关联出库操作 <Badge status={outStatus.badge} text={outStatus.text} />
            </Button>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {relEditable &&
            <Popover content={splitExtra} title="拆分选项" trigger="click" placement="bottomRight">
              <Button >拆分明细 <Icon type="down" /></Button>
            </Popover>
            }
            {regStatus === CWM_SHFTZ_APIREG_STATUS.completed && <Button loading={submitting} icon="close" onClick={this.handleCancelReg}>回退备案</Button>}
            {relEditable &&
            <Button type="primary" ghost={sent} icon="cloud-upload-o" onClick={this.handleSend} loading={submitting} disabled={!sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          {relEditable && whyunsent && <Alert message={whyunsent} type="info" showIcon closable />}
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} hoverable={false}>
              <DescriptionList col={4}>
                <Description term="出区提货单号">{reg.ftz_rel_no}</Description>
                <Description term="货主">{reg.owner_cus_code}|{reg.owner_name}</Description>
                <Description term="提货单位">
                  <EditableCell value={reg.receiver_name}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'receiver_name', value)}
                  />
                </Description>
                <Description term="运输单位">
                  <EditableCell value={reg.carrier_name}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'carrier_name', value)}
                  />
                </Description>
                <Description term="报关单号">{reg.cus_decl_no}</Description>
                <Description term="发票号">
                  <EditableCell value={reg.invoice_no}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'invoice_no', value)}
                  />
                </Description>
                <Description term="封志">
                  <EditableCell value={reg.seal_no}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'seal_no', value)}
                  />
                </Description>
                <Description term="唛头">
                  <EditableCell value={reg.marks}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'marks', value)}
                  />
                </Description>
                <Description term="出口日期">
                  <EditableCell type="date" value={reg.ie_date && moment(reg.ie_date).format('YYYY-MM-DD')}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ie_date', new Date(value))}
                  />
                </Description>
                <Description term="报关日期">
                  <EditableCell type="date" value={reg.cus_decl_date && moment(reg.cus_decl_date).format('YYYY-MM-DD')}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'cus_decl_date', new Date(value))}
                  />
                </Description>
                <Description term="预计出区日期">
                  <EditableCell type="date" value={reg.ftz_rel_date && moment(reg.ftz_rel_date).format('YYYY-MM-DD')}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_date', new Date(value))}
                  />
                </Description>
                <Description term="备案日期">{reg.ftz_reg_date && moment(reg.ftz_reg_date).format('YYYY-MM-DD')}</Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={this.getStep(regStatus)}>
                  <Step title="待备案" />
                  <Step title="已发送" />
                  <Step title="已备案" />
                  <Step title="已委托" />
                  <Step title="已清关" />
                  <Step title="已出区" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
              <Tabs defaultActiveKey="regd">
                <TabPane tab="备案明细" key="regd">
                  <DataPane fullscreen={this.state.fullscreen}
                    columns={this.columns} rowSelection={rowSelection} indentSize={8}
                    dataSource={filingDetails} rowKey="id" loading={this.state.loading}
                  >
                    <DataPane.Toolbar>
                      <RadioGroup value={this.state.view} onChange={this.handleViewChange} >
                        <RadioButton value="splitted">拆分明细</RadioButton>
                        <RadioButton value="merged">合并明细</RadioButton>
                      </RadioGroup>
                      <DataPane.Extra>
                        <Summary>
                          <Summary.Item label="总数量">{stat && stat.total_qty}</Summary.Item>
                          <Summary.Item label="总净重" addonAfter="KG">{stat && stat.total_net_wt.toFixed(3)}</Summary.Item>
                          <Summary.Item label="总金额">{stat && stat.total_amount.toFixed(3)}</Summary.Item>
                        </Summary>
                      </DataPane.Extra>
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
                <TabPane tab="出区明细" key="exitd">
                  <DataPane fullscreen={this.state.fullscreen}
                    columns={this.exitColumns} rowSelection={rowSelection} indentSize={8}
                    dataSource={exitDetails} rowKey="id" loading={this.state.loading}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
