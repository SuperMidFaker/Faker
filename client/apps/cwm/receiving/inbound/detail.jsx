import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Alert, Badge, Icon, Dropdown, Radio, Layout, Menu, Steps, Button, Tabs, Tooltip, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import Drawer from 'client/components/Drawer';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import EditableCell from 'client/components/EditableCell';
import { loadInboundHead, updateInboundMode } from 'common/reducers/cwmReceive';
import { loadAsnEntries } from 'common/reducers/cwmShFtz';
import { CWM_INBOUND_STATUS, CWM_ASN_BONDED_REGTYPES, CWM_SHFTZ_REG_STATUS_INDICATOR, CWM_SHFTZ_TRANSFER_IN_STATUS_INDICATOR } from 'common/constants';
import PutawayDetailsPane from './tabpane/putawayDetailsPane';
import ReceiveDetailsPane from './tabpane/receiveDetailsPane';
import Print from './printInboundList';
import messages from '../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { Description } = DescriptionList;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Step } = Steps;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
  }),
  { loadAsnEntries, loadInboundHead, updateInboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class ReceiveInbound extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    activeTab: '',
    entryRegs: [],
  }
  componentDidMount() {
    this.props.loadInboundHead(this.props.params.inboundNo).then((result) => {
      if (!result.error) {
        const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value ? 'putawayDetails' : 'receiveDetails';
        this.setState({
          activeTab,
        });
        this.props.loadAsnEntries(result.data.asn_no).then((asnRegRes) => {
          if (!asnRegRes.error) {
            this.setState({ entryRegs: asnRegRes.data });
          }
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadInboundHead(nextProps.params.inboundNo).then((result) => {
        if (!result.error) {
          const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value ? 'putawayDetails' : 'receiveDetails';
          this.setState({
            activeTab,
          });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReceivingModeChange = (ev) => {
    this.props.updateInboundMode(this.props.params.inboundNo, { rec_mode: ev.target.value });
  }
  handleTotalRecVolChange = (value) => {
    this.props.updateInboundMode(
      this.props.params.inboundNo,
      { total_received_vol: Number(value) }
    );
  }
  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }
  handleRegPage = (entryRegNo) => {
    const link = this.props.inboundHead.bonded_intype === 'transfer' ? `/cwm/supervision/shftz/transfer/in/${entryRegNo}`
      : `/cwm/supervision/shftz/entry/${entryRegNo}`;
    this.context.router.push(link);
  }
  render() {
    const { defaultWhse, inboundHead } = this.props;
    const { entryRegs } = this.state;
    const tagMenu = (
      <Menu>
        <Menu.Item key="printTraceTag">打印追踪标签</Menu.Item>
        <Menu.Item key="exportTraceTag">导出追踪标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="printConveyTag">打印箱/托标签</Menu.Item>
        <Menu.Item key="exportConveyTag">导出箱/托标签</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="exportAllTag">导出全部标签</Menu.Item>
      </Menu>
    );
    const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(cis =>
      CWM_INBOUND_STATUS[cis].value === inboundHead.status)[0];
    const currentStatus = inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0;
    const entType = CWM_ASN_BONDED_REGTYPES.filter(regtype =>
      regtype.value === inboundHead.bonded_intype)[0];
    const scanLabel = inboundHead.rec_mode === 'scan' ? ' 扫码模式' : '';
    const manualLabel = inboundHead.rec_mode === 'manual' ? ' 手动模式' : '';
    let regLink = null;
    const primReg = entryRegs[0];
    if (entryRegs.length === 1) {
      const regStatus = inboundHead.bonded_intype === 'transfer' ?
        CWM_SHFTZ_TRANSFER_IN_STATUS_INDICATOR.filter(status =>
          status.value === primReg.status)[0] :
        CWM_SHFTZ_REG_STATUS_INDICATOR.filter(status => status.value === primReg.status)[0];
      regLink = (<Button icon="link" onClick={() => this.handleRegPage(primReg.pre_entry_seq_no)}>
        {primReg.cus_decl_no ||
          primReg.pre_entry_seq_no}<Badge status={regStatus.badge} text={regStatus.text} />
      </Button>);
    } else if (entryRegs.length > 1) {
      const regMenu = (<Menu onClick={ev => this.handleRegPage(ev.key)}>
        {entryRegs.map((er) => {
          const regStatus = CWM_SHFTZ_REG_STATUS_INDICATOR.filter(status =>
            status.value === er.status)[0];
          return (<Menu.Item key={er.pre_entry_seq_no}>{er.cus_decl_no || er.pre_entry_seq_no}
            <Badge status={regStatus.badge} text={regStatus.text} />
          </Menu.Item>);
        })}
      </Menu>);
      regLink = (<Dropdown overlay={regMenu}>
        <Button style={{ marginLeft: 8 }}>关联监管备案<Icon type="down" /></Button>
      </Dropdown>
      );
    }
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            defaultWhse.name,
            this.msg('receivingInound'),
            this.props.params.inboundNo,
            !!inboundHead.bonded && entType &&
            <Tag color={entType.tagcolor}>{entType.ftztext}</Tag>,
          ]}
        >
          <PageHeader.Nav>
            {regLink}
          </PageHeader.Nav>
          <PageHeader.Actions>
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Print inboundNo={this.props.params.inboundNo} />
            }
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step && false &&
            <Dropdown overlay={tagMenu}>
              <Button onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup
              value={inboundHead.rec_mode}
              onChange={this.handleReceivingModeChange}
              disabled={currentStatus === CWM_INBOUND_STATUS.COMPLETED.step}
            >
              <Tooltip title="扫码入库操作模式" placement="bottom"><RadioButton value="scan"><Icon type="scan" />{scanLabel}</RadioButton></Tooltip>
              <Tooltip title="手动入库操作模式" placement="bottom"><RadioButton value="manual"><Icon type="solution" />{manualLabel}</RadioButton></Tooltip>
            </RadioGroup>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="货主">{inboundHead.owner_name}</Description>
              <Description term="客户单号">{inboundHead.cust_order_no}</Description>
              <Description term="总预期数量">{inboundHead.total_expect_qty}</Description>
              <Description term="总实收数量">{inboundHead.total_received_qty}</Description>
              <Description term="总立方数">
                <EditableCell
                  value={inboundHead.total_received_vol}
                  editable={currentStatus < CWM_INBOUND_STATUS.COMPLETED.value}
                  onSave={this.handleTotalRecVolChange}
                />
              </Description>
              <Description term="创建时间">{inboundHead.created_date && moment(inboundHead.created_date).format('YYYY.MM.DD HH:mm')}</Description>
              <Description term="入库时间">{inboundHead.completed_date && moment(inboundHead.completed_date).format('YYYY.MM.DD HH:mm')}</Description>
            </DescriptionList>
            <Steps progressDot current={currentStatus} className="progress-tracker">
              <Step title="待入库" />
              <Step title="收货" />
              <Step title="上架" />
              <Step title="已入库" />
            </Steps>
          </Drawer>
          <Content className="page-content">
            {currentStatus >= CWM_INBOUND_STATUS.ALL_RECEIVED.value &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            inboundHead.total_received_qty < inboundHead.total_expect_qty &&
            <Alert message="实收数量少于预期数量，全部上架确认后必须手动关闭" type="info" showIcon closable />
          }
            {inboundHead.total_received_qty > inboundHead.total_expect_qty &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            <Alert message="实收数量超过预期数量，全部上架确认后必须手动关闭" type="warning" showIcon closable />
          }
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.activeTab} onChange={this.handleTabChange}>
                <TabPane tab="收货明细" key="receiveDetails">
                  <ReceiveDetailsPane inboundNo={this.props.params.inboundNo} />
                </TabPane>
                <TabPane tab="上架明细" key="putawayDetails" disabled={inboundHead.status === CWM_INBOUND_STATUS.CREATED.value}>
                  <PutawayDetailsPane inboundNo={this.props.params.inboundNo} />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
