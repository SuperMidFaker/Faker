import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InfoItem from 'client/components/InfoItem';
import NavLink from 'client/components/nav-link';
import { loadApplyDetails, loadParams, fileBatchApply, makeBatchApplied } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadApplyDetails(params.batchNo)));
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
    batchDecl: state.cwmShFtz.batch_decl,
    batchApplies: state.cwmShFtz.batch_applies,
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
  { loadApplyDetails, fileBatchApply, makeBatchApplied }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZBatchDeclDetail extends Component {
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
    if (nextProps.batchApplies !== this.props.batchApplies && nextProps.batchApplies.length > 0) {
      if (this.state.tabKey === '') {
        this.setState({ tabKey: nextProps.batchApplies[0].pre_entry_seq_no });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    const batchNo = this.props.params.batchNo;
    const batchDecl = this.props.batchDecl;
    this.props.fileBatchApply(batchNo, batchDecl.whse_code, this.props.loginId).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
          });
        } else {
          notification.success({
            message: '操作成功',
            description: `${batchNo} 已发送至 上海自贸区海关监管系统 出区备案申请`,
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
    const batchNo = this.props.params.batchNo;
    this.props.makeBatchApplied(batchNo, this.props.batchDecl.whse_code).then((result) => {
      if (!result.error) {
        this.props.loadApplyDetails(batchNo);
      } else if (result.error.message === 'WHSE_FTZ_UNEXIST') {
        notification.error({
          message: '操作失败',
          description: '仓库监管系统未配置',
        });
      }
    });
  }
  columns = [{
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
    /* }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
    width: 90,
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
    render: o => (<b>{o}</b>),
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    dataIndex: 'net_wt', */
  }, {
    title: '金额',
    dataIndex: 'amount',
    width: 200,
    /* }, {
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
    }, */
  }]
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value);
  }
  render() {
    const { batchDecl, batchApplies, whse } = this.props;
    const relEditable = batchDecl.status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = batchDecl.status === CWM_SHFTZ_APIREG_STATUS.sent;
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
              {this.msg('ftzBatchDecl')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.batchNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            {sent && <Button size="large" icon="sync" onClick={this.handleQuery}>申请完成</Button>}
            {relEditable &&
            <Button type="primary" ghost={sent} size="large" icon="export" onClick={this.handleSend} disabled={!relEditable}>{sendText}</Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="清单委托" field={
                    <NavLink to={`/clearance/${batchDecl.i_e_type === 0 ? 'import' : 'export'}/manifest/${batchDecl.delg_no}`}>{batchDecl.delg_no}</NavLink>
                  }
                  />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="提货单位" field={batchDecl.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="收货单位" field={batchDecl.receiver_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="备案时间" field={batchDecl.reg_date && moment(batchDecl.reg_date).format('YYYY-MM-DD HH:mm')} />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={batchDecl.status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {batchApplies.map(reg => (
                  <TabPane tab={reg.pre_entry_seq_no} key={reg.pre_entry_seq_no}>
                    <div className="panel-header">
                      <Row>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="申请单号" field={reg.ftz_apply_no} />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="总毛重" field={reg.gross_wt} />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="总净重" field={reg.net_wt} />
                        </Col>
                      </Row>
                    </div>
                    <div className="table-panel table-fixed-layout">
                      <Table size="middle" columns={this.columns} dataSource={reg.details} indentSize={8} rowKey="id"
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
