import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Layout, Tabs, Steps, Button, Card, Col, Row, Tooltip, Radio } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import PickingDetailsPane from './tabpane/pickingDetailsPane';
import PackingDetailsPane from './tabpane/packingDetailsPane';
import ShippingDetailsPane from './tabpane/shippingDetailsPane';
import { loadOutboundHead, updateOutboundMode } from 'common/reducers/cwmOutbound';
import { CWM_OUTBOUND_STATUS } from 'common/constants';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Step = Steps.Step;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
  }),
  { loadOutboundHead, updateOutboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class OutboundDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    allocated: false,
    pushedTask: false,
    printedPickingList: false,
    picking: false,
    picked: false,
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
  handlePrint = () => {
    this.setState({
      printedPickingList: true,
    });
  }
  handleConfirmPicked = () => {
    this.setState({
      picked: true,
      currentStep: 2,
    });
  }

  render() {
    const { defaultWhse, outboundHead } = this.props;
    const outbStatus = Object.keys(CWM_OUTBOUND_STATUS).filter(
      cis => CWM_OUTBOUND_STATUS[cis].value === outboundHead.status
    )[0];
    const outboundStep = outbStatus ? CWM_OUTBOUND_STATUS[outbStatus].step : 0;
    return (
      <div>
        <Header className="page-header">
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
          <div className="page-header-tools">
            {this.state.allocated && !this.state.picked &&
            <Button type={!this.state.printedPickingList && 'primary'} size="large" icon="printer" onClick={this.handlePrint} />
            }
            <RadioGroup value={outboundHead.shipping_mode} onChange={this.handleShippingModeChange} size="large" disabled={outboundStep === 5}>
              <Tooltip title="扫码模式"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Card bodyStyle={{ paddingBottom: 56 }}>
            <Row>
              <Col sm={24} lg={6}>
                <InfoItem addonBefore="货主" field={outboundHead.owner_name} />
              </Col>
              { outboundHead.wave_no &&
              <Col sm={24} lg={6}>
                <InfoItem addonBefore="波次编号" field={outboundHead.wave_no} />
              </Col>
                }
              { outboundHead.so_no &&
              <Col sm={24} lg={6}>
                <InfoItem addonBefore="SO编号" field={outboundHead.so_no} />
              </Col>
                }
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="订货总数" field={outboundHead.total_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="分配总数" field={outboundHead.total_alloc_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="拣货总数" field={outboundHead.total_picked_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="发货总数" field={outboundHead.total_shipped_qty} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={outboundStep}>
                <Step description="待出库" />
                <Step description="分配" />
                <Step description="拣货" />
                <Step description="装箱" />
                <Step description="发货" />
                <Step description="已出库" />
              </Steps>
            </div>
          </Card>
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
              <TabPane tab="订单明细" key="orderDetails">
                <OrderDetailsPane outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="拣货明细" key="pickingDetails">
                <PickingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="装箱明细" key="packingDetails">
                <PackingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
              <TabPane tab="发货明细" key="shippingDetails">
                <ShippingDetailsPane shippingMode={this.state.shippingMode} outboundNo={this.props.params.outboundNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
