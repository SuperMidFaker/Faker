import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Tag, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import { loadEntryDetails, loadParams } from 'common/reducers/cwmShFtz';
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
  { loadEntryDetails }
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
    sentable: false,
    queryable: false,
    tabKey: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const queryable = nextProps.entryAsn.status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      const sentable = nextProps.entryAsn.status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.cus_decl_no).length === 0;
      this.setState({ tabKey: nextProps.entryRegs[0].pre_entry_seq_no, queryable, sentable });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    notification.success({
      message: '操作成功',
      description: `${this.props.params.asnNo} 已发送至 上海自贸区海关监管系统 一二线先报关后入库`,
    });
    this.setState({
      sent: true,
    });
  }
  columns = [{
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
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
    width: 200,
  }, {
    title: '单位',
    dataIndex: 'unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
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
      return text;
    },
  }, {
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (field, value) => {
    const change = {};
    change[field] = value;
  }
  render() {
    const { entryAsn, entryRegs, whse } = this.props;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === entryAsn.ftz_ent_type)[0];
    return (
      <div>
        <Header className="top-bar">
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
          <div className="top-bar-tools">
            {this.state.queryable && <Button size="large" icon="sync" onClick={this.handleQuery}>获取状态</Button>}
            <Button type="primary" size="large" icon="export" onClick={this.handleSend} disabled={!this.state.sentable}>发送备案</Button>
            {this.state.sentable && <Button />}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案类型" field={entType && <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="经营单位" field={entryAsn.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field={entryAsn.wh_ent_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案时间" addonBefore={<span><Icon type="calendar" /></span>}
                    field={entryAsn.ftz_ent_date && moment(entryAsn.ftz_ent_date).format('YYYY-MM-DD HH:mm')}
                  />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={entryAsn.status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {entryRegs.map(reg => (
                  <TabPane tab={reg.pre_entry_seq_no} key={reg.pre_entry_seq_no}>
                    <div className="panel-header">
                      <Row>
                        <Col sm={24} lg={8}>
                          <InfoItem size="small" addonBefore="入库备案号" field={reg.ftz_ent_no} editable onEdit={value => this.handleInfoSave('ftz_ent_no', value)} />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进口日期</span>}
                            type="date" field={reg.ie_date} editable
                            onEdit={value => this.handleInfoSave('ie_date', new Date(value))}
                          />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore={<span><Icon type="calendar" />进库日期</span>}
                            type="date" field={reg.ftz_ent_date} editable
                            onEdit={value => this.handleInfoSave('ftz_ent_date', new Date(value))}
                          />
                        </Col>
                      </Row>
                    </div>
                    <Table columns={this.columns} dataSource={reg.details} indentSize={8} rowKey="id" />
                  </TabPane>
        ))}
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
