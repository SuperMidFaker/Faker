import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Tag, Badge, Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Table, Tooltip, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadApplyDetails, loadParams, fileBatchApply, makeBatchApplied, loadDeclRelDetails } from 'common/reducers/cwmShFtz';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const Step = Steps.Step;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadApplyDetails(params.batchNo)));
  promises.push(dispatch(loadDeclRelDetails(params.batchNo)));
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
    regs: state.cwmShFtz.declRelRegs,
    details: state.cwmShFtz.declRelDetails,
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
    exemptions: state.cmsManifest.params.exemptionWays.map(ep => ({
      value: ep.value,
      text: ep.text,
    })),
    whse: state.cwmContext.defaultWhse,
    submitting: state.cwmShFtz.submitting,
  }),
  { loadApplyDetails, fileBatchApply, makeBatchApplied }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class BatchDeclDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: 'details',
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
      if (this.state.tabKey === 'details') {
        this.setState({ tabKey: nextProps.batchApplies[0].pre_entry_seq_no });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  regColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: 'SO单号',
    dataIndex: 'so_no',
    width: 250,
  }, {
    title: '供货商',
    width: 200,
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    width: 100,
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}|${mode.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '币制',
    width: 100,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  relColumns = [{
    title: '出库单号',
    dataIndex: 'ftz_rel_no',
  }, {
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
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
    render: o => <TrimSpan text={o} maxLen={30} />,
    width: 240,
  }, {
    title: '原产国',
    dataIndex: 'country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '单位',
    dataIndex: 'out_unit',
    width: 100,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
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
    title: '供货商',
    width: 100,
    dataIndex: 'supplier',
  }, {
    title: '成交方式',
    width: 100,
    dataIndex: 'trxn_mode',
    render: (o) => {
      const mode = this.props.trxModes.filter(cur => cur.value === o)[0];
      const text = mode ? `${mode.value}|${mode.text}` : o;
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
  }, {
    title: '目的国',
    dataIndex: 'dest_country',
    width: 150,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      return country ? <Tag>{`${country.value}| ${country.text}`}</Tag> : o;
    },
  }]
  columns = [{
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
  }, {
    title: '项号',
    dataIndex: 'decl_g_no',
    width: 70,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
    render: (o) => {
      if (o) {
        return <Button>{o}</Button>;
      }
    },
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }, {
    title: '数量',
    width: 100,
    dataIndex: 'qty',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '净重',
    width: 100,
    dataIndex: 'net_wt',
  }, {
    title: '金额',
    dataIndex: 'amount',
    width: 200,
  }]
  handleSend = () => {
    const batchNo = this.props.params.batchNo;
    const batchDecl = this.props.batchDecl;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const tenantId = this.props.tenantId;
    const loginId = this.props.loginId;
    this.props.fileBatchApply(batchNo, batchDecl.whse_code, ftzWhseCode, loginId, tenantId).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
          });
        } else {
          notification.success({
            message: '操作成功',
            description: `${batchNo} 已发送至 上海自贸区海关监管系统 集中报关申请`,
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
    this.props.makeBatchApplied(batchNo, this.props.tenantId).then((result) => {
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
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleDelgManifest = () => {
    const ietype = this.props.batchDecl.i_e_type === 0 ? 'import' : 'export';
    this.context.router.push(`/clearance/${ietype}/manifest/${this.props.batchDecl.delg_no}`);
  }
  render() {
    const { batchDecl, batchApplies, regs, details, whse, submitting } = this.props;
    const statWt = details.reduce((acc, det) => ({
      net_wt: acc.net_wt + det.net_wt,
      gross_wt: acc.gross_wt + det.gross_wt,
    }), { net_wt: 0, gross_wt: 0 });
    let applyStep = 0;
    let sendText;
    const sent = batchDecl.status === 'processing';
    if (batchDecl.status === 'generated') {
      applyStep = 1;
      sendText = '发送报关申请';
    } else if (batchDecl.status === 'processing') {
      applyStep = 2;
      sendText = '重新发送';
    } else if (batchDecl.status === 'applied') {
      applyStep = 3;
    } else if (batchDecl.status === 'cleared') {
      applyStep = 4;
    }
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
                {this.msg('ftzBatchDecl')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.batchNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Nav>
            <Tooltip title="报关清单" placement="bottom">
              <Button size="large" icon="link" onClick={this.handleDelgManifest}>{batchDecl.delg_no}<Badge status="default" text="制单中" /></Button>
            </Tooltip>
          </PageHeader.Nav>
          <PageHeader.Actions>
            {sent && <Button size="large" icon="sync" loading={submitting} onClick={this.handleQuery}>申请完成</Button>}
            {sendText &&
            <Button type="primary" ghost={sent} size="large" icon="export" onClick={this.handleSend} loading={submitting}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 48 }} noHovering>
              <Row className="info-group-inline">
                <Col sm={24} lg={6}>
                  <InfoItem label="货主" field={batchDecl.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货单位" field={batchDecl.receiver_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="报关代理" field={batchDecl.broker_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="备案时间" field={batchDecl.reg_date && moment(batchDecl.reg_date).format('YYYY-MM-DD HH:mm')} />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={applyStep}>
                  <Step description="委托制单" />
                  <Step description="报关申请" />
                  <Step description="已发送" />
                  <Step description="申请通过" />
                  <Step description="报关放行" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} noHovering>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                <TabPane tab="分拨出库单列表" key="list">
                  <Table size="middle" columns={this.regColumns} dataSource={regs} indentSize={8} rowKey="ftz_rel_no" />
                </TabPane>
                <TabPane tab="集中报关明细" key="details">
                  <div className="panel-header">
                    <Row>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总毛重" field={statWt.gross_wt.toFixed(2)} />
                      </Col>
                      <Col sm={24} lg={6}>
                        <InfoItem size="small" addonBefore="总净重" field={statWt.net_wt.toFixed(6)} />
                      </Col>
                    </Row>
                  </div>
                  <div className="table-panel table-fixed-layout">
                    <Table size="middle" columns={this.relColumns} dataSource={details} indentSize={8} rowKey="id"
                      scroll={{ x: this.relColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
                    />
                  </div>
                </TabPane>
                {batchApplies.map(reg => (
                  <TabPane tab={`申请单${reg.pre_entry_seq_no}`} key={reg.pre_entry_seq_no}>
                    <div className="panel-header">
                      <Row>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="申请单号" field={reg.ftz_apply_no} />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="报关单号" field={reg.cus_decl_no} />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="总毛重" field={reg.gross_wt} addonAfter="KG" />
                        </Col>
                        <Col sm={24} lg={6}>
                          <InfoItem size="small" addonBefore="总净重" field={reg.net_wt} addonAfter="KG" />
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
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
