import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Tag, Badge, Input, Layout, Tabs, Steps, Button, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import SearchBox from 'client/components/SearchBox';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadApplyDetails, loadParams, fileBatchApply, makeBatchApplied, loadDeclRelDetails } from 'common/reducers/cwmShFtz';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { Step } = Steps;

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
    regsSearchText: '',
    detailsSearchText: '',
    applySearchText: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.batchApplies !== this.props.batchApplies && nextProps.batchApplies.length > 0) {
      if (this.state.tabKey === 'details') {
        this.setState({
          tabKey: nextProps.batchApplies[0].pre_entry_seq_no,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
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
    const { batchNo } = this.props.params;
    const { batchDecl } = this.props;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const { loginId } = this.props;
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
    const { batchNo } = this.props.params;
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
  handleListSearch = (searchText) => {
    this.setState({ regsSearchText: searchText });
  }
  handleDetailsSearch = (searchText) => {
    this.setState({ detailsSearchText: searchText });
  }
  handleAppliesSearch = (searchText, preEntrySeqNo) => {
    const applySearchText = { ...this.state.applySearchText };
    applySearchText[preEntrySeqNo] = searchText;
    this.setState({
      applySearchText,
    });
  }
  render() {
    const {
      batchDecl, submitting, regs, details,
    } = this.props;
    const { regsSearchText, detailsSearchText } = this.state;
    const applySearchText = { ...this.state.applySearchText };
    let batchApplies = [...this.props.batchApplies];
    let filterRegs = regs;
    let filterDetails = details;
    if (regsSearchText) {
      filterRegs = regs.filter((item) => {
        const reg = new RegExp(regsSearchText);
        return reg.test(item.ftz_rel_no) || reg.test(item.so_no);
      });
    }
    if (detailsSearchText) {
      filterDetails = details.filter((item) => {
        const reg = new RegExp(detailsSearchText);
        return reg.test(item.ftz_rel_no) || reg.test(item.product_no)
        || reg.test(item.hscode) || reg.test(item.g_name);
      });
    }
    batchApplies = batchApplies.map((apply) => {
      const data = { ...apply };
      const searchText = applySearchText[data.pre_entry_seq_no];
      if (searchText) {
        data.details = data.details.filter((item) => {
          const reg = new RegExp(searchText);
          return reg.test(item.product_no) || reg.test(item.g_name);
        });
        data.gross_wt = data.details.reduce((prev, next) => prev + next.gross_wt, 0);
        data.net_wt = data.details.reduce((prev, next) => prev + next.net_wt, 0);
      }
      return data;
    });
    const statWt = filterDetails.reduce((acc, det) => ({
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
      <Layout>
        <PageHeader
          breadcrumb={[
            this.msg('ftzBatchDecl'),
            this.props.params.batchNo,
          ]}
        >
          <PageHeader.Nav>
            <Button icon="link" onClick={this.handleDelgManifest}>关联报关清单 <Badge status="default" text="制单中" /></Button>
          </PageHeader.Nav>
          <PageHeader.Actions>
            {sent && <Button icon="check" loading={submitting} onClick={this.handleQuery}>标记申请完成</Button>}
            {sendText &&
            <Button type="primary" ghost={sent} icon="export" onClick={this.handleSend} loading={submitting}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="货主">{batchDecl.owner_name}</Description>
              <Description term="收货单位">{batchDecl.receiver_name}</Description>
              <Description term="报关代理">{batchDecl.broker_name}</Description>
              <Description term="备案时间">{batchDecl.reg_date && moment(batchDecl.reg_date).format('YYYY.MM.DD HH:mm')}</Description>
            </DescriptionList>
            <Steps progressDot current={applyStep} className="progress-tracker">
              <Step title="委托制单" />
              <Step title="待报关申请" />
              <Step title="已发送申请" />
              <Step title="已清关" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                <TabPane tab="分拨出库单列表" key="list">
                  <DataPane
                    columns={this.regColumns}
                    rowSelection={rowSelection}
                    indentSize={8}
                    dataSource={filterRegs}
                    rowKey="ftz_rel_no"
                    loading={this.state.loading}
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder="出库单号" onSearch={this.handleListSearch} />
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
                <TabPane tab="集中报关明细" key="details">
                  <DataPane
                    columns={this.relColumns}
                    rowSelection={rowSelection}
                    indentSize={0}
                    dataSource={filterDetails}
                    rowKey="id"
                    loading={this.state.loading}
                  >
                    <DataPane.Toolbar>
                      <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleDetailsSearch} />
                      <DataPane.Extra>
                        {totCol}
                      </DataPane.Extra>
                    </DataPane.Toolbar>
                  </DataPane>
                </TabPane>
                {batchApplies.map(reg => (
                  <TabPane tab={`申请单${reg.ftz_apply_no || reg.pre_entry_seq_no}`} key={reg.pre_entry_seq_no}>
                    <DataPane
                      columns={this.columns}
                      rowSelection={rowSelection}
                      indentSize={8}
                      dataSource={reg.details}
                      rowKey="id"
                      loading={this.state.loading}
                    >
                      <DataPane.Toolbar>
                        <SearchBox
                          placeholder={this.msg('searchPlaceholder')}
                          onSearch={searchText =>
                              this.handleAppliesSearch(searchText, reg.pre_entry_seq_no)}
                        />
                        <Input addonBefore="报关单号" value={reg.cus_decl_no} style={{ width: 280 }} />
                        <DataPane.Extra>
                          <Summary>
                            <Summary.Item label="总毛重" addonAfter="KG">{reg.gross_wt.toFixed(2)}</Summary.Item>
                            <Summary.Item label="总净重" addonAfter="KG">{reg.net_wt.toFixed(6)}</Summary.Item>
                          </Summary>
                        </DataPane.Extra>
                      </DataPane.Toolbar>
                    </DataPane>
                  </TabPane>))}
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
