import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Tooltip, Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import Summary from 'client/components/Summary';
import { loadRelDetails, loadParams, updateRelReg, fileRelStockouts,
  fileRelPortionouts, queryPortionoutInfos, cancelRelReg, editReleaseWt, splitRelDetails } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_BONDED_REGTYPES, CWM_OUTBOUND_STATUS, CWM_OUTBOUND_STATUS_INDICATOR } from 'common/constants';
import EditableCell from 'client/components/EditableCell';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadRelDetails(params.soNo)));
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
export default class SHFTZRelDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: '',
    editable: false,
    groupVals: ['supplier', 'trxn_mode', 'currency'],
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
      if (this.state.tabKey === '') {
        this.setState({
          tabKey: nextProps.relRegs[0].pre_entry_seq_no,
          editable: nextProps.relRegs[0].reg_status < CWM_SHFTZ_APIREG_STATUS.completed,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    const soNo = this.props.params.soNo;
    const relSo = this.props.relSo;
    const tenantId = this.props.tenantId;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const fileOp = this.props.fileRelPortionouts(soNo, relSo.whse_code, ftzWhseCode, tenantId);
    const entType = CWM_SO_BONDED_REGTYPES[1].text;

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
              description: `${soNo} 已发送至 上海自贸区海关监管系统 ${entType}`,
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
  handleQuery = () => {
    const soNo = this.props.params.soNo;
    const tenantId = this.props.tenantId;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    this.props.queryPortionoutInfos(soNo, whseCode, ftzWhseCode, tenantId).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          this.props.loadRelDetails(soNo);
        }
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      }
    });
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
        this.props.loadRelDetails(this.props.params.soNo);
      }
    });
  }
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value);
  }
  handleOutboundPage = () => {
    this.context.router.push(`/cwm/shipping/outbound/${this.props.relSo.outbound_no}`);
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
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
    width: 100,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: 'HS编码',
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
    width: 180,
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
    title: '原产国',
    dataIndex: 'country',
    width: 100,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  render() {
    const { relSo, relRegs, whse, submitting } = this.props;
    const entType = CWM_SO_BONDED_REGTYPES.filter(regtype => regtype.value === relSo.bonded_outtype)[0];
    const relEditable = relSo.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = relSo.reg_status === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送备案';
    let sendable = true;
    let whyunsent = '';
    if (relSo.outbound_status < CWM_OUTBOUND_STATUS.ALL_ALLOC.value) {
      sendable = false;
      whyunsent = '出库单配货未完成';
    }
    const queryable = relSo.reg_status < CWM_SHFTZ_APIREG_STATUS.completed && relRegs.filter(er => !er.ftz_rel_no).length === 0;
    const outStatus = relSo.outbound_no && CWM_OUTBOUND_STATUS_INDICATOR.filter(status => status.value === relSo.outbound_status)[0];
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
                分拨出库备案
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.soNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            {relSo.outbound_no && <Tooltip title="出库操作" placement="bottom">
              <Button size="large" icon="link" onClick={this.handleOutboundPage}><Badge status={outStatus.badge} text={outStatus.text} /></Button>
            </Tooltip>
        }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {relSo.reg_status === CWM_SHFTZ_APIREG_STATUS.completed && <Button size="large" loading={submitting} icon="close" onClick={this.handleCancelReg}>回退备案</Button>}
            {queryable && <Tooltip title="向监管系统接口查询并同步分拨出库单明细数据" placement="bottom">
              <Button size="large" loading={submitting} icon="sync" onClick={this.handleQuery}>同步数据</Button>
            </Tooltip>
            }
            {relEditable &&
            <Button type="primary" ghost={sent} size="large" icon="cloud-upload-o" onClick={this.handleSend} loading={submitting} disabled={!sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="main-content">
          {relEditable && whyunsent && <Alert message={whyunsent} type="info" showIcon closable />}
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
              <Row gutter={16} className="info-group-underline">
                <Col sm={12} lg={6}>
                  <InfoItem label="监管类型" field={entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>} />
                </Col>
                <Col sm={12} lg={6}>
                  <InfoItem label="提货单位" field={relSo.owner_name} />
                </Col>
                <Col sm={12} lg={6}>
                  <InfoItem label="运输单位" field={relSo.carrier_name} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={relSo.created_date && moment(relSo.created_date).format('YYYY-MM-DD HH:mm')}
                  />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem label="备案完成时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={relSo.reg_date && moment(relSo.reg_date).format('YYYY-MM-DD HH:mm')}
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={relSo.reg_status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {relRegs.map((reg) => {
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
                  const countTag = <span>备案明细 <Tag>{reg.details.length}</Tag></span>;
                  return (
                    <TabPane tab={countTag} key={reg.pre_entry_seq_no}>
                      <Row type="flex" className="panel-header">
                        <Col className="col-flex-primary info-group-inline">
                          <InfoItem label="分拨出库单号" field={reg.ftz_rel_no} width={320} editable={relEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_no', value)}
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
