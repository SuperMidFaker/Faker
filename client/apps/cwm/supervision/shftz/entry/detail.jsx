import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Tooltip, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import Summary from 'client/components/Summary';
import { loadEntryDetails, loadParams, updateEntryReg, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadEntryDetails({ asnNo: params.asnNo })));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    entryAsn: state.cwmShFtz.entry_asn,
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
    owners: state.cwmContext.whseAttrs.owners,
    submitting: state.cwmShFtz.submitting,
  }),
  { loadEntryDetails, updateEntryReg, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus }
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
    sendable: false,
    queryable: false,
    whyunsent: '',
    tabKey: '',
    owner: this.props.owners.filter(own => own.name === this.props.entryAsn.owner_name).length === 0 ?
      {} : this.props.owners.filter(own => own.name === this.props.entryAsn.owner_name)[0],
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const queryable = nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      let regDetailExist = true;
      nextProps.entryRegs.forEach((entReg) => { regDetailExist = regDetailExist && entReg.details.length > 0; });
      let sendable = nextProps.entryAsn.inbound_no && regDetailExist && nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
      let unsentReason = !nextProps.entryAsn.inbound_no ? '收货通知ASN尚未释放' : '';
      if (sendable) {
        const nonCusDeclRegs = nextProps.entryRegs.filter(er => !(er.cus_decl_no && er.ie_date && er.ftz_ent_date));
        if (nonCusDeclRegs.length === 0) {
          sendable = true;
        } else {
          unsentReason = `${nonCusDeclRegs.map(reg => reg.pre_entry_seq_no).join(',')}未申报`;
          sendable = false;
        }
      }
      const newState = { queryable, sendable, whyunsent: unsentReason };
      if (this.state.tabKey === '') {
        newState.tabKey = nextProps.entryRegs[0].pre_entry_seq_no;
      }
      this.setState(newState);
    }
    if (nextProps.entryAsn !== this.props.entryAsn) {
      const owners = nextProps.owners.filter(owner => owner.name === nextProps.entryAsn.owner_name);
      const owner = owners.length === 0 ? {} : owners[0];
      this.setState({ owner });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    if (!this.state.owner.portion_enabled) { // 判断是否启用分拨
      this.handleRegSend();
    } else {
      let nonCargono = false;
      for (let i = 0; i < this.props.entryRegs.length; i++) {
        nonCargono = this.props.entryRegs[i].details.filter(det => !det.ftz_cargo_no).length !== 0;
        if (nonCargono) {
          break;
        }
      }
      if (nonCargono) {
        notification.warn({
          message: '货号未备案',
          description: '部分货号无备案料号, 是否以生成临时备案料号调用备案',
          btn: (<div>
            <a role="presentation" onClick={this.handleRegSend}>直接备案</a>
            <span className="ant-divider" />
            <a role="presentation" onClick={this.handleCargoAdd}>添加对应备案料号</a>
          </div>),
          key: 'confirm-cargono',
          duration: 0,
        });
      } else {
        this.handleRegSend();
      }
    }
  }
  handleRegSend = () => {
    const asnNo = this.props.params.asnNo;
    notification.close('confirm-cargono');
    this.props.fileEntryRegs(asnNo, this.props.whse.code, this.props.tenantId).then((result) => {
      if (!result.error) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === this.props.entryAsn.bonded_intype)[0];
        this.props.loadEntryDetails({ asnNo });
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          notification.success({
            message: '操作成功',
            description: `${asnNo} 已发送至 上海自贸区海关监管系统 ${entType && entType.text}`,
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
  handleQuery = () => {
    const asnNo = this.props.params.asnNo;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    this.props.queryEntryRegInfos(asnNo, whseCode, ftzWhseCode, this.props.tenantId).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          this.props.loadEntryDetails({ asnNo });
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
    const asnNo = this.props.params.asnNo;
    this.props.checkEntryRegStatus(asnNo, CWM_SHFTZ_APIREG_STATUS.pending).then((result) => {
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
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateEntryReg(preRegNo, field, value);
  }
  handleInboundPage = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.entryAsn.inbound_no}`);
  }
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 70,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '项号',
    dataIndex: 'decl_g_no',
    width: 60,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'HS编码',
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
    const { entryAsn, entryRegs, whse, submitting } = this.props;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === entryAsn.bonded_intype)[0];
    const entryEditable = entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送备案';
    const inbStatus = entryAsn.inbound_no && CWM_INBOUND_STATUS_INDICATOR.filter(status => status.value === entryAsn.inbound_status)[0];
    return (
      <div>
        <PageHeader>
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
                {this.props.params.asnNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            {entryAsn.inbound_no && <Tooltip title="入库操作" placement="bottom">
              <Button size="large" icon="link" onClick={this.handleInboundPage}>
                <Badge status={inbStatus.badge} text={inbStatus.text} />
              </Button>
            </Tooltip>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.completed && <Button size="large" icon="close" loading={submitting} onClick={this.handleCancelReg}>回退备案</Button>}
            {this.state.queryable && <Button size="large" icon="sync" loading={submitting} onClick={this.handleQuery}>同步入库明细</Button>}
            {entryEditable &&
            <Button type="primary" ghost={sent} size="large" icon="cloud-upload-o" loading={submitting} onClick={this.handleSend} disabled={!this.state.sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="main-content">
          {entryEditable && !this.state.sendable && <Alert message={this.state.whyunsent} type="info" showIcon closable />}
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
              <Row gutter={16} className="info-group-underline">
                <Col sm={12} lg={6}>
                  <InfoItem label="经营单位" field={entryAsn.owner_name} />
                </Col>
                <Col sm={12} lg={6}>
                  <InfoItem label="收货单位" field={entryAsn.wh_ent_tenant_name} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={entryAsn.created_date && moment(entryAsn.created_date).format('YYYY.MM.DD HH:mm')}
                  />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem label="备案完成时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={entryAsn.reg_date && moment(entryAsn.reg_date).format('YYYY.MM.DD HH:mm')}
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={entryAsn.reg_status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {entryRegs.map((reg) => {
                  const stat = reg.details.reduce((acc, regd) => ({
                    total_qty: acc.total_qty + regd.qty,
                    total_amount: acc.total_amount + regd.amount,
                    total_net_wt: acc.total_net_wt + regd.net_wt,
                  }), {
                    total_qty: 0,
                    total_amount: 0,
                    total_net_wt: 0,
                  });
                  const totCol = (
                    <Summary>
                      <Summary.Item label="总数量">{stat.total_qty}</Summary.Item>
                      <Summary.Item label="总净重" addonAfter="KG">{stat.total_net_wt.toFixed(3)}</Summary.Item>
                      <Summary.Item label="总金额">{stat.total_amount.toFixed(3)}</Summary.Item>
                    </Summary>
                  );
                  return (
                    <TabPane tab="备案明细" key={reg.pre_entry_seq_no}>
                      <Row type="flex" className="panel-header">
                        <Col className="col-flex-primary info-group-inline">
                          <InfoItem label="海关进库单号" field={reg.ftz_ent_no} width={320} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_no', value)}
                          />
                          <InfoItem label="报关单号" field={reg.cus_decl_no} width={320} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'cus_decl_no', value)}
                          />
                          <InfoItem label="进口日期"
                            type="date" field={reg.ie_date && moment(reg.ie_date).format('YYYY-MM-DD')} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ie_date', new Date(value))} width={320}
                          />
                          <InfoItem label="进库日期"
                            type="date" field={reg.ftz_ent_date && moment(reg.ftz_ent_dateie_date).format('YYYY-MM-DD')} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_date', new Date(value))} width={320}
                          />
                        </Col>
                        <Col className="col-flex-secondary">
                          {totCol}
                        </Col>
                      </Row>
                      <div className="table-panel table-fixed-layout">
                        <Table size="middle" columns={this.columns} dataSource={reg.details} indentSize={8} rowKey="id"
                          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
                        />
                      </div>
                    </TabPane>);
                })}
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
