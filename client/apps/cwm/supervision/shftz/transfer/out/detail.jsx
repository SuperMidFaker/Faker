import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Tooltip, Layout, Tabs, Steps, Button, Tag, message, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import SearchBox from 'client/components/SearchBox';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import {
  loadRelDetails, loadParams, updateRelReg, fileRelTransfers, cancelRelReg,
  editReleaseWt,
} from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_OUTBOUND_STATUS, CWM_SO_BONDED_REGTYPES, CWM_OUTBOUND_STATUS_INDICATOR } from 'common/constants';
import EditableCell from 'client/components/EditableCell';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const { TabPane } = Tabs;
const { Step } = Steps;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadRelDetails(params.soNo, 'transfer')));
  promises.push(dispatch(loadParams()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
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
    receivers: state.cwmContext.whseAttrs.receivers.filter(recv =>
      recv.customs_code && recv.ftz_whse_code && recv.name),
    submitting: state.cwmShFtz.submitting,
  }),
  {
    loadRelDetails,
    updateRelReg,
    fileRelTransfers,
    cancelRelReg,
    editReleaseWt,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.relRegs !== this.props.relRegs && nextProps.relRegs.length > 0) {
      if (this.state.tabKey === '') {
        this.setState({
          tabKey: nextProps.relRegs[0].pre_entry_seq_no,
        });
      }
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSend = () => {
    const { soNo } = this.props.params;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    const relType = CWM_SO_BONDED_REGTYPES[2].text;
    this.props.fileRelTransfers(soNo, whseCode, ftzWhseCode).then((result) => {
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
            description: `${soNo} 已发送至 上海自贸区海关监管系统 ${relType}`,
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
  handleCancelReg = () => {
    const { soNo } = this.props.params;
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
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 60,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '商品编码',
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
  }, {
    title: '转出数量',
    dataIndex: 'out_qty',
    width: 100,
  }, {
    title: '转出单位',
    width: 100,
    dataIndex: 'out_unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '数量',
    dataIndex: 'qty',
    width: 100,
    render: o => (<b>{o}</b>),
  }, {
    title: '净重',
    dataIndex: 'net_wt',
    width: 100,
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
    width: 130,
    render: (o, record) => (<EditableCell
      value={o}
      onSave={value =>
      this.handleWtChange(value, record.id)}
    />),
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
  }]
  handleWtChange = (val, id) => {
    const change = { gross_wt: val };
    this.props.editReleaseWt({ change, id }).then((result) => {
      if (!result.error) {
        this.props.loadRelDetails(this.props.params.soNo, 'transfer');
      }
    });
  }
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateRelReg(preRegNo, field, value).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      } else {
        message.success('修改成功');
      }
    });
  }
  handleOutboundPage = () => {
    this.context.router.push(`/cwm/shipping/outbound/${this.props.relSo.outbound_no}`);
  }
  handleReceiverChange = (preRegNo, recvCode) => {
    const receiver = this.props.receivers.filter(recv => recv.code === recvCode)[0];
    if (receiver) {
      Promise.all([
        this.props.updateRelReg(preRegNo, 'receiver_cus_code', receiver.customs_code),
        this.props.updateRelReg(preRegNo, 'receiver_name', receiver.name),
        this.props.updateRelReg(preRegNo, 'receiver_ftz_whse_code', receiver.ftz_whse_code),
      ]);
    }
  }
  handleSearch = (searchText, preEntrySeqNo) => {
    this.setState({ searchVal: searchText, searchPreEntrySeqNo: preEntrySeqNo });
  }
  render() {
    const {
      relSo, relRegs, submitting, receivers,
    } = this.props;
    if (relRegs.length !== 1 || !relSo) {
      return null;
    }
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const { searchVal, searchPreEntrySeqNo } = this.state;
    const relReg = relRegs[0];
    const relType = CWM_SO_BONDED_REGTYPES[2];
    const regStatus = relReg.status;
    const relEditable = regStatus < CWM_SHFTZ_APIREG_STATUS.completed;
    const outboundStatus = relSo.outbound_status || CWM_OUTBOUND_STATUS.ALL_ALLOC.value;
    const sent = regStatus === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送转出';
    let sendable = true;
    let whyunsent;
    if (outboundStatus < CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
      sendable = false;
      whyunsent = '出库单未配货';
    } else if (outboundStatus === CWM_OUTBOUND_STATUS.PARTIAL_ALLOC.value) {
      whyunsent = '出库单部分配货';
    } else if (!relReg.ftz_rel_date || !relReg.receiver_ftz_whse_code) {
      sendable = false;
      whyunsent = '出库时间或者收货单位未填';
    }
    const recvOpts = receivers.map(recv => ({ key: recv.code, text: `${recv.customs_code} | ${recv.name} | ${recv.ftz_whse_code}` }));
    const receiver = receivers.filter(recv => recv.customs_code === relReg.receiver_cus_code
      && recv.name === relReg.receiver_name
      && recv.ftz_whse_code === relReg.receiver_ftz_whse_code)[0];
    const outStatus = relSo.outbound_no
      && CWM_OUTBOUND_STATUS_INDICATOR.filter(status => status.value === relSo.outbound_status)[0];
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            relType.ftztext,
            this.props.params.soNo,
          ]}
        >
          <PageHeader.Nav>
            {relSo.outbound_no && <Tooltip title="出库操作" placement="bottom">
              <Button icon="link" onClick={this.handleOutboundPage}><Badge status={outStatus.badge} text={outStatus.text} /></Button>
            </Tooltip>}
          </PageHeader.Nav>
          <PageHeader.Actions>
            {regStatus === CWM_SHFTZ_APIREG_STATUS.completed && <Button icon="close" loading={submitting} onClick={this.handleCancelReg}>回退备案</Button>}
            {relEditable &&
            <Button type="primary" ghost={sent} icon="cloud-upload-o" loading={submitting} onClick={this.handleSend} disabled={!sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="海关出库单号">
                <EditableCell
                  value={relReg.ftz_rel_no}
                  editable={regStatus <= CWM_SHFTZ_APIREG_STATUS.completed}
                  onSave={value => this.handleInfoSave(relReg.pre_entry_seq_no, 'ftz_rel_no', value)}
                />
              </Description>
              <Description term="发货单位海关编码">{relReg && relReg.owner_cus_code}</Description>
              <Description term="发货单位">{relReg.owner_name}</Description>
              <Description term="发货仓库号">{relReg && relReg.sender_ftz_whse_code}</Description>
              <Description term="海关入库单号">
                <EditableCell
                  value={relReg.ftz_ent_no}
                  editable={relEditable}
                  onSave={value => this.handleInfoSave(relReg.pre_entry_seq_no, 'ftz_ent_no', value)}
                />
              </Description>
              <Description term="收货单位海关编码">{relReg && relReg.receiver_cus_code}</Description>
              <Description term="收货单位">
                <EditableCell
                  type="select"
                  value={receiver && receiver.code}
                  options={recvOpts}
                  editable={relEditable}
                  onSave={value => this.handleReceiverChange(relReg.pre_entry_seq_no, value)}
                />
              </Description>
              <Description term="收货仓库号">{relReg && relReg.receiver_ftz_whse_code}</Description>
              <Description term="出库日期">
                <EditableCell
                  type="date"
                  value={relReg && relReg.ftz_rel_date && moment(relReg.ftz_rel_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave(relReg.pre_entry_seq_no, 'ftz_rel_date', new Date(value))}
                />
              </Description>
              <Description term="转出完成时间">
                <EditableCell
                  type="date"
                  value={relReg && relReg.ftz_reg_date && moment(relReg.ftz_reg_date).format('YYYY-MM-DD')}
                  onSave={value => this.handleInfoSave(relReg.pre_entry_seq_no, 'ftz_reg_date', new Date(value))}
                />
              </Description>
            </DescriptionList>
            <Steps progressDot current={regStatus} className="progress-tracker">
              <Step title="待转出" />
              <Step title="已发送" />
              <Step title="已转出" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            {relEditable && whyunsent && <Alert message={whyunsent} type="info" showIcon closable />}
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                {relRegs.map((reg) => {
                  let { details } = reg;
                  if (searchVal && reg.pre_entry_seq_no === searchPreEntrySeqNo) {
                    details = details.filter((item) => {
                      const svRe = new RegExp(searchVal);
                      return svRe.test(item.ftz_cargo_no) || svRe.test(item.product_no)
                        || svRe.test(item.hscode) || svRe.test(item.g_name);
                    });
                  }
                  const stat = details.reduce((acc, regd) => ({
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
                    <TabPane tab="转出明细" key={reg.pre_entry_seq_no}>
                      <DataPane

                        columns={this.columns}
                        rowSelection={rowSelection}
                        indentSize={8}
                        dataSource={details}
                        rowKey="id"
                        loading={this.state.loading}
                      >
                        <DataPane.Toolbar>
                          <SearchBox
                            placeholder={this.msg('searchPlaceholder')}
                            onSearch={searchText =>
                              this.handleSearch(searchText, reg.pre_entry_seq_no)}
                          />
                          <DataPane.Extra>
                            {totCol}
                          </DataPane.Extra>
                        </DataPane.Toolbar>
                      </DataPane>
                    </TabPane>);
                })}
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
