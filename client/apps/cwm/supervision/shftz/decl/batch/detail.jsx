import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Tag, Badge, Breadcrumb, Form, Layout, Tabs, Steps, Button, Card, Col, Row, Table, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import InfoItem from 'client/components/InfoItem';
import TrimSpan from 'client/components/trimSpan';
import { loadApplyDetails, loadParams, fileBatchApply, makeBatchApplied, loadDeclRelDetails } from 'common/reducers/cwmShFtz';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
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
    if (nextProps.batchApplies !== this.props.batchApplies && nextProps.batchApplies.length > 0) {
      if (this.state.tabKey === 'details') {
        this.setState({ tabKey: nextProps.batchApplies[0].pre_entry_seq_no });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  regColumns = [{
    title: '分拨出库单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: 'SO编号',
    dataIndex: 'so_no',
    width: 180,
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
    title: '分拨出库单号',
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: '出库明细ID',
    dataIndex: 'ftz_rel_detail_id',
    width: 150,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: '商品编码',
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
    const loginId = this.props.loginId;
    this.props.fileBatchApply(batchNo, batchDecl.whse_code, ftzWhseCode, loginId).then((result) => {
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
    this.props.makeBatchApplied(batchNo).then((result) => {
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
      applyStep = 2;
    } else if (batchDecl.status === 'cleared') {
      applyStep = 3;
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const totCol = (
      <Summary>
        <Summary.Item label="总毛重" addonAfter="KG">{statWt.gross_wt.toFixed(2)}</Summary.Item>
        <Summary.Item label="总净重" addonAfter="KG">{statWt.net_wt.toFixed(6)}</Summary.Item>
      </Summary>
    );
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
            <Button icon="link" onClick={this.handleDelgManifest}>关联申报清单 <Badge status="default" text="制单中" /></Button>
          </PageHeader.Nav>
          <PageHeader.Actions>
            {sent && <Button icon="check" loading={submitting} onClick={this.handleQuery}>标记申请完成</Button>}
            {sendText &&
            <Button type="primary" ghost={sent} icon="export" onClick={this.handleSend} loading={submitting}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }} hoverable={false}>
              <DescriptionList col={4}>
                <Description term="货主">{batchDecl.owner_name}</Description>
                <Description term="收货单位">{batchDecl.receiver_name}</Description>
                <Description term="报关代理">{batchDecl.broker_name}</Description>
                <Description term="备案时间">{batchDecl.reg_date && moment(batchDecl.reg_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={applyStep}>
                  <Step title="委托制单" />
                  <Step title="待报关申请" />
                  <Step title="已发送申请" />
                  <Step title="已清关" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} onSizeChange={this.toggleFullscreen}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                <TabPane tab="分拨出库单列表" key="list">
                  <Table size="middle" columns={this.regColumns} dataSource={regs} indentSize={8} rowKey="ftz_rel_no" />
                </TabPane>
                <TabPane tab="集中报关明细" key="details">
                  <DataPane fullscreen={this.state.fullscreen}
                    columns={this.relColumns} rowSelection={rowSelection} indentSize={0}
                    dataSource={details} rowKey="id" loading={this.state.loading}
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
                </TabPane>
                {batchApplies.map(reg => (
                  <TabPane tab={`申请单${reg.ftz_apply_no || reg.pre_entry_seq_no}`} key={reg.pre_entry_seq_no}>
                    <DataPane fullscreen={this.state.fullscreen}
                      columns={this.columns} rowSelection={rowSelection} indentSize={8}
                      dataSource={reg.details} rowKey="id" loading={this.state.loading}
                    >
                      <DataPane.Toolbar>
                        <Row type="flex">
                          <Col className="col-flex-primary info-group-inline">
                            <InfoItem label="报关单号" field={reg.cus_decl_no} width={370} />
                          </Col>
                          <Col className="col-flex-secondary">
                            <Summary>
                              <Summary.Item label="总毛重" addonAfter="KG">{reg.gross_wt.toFixed(2)}</Summary.Item>
                              <Summary.Item label="总净重" addonAfter="KG">{reg.net_wt.toFixed(6)}</Summary.Item>
                            </Summary>
                          </Col>
                        </Row>
                      </DataPane.Toolbar>
                    </DataPane>
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
