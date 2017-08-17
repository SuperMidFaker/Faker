import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadRelDetails, loadParams, updateRelReg, fileRelStockouts, fileRelTransfers,
  fileRelPortionouts, queryPortionoutInfos, cancelRelReg } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_SO_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
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
    whse: state.cwmContext.defaultWhse,
  }),
  { loadRelDetails,
    updateRelReg,
    fileRelStockouts,
    fileRelTransfers,
    fileRelPortionouts,
    queryPortionoutInfos,
    cancelRelReg }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZTransferOutDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: '',
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
        this.setState({ tabKey: nextProps.relRegs[0].pre_entry_seq_no });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    const soNo = this.props.params.soNo;
    const relSo = this.props.relSo;
    let fileOp;
    let entType;
    if (relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[0].value) {
      fileOp = this.props.fileRelStockouts(soNo, relSo.whse_code);
      entType = CWM_SO_BONDED_REGTYPES[0].text;
    }
    if (relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[1].value) {
      fileOp = this.props.fileRelPortionouts(soNo, relSo.whse_code);
      entType = CWM_SO_BONDED_REGTYPES[1].text;
    }
    if (relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[2].value) {
      fileOp = this.props.fileRelTransfers(soNo, relSo.whse_code);
      entType = CWM_SO_BONDED_REGTYPES[2].text;
    }
    if (fileOp) {
      fileOp.then((result) => {
        if (!result.error) {
          if (result.data.errorMsg) {
            notification.warn({
              message: '结果异常',
              description: result.data.errorMsg,
            });
          } else {
            notification.success({
              message: '操作成功',
              description: `${soNo} 已发送至 上海自贸区海关监管系统 ${entType.text}`,
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
          });
        }
      });
    }
  }
  handleQuery = () => {
    const soNo = this.props.params.soNo;
    this.props.queryPortionoutInfos(soNo, this.props.relSo.whse_code).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
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
    this.props.cancelEntryReg(soNo, this.props.relSo.whse_code).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
        });
      }
    });
  }
  columns = [{
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
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
    width: 250,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
    width: 100,
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
    title: '原产国',
    dataIndex: 'country',
    width: 100,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '运费',
    dataIndex: 'freight',
    width: 100,
  }, {
    title: '运费币制',
    dataIndex: 'freight_currency',
    width: 100,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value);
  }
  render() {
    const { relSo, relRegs, whse } = this.props;
    const entType = CWM_SO_BONDED_REGTYPES.filter(regtype => regtype.value === relSo.bonded_outtype)[0];
    const relEditable = relSo.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = relSo.reg_status === CWM_SHFTZ_APIREG_STATUS.sent;
    const sendText = sent ? '重新发送' : '发送备案';
    let queryable = false;
    let sendable = true;
    relRegs.forEach((relReg) => { sendable = sendable && relReg.details.length > 0; });
    const columns = [...this.columns];
    if (relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[1].value) {
      queryable = relSo.reg_status < CWM_SHFTZ_APIREG_STATUS.completed &&
        relRegs.filter(er => !er.ftz_rel_no).length === 0;
      columns.unshift({
        title: '出库明细ID',
        dataIndex: 'ftz_rel_detail_id',
        width: 150,
      });
    }
    if (relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[2].value) {
      columns.splice(6, 0, {
        title: '转出数量',
        dataIndex: 'out_qty',
      }, {
        title: '转出单位',
        dataIndex: 'out_unit',
        render: (o) => {
          const unit = this.props.units.filter(cur => cur.value === o)[0];
          const text = unit ? `${unit.value}| ${unit.text}` : o;
          return text && text.length > 0 && <Tag>{text}</Tag>;
        },
      });
    }
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              上海自贸区监管
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {whse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('ftzTransferOut')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.soNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {relSo.reg_status === CWM_SHFTZ_APIREG_STATUS.completed && <Button size="large" icon="close" onClick={this.handleCancelReg}>回退备案</Button>}
            {queryable && <Button size="large" icon="sync" onClick={this.handleQuery}>获取状态</Button>}
            {relEditable &&
            <Button type="primary" ghost={sent} size="large" icon="cloud-upload-o" onClick={this.handleSend} disabled={!sendable}>{sendText}</Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} noHovering>
              <Row gutter={16} className="info-group-underline">
                <Col sm={24} lg={6}>
                  <InfoItem label="备案类型" field={entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="提货单位" field={relSo.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field={relSo.receiver_name} />
                </Col>
                <Col sm={24} lg={3}>
                  <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                    field={relSo.created_date && moment(relSo.created_date).format('YYYY-MM-DD HH:mm')}
                  />
                </Col>
                <Col sm={24} lg={3}>
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
            <Card bodyStyle={{ padding: 0 }} style={{ marginTop: 16 }} noHovering>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {relRegs.map(reg => (
                  <TabPane tab={reg.pre_entry_seq_no} key={reg.pre_entry_seq_no}>
                    <div className="panel-header">
                      {relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[0].value &&
                      <Row>
                        {relSo.ftz_rel_no &&
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="出库单号" field={relSo.ftz_rel_no} />
                        </Col>
                        }
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore={<span><Icon type="calendar" />预计出区日期</span>}
                            type="date" field={reg.ftz_rel_date && moment(reg.ftz_rel_date).format('YYYY-MM-DD')} editable={relEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_date', new Date(value))}
                          />
                        </Col>
                      </Row>}
                      {relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[1].value &&
                      <Row>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="海关出库单号" field={reg.ftz_rel_no} editable={relEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_no', value)}
                          />
                        </Col>
                      </Row>}
                      {relSo.bonded_outtype === CWM_SO_BONDED_REGTYPES[2].value &&
                      <Row>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="分拨出库单号" field={reg.ftz_rel_no} editable={relEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_rel_no', value)}
                          />
                        </Col>
                      </Row>}
                    </div>
                    <div className="table-panel table-fixed-layout">
                      <Table size="middle" columns={columns} dataSource={reg.details} indentSize={8} rowKey="id"
                        scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
                      />
                    </div>
                  </TabPane>)
                )}
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
