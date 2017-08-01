import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Tooltip, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadEntryDetails, loadParams, updateEntryReg, fileEntryRegs, queryEntryRegInfos } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
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
  }),
  { loadEntryDetails, updateEntryReg, fileEntryRegs, queryEntryRegInfos }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
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
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const queryable = nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      let sendable = nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
      let unsentReason = '';
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
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
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
  handleRegSend = () => {
    const asnNo = this.props.params.asnNo;
    notification.close('confirm-cargono');
    this.props.fileEntryRegs(asnNo, this.props.entryAsn.whse_code).then((result) => {
      if (!result.error) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === this.props.entryAsn.bonded_intype)[0];
        this.props.loadEntryDetails({ asnNo });
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
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
        });
      }
    });
  }
  handleQuery = () => {
    const asnNo = this.props.params.asnNo;
    this.props.queryEntryRegInfos(asnNo, this.props.entryAsn.whse_code).then((result) => {
      if (!result.error) {
        this.props.loadEntryDetails({ asnNo });
        notification.success({
          message: '操作成功',
          description: '备案明细ID已获取',
        });
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
  handleCargoAdd = () => {
    notification.close('confirm-cargono');
    this.context.router.push('/cwm/supervision/shftz/cargo');
  }
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '备案明细ID',
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
    title: '单位',
    dataIndex: 'unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '数量',
    dataIndex: 'qty',
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    dataIndex: 'amount',
  }, {
    title: '币制',
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
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateEntryReg(preRegNo, field, value);
  }
  render() {
    const { entryAsn, entryRegs, whse } = this.props;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === entryAsn.bonded_intype)[0];
    const entryEditable = entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.sent;
    const sendText = sent ? '重新发送' : '发送备案';
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
              {this.msg('ftzEntryReg')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.asnNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {this.state.queryable && <Button size="large" icon="sync" onClick={this.handleQuery}>获取状态</Button>}
            {entryEditable &&
            <Button type="primary" ghost={sent} size="large" icon="cloud-upload-o" onClick={this.handleSend} disabled={!this.state.sendable}>{sendText}</Button>}
            {entryEditable && !this.state.sendable && <Tooltip title={this.state.whyunsent} placement="left"><Icon type="question-circle-o" /></Tooltip>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="备案类型" field={entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="经营单位" field={entryAsn.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="收货单位" field={entryAsn.wh_ent_tenant_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="备案时间" field={entryAsn.reg_date && moment(entryAsn.reg_date).format('YYYY-MM-DD HH:mm')} />
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
            <Card bodyStyle={{ padding: 0 }} style={{ marginTop: 16 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {entryRegs.map(reg => (
                  <TabPane tab={reg.pre_entry_seq_no} key={reg.pre_entry_seq_no}>
                    <div className="panel-header">
                      <Row>
                        <Col sm={12} lg={5}>
                          <InfoItem size="small" addonBefore="监管入库单号" field={reg.ftz_ent_no} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_no', value)}
                          />
                        </Col>
                        <Col sm={12} lg={5}>
                          <InfoItem size="small" addonBefore="报关单号" field={reg.cus_decl_no} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'cus_decl_no', value)}
                          />
                        </Col>
                        <Col sm={12} lg={3}>
                          <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进口日期</span>}
                            type="date" field={reg.ie_date && moment(reg.ie_date).format('YYYY.MM.DD')} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ie_date', new Date(value))}
                          />
                        </Col>
                        <Col sm={12} lg={3}>
                          <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进库日期</span>}
                            type="date" field={reg.ftz_ent_date && moment(reg.ftz_ent_date).format('YYYY.MM.DD')} editable={entryEditable}
                            onEdit={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_date', new Date(value))}
                          />
                        </Col>
                        <Col sm={8} lg={2}>
                          <InfoItem size="small" addonBefore="总数量" field={''} />
                        </Col>
                        <Col sm={8} lg={3}>
                          <InfoItem size="small" addonBefore="总净重" field={''} addonAfter="KG" />
                        </Col>
                        <Col sm={8} lg={3}>
                          <InfoItem size="small" addonBefore="总金额" field={''} addonAfter="美元" />
                        </Col>
                      </Row>
                    </div>
                    <div className="table-fixed-layout">
                      <Table columns={this.columns} dataSource={reg.details} indentSize={8} rowKey="id" />
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
