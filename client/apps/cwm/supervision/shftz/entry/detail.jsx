import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Alert, Badge, Breadcrumb, Form, Layout, Steps, Button, Card, Tag, Tooltip, message, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import EditableCell from 'client/components/EditableCell';
import TrimSpan from 'client/components/trimSpan';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataPane from 'client/components/DataPane';
import Summary from 'client/components/Summary';
import { loadEntryDetails, loadParams, updateEntryReg, refreshEntryRegFtzCargos, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus } from 'common/reducers/cwmShFtz';
import { CWM_SHFTZ_APIREG_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_INBOUND_STATUS_INDICATOR } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
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
    submitting: state.cwmShFtz.submitting,
  }),
  { loadEntryDetails, updateEntryReg, refreshEntryRegFtzCargos, fileEntryRegs, queryEntryRegInfos, checkEntryRegStatus }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class SHFTZEntryDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    reg: {},
    sendable: false,
    queryable: false,
    fullscreen: true,
    alertInfo: '',
    tabKey: '',
    nonCargono: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entryRegs !== this.props.entryRegs && nextProps.entryRegs.length > 0) {
      const queryable = nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed &&
        nextProps.entryRegs.filter(er => !er.ftz_ent_no).length === 0; // 入库单号全部已知可查询入库明细
      let regDetailExist = true;
      nextProps.entryRegs.forEach((entReg) => { regDetailExist = regDetailExist && entReg.details.length > 0; });
      let sendable = nextProps.entryAsn.inbound_no && regDetailExist && nextProps.entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
      let unsentReason = !nextProps.entryAsn.inbound_no ? '收货通知ASN尚未释放' : '';
      if (sendable) {
        const nonCusDeclRegs = nextProps.entryRegs.filter(er => !(er.cus_decl_no && er.ie_date && er.ftz_ent_date));
        if (nonCusDeclRegs.length === 0) {
          sendable = true;
          nextProps.entryRegs.forEach((er) => {
            const invalidDets = [];
            for (let i = 0; i < er.details.length; i++) {
              const det = er.details[i];
              if (!det.country || !det.currency || !det.unit || !det.net_wt) {
                invalidDets.push(det.asn_seq_no);
              }
            }
            if (invalidDets.length > 0) {
              sendable = false;
              unsentReason = `${unsentReason ? '\n' : ''}${er.cus_decl_no}: 行号${invalidDets.join(',')}数据不完整`;
            }
          });
        } else {
          unsentReason = `${nonCusDeclRegs.map(reg => reg.pre_entry_seq_no).join(',')}报关单号或进口时间或入库时间为空`;
          sendable = false;
        }
      }
      const newState = { queryable, sendable, alertInfo: unsentReason };
      if (this.state.tabKey === '') {
        newState.tabKey = nextProps.entryRegs[0].pre_entry_seq_no;
      }
      if (nextProps.entryAsn.portion_enabled) {
        for (let i = 0; i < nextProps.entryRegs.length; i++) {
          const nonCargono = nextProps.entryRegs[i].details.filter(det => !det.ftz_cargo_no).length !== 0;
          if (nonCargono) {
            newState.nonCargono = true;
            break;
          }
        }
      }
      this.setState({
        reg: nextProps.entryRegs[0],
        alertInfo: unsentReason,
        newState,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleRefreshFtzCargo = () => {
    const asnNo = this.props.params.asnNo;
    this.props.refreshEntryRegFtzCargos(asnNo).then((result) => {
      if (!result.error) {
        this.props.loadEntryDetails({ asnNo });
        notification.success({
          message: '操作成功',
          description: '备件号刷新成功',
          placement: 'topLeft',
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
  handleSend = () => {
    if (this.state.nonCargono) {
      notification.warn({
        message: '货号未备案',
        description: '部分货号无备案料号, 是否以生成临时备案料号调用备案',
        btn: (<div>
          <a role="presentation" onClick={() => this.handleRegSend(true)}>直接备案</a>
          <span className="ant-divider" />
          <a role="presentation" onClick={this.handleCargoAdd}>添加对应备案料号</a>
        </div>),
        key: 'confirm-cargono',
        duration: 0,
      });
    } else {
      this.handleRegSend(false);
    }
  }
  handleRegSend = (close) => {
    if (close) {
      notification.close('confirm-cargono');
    }
    const asnNo = this.props.params.asnNo;
    this.props.fileEntryRegs(asnNo, this.props.whse.code).then((result) => {
      if (!result.error) {
        const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === this.props.entryAsn.bonded_intype)[0];
        this.props.loadEntryDetails({ asnNo });
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
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
          duration: 15,
        });
      }
    });
  }
  handleQuery = () => {
    const asnNo = this.props.params.asnNo;
    const ftzWhseCode = this.props.whse.ftz_whse_code;
    const whseCode = this.props.whse.code;
    const loginName = this.props.username;
    this.props.queryEntryRegInfos(asnNo, whseCode, ftzWhseCode, loginName).then((result) => {
      if (!result.error) {
        if (result.data.errorMsg) {
          notification.warn({
            message: '结果异常',
            description: result.data.errorMsg,
            duration: 15,
          });
        } else {
          this.props.loadEntryDetails({ asnNo });
          notification.success({
            message: '操作成功',
            description: '备案明细ID已获取',
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
    const asnNo = this.props.params.asnNo;
    this.props.checkEntryRegStatus(asnNo, CWM_SHFTZ_APIREG_STATUS.pending).then((result) => {
      if (result.error) {
        notification.error({
          message: '操作失败',
          description: result.error.message,
          duration: 15,
        });
      }
    });
  }
  handleCargoAdd = () => {
    notification.close('confirm-cargono');
    this.context.router.push('/cwm/supervision/shftz/cargo');
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
      reg: this.props.relRegs[tabKey],
    });
  }
  handleInfoSave = (preRegNo, field, value) => {
    this.props.updateEntryReg(preRegNo, field, value).then((result) => {
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
  handleInboundPage = () => {
    this.context.router.push(`/cwm/receiving/inbound/${this.props.entryAsn.inbound_no}`);
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 70,
  }, {
    title: '备案料号',
    dataIndex: 'ftz_cargo_no',
    width: 160,
  }, {
    title: '入库明细ID',
    dataIndex: 'ftz_ent_detail_id',
    width: 120,
  }, {
    title: '项号',
    dataIndex: 'decl_g_no',
    width: 60,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 160,
  }, {
    title: '商品编码',
    dataIndex: 'hscode',
    width: 150,
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
    title: '剩余数量',
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
    dataIndex: 'net_wt',
  }, {
    title: '剩余净重',
    width: 100,
    dataIndex: 'stock_netwt',
  }, {
    title: '毛重',
    width: 100,
    dataIndex: 'gross_wt',
  }, {
    title: '金额',
    width: 100,
    dataIndex: 'amount',
  }, {
    title: '剩余金额',
    width: 100,
    dataIndex: 'stock_amount',
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
    title: '原产国',
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: '运费',
    width: 100,
    dataIndex: 'freight',
  }, {
    title: '剩余运费',
    width: 100,
    dataIndex: 'stock_freight',
  }, {
    title: '运费币制',
    width: 100,
    dataIndex: 'freight_currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }]
  render() {
    const { entryAsn, entryRegs, whse, submitting } = this.props;
    const { reg } = this.state;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype => regtype.value === entryAsn.bonded_intype)[0];
    const entryEditable = entryAsn.reg_status < CWM_SHFTZ_APIREG_STATUS.completed;
    const sent = entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.processing;
    const sendText = sent ? '重新发送' : '发送备案';
    const inbStatus = entryAsn.inbound_no && CWM_INBOUND_STATUS_INDICATOR.filter(status => status.value === entryAsn.inbound_status)[0];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const tabList = [];
    entryRegs.forEach((r, index) => tabList.push({ tab: r.ftz_ent_no || r.pre_entry_seq_no, key: index }));
    const stat = reg.details && reg.details.reduce((acc, regd) => ({
      total_qty: acc.total_qty + regd.qty,
      total_amount: acc.total_amount + regd.amount,
      total_net_wt: acc.total_net_wt + regd.net_wt,
    }), {
      total_qty: 0,
      total_amount: 0,
      total_net_wt: 0,
    });
    return (
      <div>
        <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
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
                <Badge status={inbStatus.badge} text={inbStatus.text} />
              </Button>
            </Tooltip>
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {entryAsn.reg_status === CWM_SHFTZ_APIREG_STATUS.completed && <Button size="large" icon="close" loading={submitting} onClick={this.handleCancelReg}>回退备案</Button>}
            {this.state.queryable && <Button size="large" icon="sync" loading={submitting} onClick={this.handleQuery}>同步入库明细</Button>}
            {this.state.nonCargono && <Button size="large" icon="sync" loading={submitting} onClick={this.handleRefreshFtzCargo}>同步备件号</Button>}
            {entryEditable &&
            <Button type="primary" ghost={sent} size="large" icon="cloud-upload-o" loading={submitting} onClick={this.handleSend} disabled={!this.state.sendable}>{sendText}</Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          {entryEditable && !this.state.sendable && <Alert message={this.state.alertInfo} type="info" showIcon closable />}
          <Form layout="vertical">
            <Card bodyStyle={{ padding: 16, paddingBottom: 48 }} noHovering>
              <DescriptionList col={3}>
                <Description term="海关进库单号">
                  <EditableCell value={reg.ftz_ent_no} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_no', value)}
                  />
                </Description>
                <Description term="报关单号">
                  <EditableCell value={reg.cus_decl_no} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'cus_decl_no', value)}
                  />
                </Description>
                <Description term="经营单位">{reg.owner_name}</Description>
                <Description term="进口日期">
                  <EditableCell type="date" value={reg.ie_date && moment(reg.ie_date).format('YYYY-MM-DD')} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ie_date', new Date(value))}
                  />
                </Description>
                <Description term="进库日期">
                  <EditableCell type="date" value={reg.ftz_ent_date && moment(reg.ftz_ent_date).format('YYYY-MM-DD')} editable={entryEditable}
                    onSave={value => this.handleInfoSave(reg.pre_entry_seq_no, 'ftz_ent_date', new Date(value))}
                  />
                </Description>
                <Description term="备案时间">{reg.reg_date && moment(reg.reg_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
              <div className="card-footer">
                <Steps progressDot current={entryAsn.reg_status}>
                  <Step description="待备案" />
                  <Step description="已发送" />
                  <Step description="备案完成" />
                </Steps>
              </div>
            </Card>
            <MagicCard bodyStyle={{ padding: 0 }} noHovering onSizeChange={this.toggleFullscreen}>
              <DataPane header="备案明细" fullscreen={this.state.fullscreen}
                columns={this.columns} rowSelection={rowSelection} indentSize={0}
                dataSource={reg.details} rowKey="id" loading={this.state.loading}
              >
                <DataPane.Toolbar>
                  <DataPane.Extra>
                    <Summary>
                      <Summary.Item label="总数量">{stat && stat.total_qty}</Summary.Item>
                      <Summary.Item label="总净重" addonAfter="KG">{stat && stat.total_net_wt.toFixed(3)}</Summary.Item>
                      <Summary.Item label="总金额">{stat && stat.total_amount.toFixed(3)}</Summary.Item>
                    </Summary>
                  </DataPane.Extra>
                </DataPane.Toolbar>
              </DataPane>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
