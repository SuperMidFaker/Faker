import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Tooltip, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadEntryDetails, loadParams, updateEntryReg, pairEntryRegProducts, checkEntryRegStatus } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

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
    owners: state.cwmContext.whseAttrs.owners,
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
  { loadEntryDetails, updateEntryReg, pairEntryRegProducts, checkEntryRegStatus }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZTransferInDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    comparable: false,
    tabKey: '',
    fullscreen: true,
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
      const comparable = nextProps.entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.pending &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      const newState = { comparable };
      if (this.state.tabKey === '') {
        newState.tabKey = nextProps.entryRegs[0].pre_entry_seq_no;
      }
      this.setState(newState);
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleEnqueryPairing = () => {
    const asnNo = this.props.params.asnNo;
    const tenantId = this.props.tenantId;
    const loginName = this.props.username;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    this.props.pairEntryRegProducts(asnNo, this.props.entryAsn.whse_code, ftzWhseCode, tenantId, loginName).then((result) => {
      if (!result.error) {
        if (result.data.remainFtzStocks.length > 0 || result.data.remainProducts.length > 0) {
          let remainFtzMsg = result.data.remainFtzStocks.map(rfs =>
              `${rfs.ftz_ent_detail_id}-${rfs.hscode}-${rfs.name} 净重: ${rfs.stock_wt} 数量: ${rfs.stock_qty}`).join('\n');
          if (remainFtzMsg) {
            remainFtzMsg = `东方支付入库单剩余以下未配: ${remainFtzMsg}`;
          }
          let remainPrdtMsg = result.data.remainProducts.map(rps =>
              `${rps.product_no}-${rps.hscode}-${rps.name} 数量: ${rps.expect_qty}`).join('\n');
          if (remainPrdtMsg) {
            remainPrdtMsg = `订单剩余以下未配: ${remainPrdtMsg}`;
          }
          notification.warn({
            message: '未完全匹配',
            description: `${remainFtzMsg}\n${remainPrdtMsg}`,
            duration: 0,
            placement: 'topLeft',
          });
        } else {
          notification.success({
            message: '操作成功',
            description: '货号明细ID配对完成',
          });
        }
        this.props.loadEntryDetails({ asnNo });
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
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 60,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 180,
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
    dataIndex: 'stock_netwt',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'stock_grosswt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'stock_amount',
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
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateEntryReg(preRegNo, field, value);
  }
  handleInboundPage = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.entryAsn.inbound_no}`);
  }
  handlePairingConfirmed = () => {
    const asnNo = this.props.params.asnNo;
    this.props.checkEntryRegStatus(asnNo, CWM_SHFTZ_APIREG_STATUS.completed).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  render() {
    const { entryAsn, entryRegs, whse, submitting } = this.props;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === entryAsn.bonded_intype)[0];
    const inbStatus = CWM_INBOUND_STATUS_INDICATOR.filter(status => status.value === entryAsn.inbound_status)[0];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
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
                {inbStatus && <Badge status={inbStatus.badge} text={inbStatus.text} />}
              </Button>
            </Tooltip>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {this.state.comparable && <Button type="primary" size="large" icon="sync" loading={submitting} onClick={this.handleEnqueryPairing}>明细匹配核对</Button>}
            {entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.processing &&
              <Button type="primary" size="large" loading={submitting} onClick={this.handlePairingConfirmed}>核对通过</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
              <Row gutter={16} className="info-group-underline">
                <Col sm={12} lg={6}>
                  <InfoItem label="海关进库单号" field={entryRegs[0] && entryRegs[0].ftz_ent_no} editable
                    onEdit={value => this.handleInfoSave(entryRegs[0].pre_entry_seq_no, 'ftz_ent_no', value)}
                  />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="收货单位海关编码" field={entryRegs[0] && entryRegs[0].owner_cus_code} />
                </Col>
                <Col sm={12} lg={6}>
                  <InfoItem label="收货单位" field={entryRegs[0] && entryRegs[0].owner_name} />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="收货仓库号" field={entryRegs[0] && entryRegs[0].receiver_ftz_whse_code} />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="进库日期" addonBefore={<Icon type="clock-circle-o" />} type="date"
                    field={entryRegs[0] && entryRegs[0].ftz_ent_date && moment(entryRegs[0].ftz_ent_date).format('YYYY-MM-DD')} editable
                    onEdit={value => this.handleInfoSave(entryRegs[0].pre_entry_seq_no, 'ftz_ent_date', new Date(value))}
                  />
                </Col>
              </Row>
              <Row gutter={16} className="info-group-underline">
                <Col sm={12} lg={6}>
                  <InfoItem label="海关出库单号" field={entryRegs[0] && entryRegs[0].ftz_rel_no} editable
                    onEdit={value => this.handleInfoSave(entryRegs[0].pre_entry_seq_no, 'ftz_rel_no', value)}
                  />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="发货单位海关编码" field={entryRegs[0] && entryRegs[0].sender_cus_code} editable
                    onEdit={value => this.handleInfoSave(entryRegs[0].pre_entry_seq_no, 'sender_cus_code', value)}
                  />
                </Col>
                <Col sm={12} lg={6}>
                  <InfoItem label="发货单位" field={entryRegs[0] && entryRegs[0].sender_name}
                    onEdit={value => this.handleInfoSave(entryRegs[0].pre_entry_seq_no, 'sender_name', value)}
                  />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="发货仓库号" field={entryRegs[0] && entryRegs[0].sender_ftz_whse_code} editable
                    onEdit={value => this.handleInfoSave(entryRegs[0] && entryRegs[0].pre_entry_seq_no, 'sender_ftz_whse_code', value)}
                  />
                </Col>
                <Col sm={12} lg={4}>
                  <InfoItem label="转入完成时间" addonBefore={<Icon type="clock-circle-o" />} type="date"
                    field={entryAsn.reg_date && moment(entryAsn.reg_date).format('YYYY.MM.DD HH:mm')} format="YYYY.MM.DD HH:mm"
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={entryAsn.reg_status}>
                  <Step description="待转入" />
                  <Step description="已接收" />
                  <Step description="已核对" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} noHovering onSizeChange={this.toggleFullscreen}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {entryRegs.map((reg) => {
                  const stat = reg.details.reduce((acc, regd) => ({
                    total_qty: acc.total_qty + regd.stock_qty,
                    total_amount: acc.total_amount + regd.stock_amount,
                    total_net_wt: acc.total_net_wt + regd.stock_netwt,
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
                    <TabPane tab="转入明细" key={reg.pre_entry_seq_no}>
                      <DataPane fullscreen={this.state.fullscreen}
                        columns={this.columns} rowSelection={rowSelection} indentSize={0}
                        dataSource={reg.details} rowKey="id" loading={this.state.loading}
                      >
                        <DataPane.Toolbar>
                          <Row type="flex">
                            <Col className="col-flex-primary info-group-inline" />


                            <Col className="col-flex-secondary">
                              {totCol}
                            </Col>
                          </Row>
                        </DataPane.Toolbar>
                      </DataPane>
                    </TabPane>);
                })}
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
