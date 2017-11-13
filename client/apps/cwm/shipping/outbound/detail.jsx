import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio,
Tag, Dropdown, Menu, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { Logixon } from 'client/components/FontIcon';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import { loadOutboundHead, updateOutboundMode, toggleShunfengExpressModal, loadShunfengConfig } from 'common/reducers/cwmOutbound';
import PrintPickList from './billsPrint/printPIckList';
import PrintShippingList from './billsPrint/printShippingList';
import PrintShippingConfirm from './billsPrint/printShippingConfirm';
import { CWM_OUTBOUND_STATUS, CWM_SO_BONDED_REGTYPES, CWM_SHFTZ_REG_STATUS_INDICATOR, CWM_SHFTZ_TRANSFER_OUT_STATUS_INDICATOR } from 'common/constants';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import ShunfengExpressModal from './modal/shunfengExpressModal';

const formatMsg = format(messages);
const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
    waybill: state.cwmOutbound.waybill,
    outboundProducts: state.cwmOutbound.outboundProducts,
  }),
  { loadOutboundHead,
    updateOutboundMode,
    toggleShunfengExpressModal,
    loadShunfengConfig }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
  jumpOut: true,
})
export default class OutboundDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
    toggleShunfengExpressModal: PropTypes.func.isRequired,
    outboundProducts: PropTypes.arrayOf(PropTypes.shape({ seq_no: PropTypes.string.isRequired })),
    loadShunfengConfig: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    allocated: true,
    pushedTask: false,
    printedPickingList: false,
    picking: false,
    picked: false,
    tabKey: 'orderDetails',
    fullscreen: true,
  }
  componentWillMount() {
    this.props.loadOutboundHead(this.props.params.outboundNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {

      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleAutoAllocate = () => {
    this.setState({
      allocated: true,
      currentStep: 1,
    });
  }
  handleUndoAllocate = () => {
    this.setState({
      allocated: false,
      currentStep: 0,
      printedPickingList: false,
    });
  }
  handleShippingModeChange = (ev) => {
    this.props.updateOutboundMode(this.props.params.outboundNo, ev.target.value);
  }
  handlePushTask = () => {
    this.setState({
      pushedTask: true,
      currentStep: 2,
      picking: true,
    });
  }
  handleWithdrawTask = () => {
    this.setState({
      pushedTask: false,
      currentStep: 1,
      picking: false,
    });
  }
  handleConfirmPicked = () => {
    this.setState({
      picked: true,
      currentStep: 2,
    });
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  handleRegPage = (type) => {
    const link = type === 'transfer' ? `/cwm/supervision/shftz/transfer/out/${this.props.outboundHead.so_no}`
      : `/cwm/supervision/shftz/release/${type}/${this.props.outboundHead.so_no}`;
    this.context.router.push(link);
  }
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  showExpressModal = () => {
    this.props.loadShunfengConfig().then((result) => {
      if (result.error) {
        const key = `open${Date.now()}`;
        const btnClick = () => {
          this.context.router.push('/hub/integration/shunfeng/install');
          notification.close(key);
        };
        const btn = (
          <Button type="primary" size="small" onClick={btnClick}>
            去配置
          </Button>
        );
        notification.open({
          message: '顺丰快递接口',
          description: result.error.message,
          btn,
          key,
          onClose: () => notification.close(key),
        });
      } else {
        const { defaultWhse, outboundHead, outboundProducts } = this.props;
        this.props.toggleShunfengExpressModal(true, {
          ...result.data,
          order_no: outboundHead.outbound_no,
          sender_phone: defaultWhse.whse_tel,
          sender_address: defaultWhse.whse_address,
          sender_contact: defaultWhse.name,
          sender_province: defaultWhse.whse_province,
          sender_city: defaultWhse.whse_city,
          sender_district: defaultWhse.whse_district,
          sender_street: defaultWhse.whse_street,
          sender_region_code: defaultWhse.whse_region_code,

          receiver_phone: outboundHead.receiver_phone || outboundHead.receiver_number,
          receiver_address: outboundHead.receiver_address,
          receiver_contact: outboundHead.receiver_contact,
          receiver_province: outboundHead.receiver_province,
          receiver_city: outboundHead.receiver_city,
          receiver_district: outboundHead.receiver_district,
          receiver_street: outboundHead.receiver_street,
          receiver_region_code: outboundHead.receiver_region_code,

          product_name: outboundProducts[0] ? outboundProducts[0].name : '',
          product_qty: outboundProducts.map(item => item.order_qty).reduce((a, b) => a + b),
        });
      }
    });
  }
  render() {
    const { defaultWhse, outboundHead } = this.props;
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(
      cis => CWM_OUTBOUND_STATUS[cis].value === outboundHead.status
    )[0];
    let regTag;
    let regTypes = [];
    if (outboundHead.bonded === 1) {
      regTag = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === outboundHead.bonded_outtype && sbr.tagcolor)[0];
      if (regTag) {
        regTypes = [{
          tooltip: '海关监管',
          type: outboundHead.bonded_outtype,
          status: outboundHead.reg_status,
        }];
      }
    } else if (outboundHead.bonded === -1 && outboundHead.bonded_outtype.length > 0) {
      regTypes = outboundHead.bonded_outtype.map((type, index) => {
        const sreg = CWM_SO_BONDED_REGTYPES.filter(sbr => sbr.value === type)[0];
        return { type, tooltip: sreg && sreg.ftztext, status: outboundHead.reg_status[index] };
      });
    }
    const outboundStep = outbStatus ? CWM_OUTBOUND_STATUS[outbStatus].step : 0;
    const scanLabel = outboundHead.shipping_mode === 'scan' ? ' 扫码模式' : '';
    const manualLabel = outboundHead.shipping_mode === 'manual' ? ' 手动模式' : '';
    const printMenu = (
      <Menu>
        <Menu.Item>
          <PrintPickList outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
        <Menu.Item>
          <PrintShippingList outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
        <Menu.Item>
          <PrintShippingConfirm outboundNo={this.props.params.outboundNo} />
        </Menu.Item>
      </Menu>
    );
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {defaultWhse.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('shippingOutbound')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.outboundNo}
              </Breadcrumb.Item>
            </Breadcrumb>
            {regTag && <Tag color={regTag.tagcolor}>{regTag.ftztext}</Tag>}
          </PageHeader.Title>
          <PageHeader.Nav>
            {regTypes.map((reg) => {
              const regStatus = reg.type === 'transfer' ?
                CWM_SHFTZ_TRANSFER_OUT_STATUS_INDICATOR.filter(status => status.value === reg.status)[0] :
                CWM_SHFTZ_REG_STATUS_INDICATOR.filter(status => status.value === reg.status)[0];
              if (regStatus) {
                return (<Tooltip title={reg.tooltip} placement="bottom" key={reg.type}>
                  <Button icon="link" onClick={() => this.handleRegPage(reg.type)} style={{ marginLeft: 12 }}>
                    <Badge status={regStatus.badge} text={regStatus.text} />
                  </Button>
                </Tooltip>);
              } else {
                return null;
              }
            })
            }
          </PageHeader.Nav>
          <PageHeader.Actions>
            {this.state.tabKey === 'pickingDetails' && <Dropdown overlay={printMenu}>
              <Button icon="printer" />
            </Dropdown>}
            <Tooltip title="打印顺丰速运面单" placement="bottom">
              <Button onClick={this.showExpressModal} >
                <Logixon type="sf-express" />
              </Button>
            </Tooltip>
            <RadioGroup value={outboundHead.shipping_mode} onChange={this.handleShippingModeChange} disabled={outboundStep === 5}>
              <Tooltip title="扫码出库操作模式" placement="bottom"><RadioButton value="scan"><Icon type="scan" />{scanLabel}</RadioButton></Tooltip>
              <Tooltip title="手动出库操作模式" placement="bottom"><RadioButton value="manual"><Icon type="solution" />{manualLabel}</RadioButton></Tooltip>
            </RadioGroup>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} noHovering>
            <Row gutter={16} className="info-group-underline">
              <Col sm={24} lg={4}>
                <InfoItem label="货主" field={outboundHead.owner_name} />
              </Col>
              { outboundHead.wave_no &&
              <Col sm={24} lg={4}>
                <InfoItem label="波次编号" field={outboundHead.wave_no} />
              </Col>
                }
              <Col sm={24} lg={4}>
                <InfoItem label="客户订单号" field={outboundHead.cust_order_no} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="订单总数" field={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="分配总数" field={outboundHead.total_alloc_qty} upperLimit={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="拣货总数" field={outboundHead.total_picked_qty} upperLimit={outboundHead.total_alloc_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem label="发货总数" field={outboundHead.total_shipped_qty} upperLimit={outboundHead.total_picked_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.created_date && moment(outboundHead.created_date).format('YYYY.MM.DD')}
                />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="出库时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={outboundHead.completed_date && moment(outboundHead.completed_date).format('MM.DD HH:mm')}
                />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={outboundStep}>
                <Step title="待出库" />
                <Step title="分配" />
                <Step title="拣货" />
                <Step title="复核装箱" />
                <Step title="发货" />
                <Step title="已出库" />
              </Steps>
            </div>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} noHovering onSizeChange={this.toggleFullscreen}>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane outboundNo={this.props.params.outboundNo} fullscreen={this.state.fullscreen} />
              </TabPane>
              <TabPane tab="拣货明细" key="pickingDetails">
                <PickingDetailsPane outboundNo={this.props.params.outboundNo} fullscreen={this.state.fullscreen} />
              </TabPane>
              <TabPane tab="装箱明细" key="packingDetails">
                <PackingDetailsPane outboundNo={this.props.params.outboundNo} fullscreen={this.state.fullscreen} />
              </TabPane>
              <TabPane tab="发货明细" key="shippingDetails">
                <ShippingDetailsPane outboundNo={this.props.params.outboundNo} fullscreen={this.state.fullscreen} />
              </TabPane>
            </Tabs>
          </MagicCard>
          <ShunfengExpressModal />
        </Content>
      </div>
    );
  }
}
