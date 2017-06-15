import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Breadcrumb, Icon, Form, Layout, Tabs, Steps, Button, Select, Card, Col, Row, Tooltip, Radio } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import AllocDetailsPane from './tabpane/allocDetailsPane';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
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
    tenantName: state.account.tenantName,
    formData: state.cmsDelegation.formData,
    submitting: state.cmsDelegation.submitting,
  }),
  { loadReceiveModal }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class OutboundDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    shippingMode: 'scan',
    currentStep: 0,
    allocated: false,
    pushedTask: false,
    printedPickingList: false,
    picking: false,
    picked: false,
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
    this.setState({
      shippingMode: ev.target.value,
    });
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
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
                defaultValue="0960"
                placeholder="选择仓库"
                style={{ width: 160 }}
                disabled
              >
                <Option value="0960">物流大道仓库</Option>
                <Option value="0961">希雅路仓库</Option>
                <Option value="0962">富特路仓库</Option>
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('outboundAllocating')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              SO096120170603223
            </Breadcrumb.Item>
          </Breadcrumb>
          <Alert message="已加入波次计划: W09755345" type="info" />
          <div className="top-bar-tools">
            {this.state.allocated && this.state.shippingMode === 'manual' && !this.state.picked &&
            <Button type={!this.state.printedPickingList && 'primary'} size="large" onChange={this.handlePrint} icon={this.state.printedPickingList ? 'check-circle-o' : 'printer'} onClick={this.handlePrint} >
              打印拣货单
            </Button>}
            {this.state.allocated && <RadioGroup defaultValue={this.state.shippingMode} onChange={this.handleShippingModeChange} size="large" disabled={this.state.currentStep > 1}>
              <Tooltip title="扫码拣货"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="人工拣货"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>}
            {!this.state.allocated && <Button type="primary" size="large" icon="rocket" onClick={this.handleAutoAllocate} >订单自动分配</Button>}
            {this.state.allocated && this.state.currentStep < 2 && <Button size="large" icon="rollback" onClick={this.handleUndoAllocate} >取消订单分配</Button>}
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem label="货主" field="04601|米思米(中国)精密机械贸易" />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem label="收货人" field="米思米华东DC" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem label="订货总数" field="50" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem label="分配总数" field="50" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem label="拣货总数" field="50" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem label="装箱总数" field="50" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem label="发货总数" field="50" />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={this.state.currentStep}>
                  <Step description="创建出库" />
                  <Step description="分配" />
                  <Step description="拣货" />
                  <Step description="装箱" />
                  <Step description="发货" />
                  <Step description="出库完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
                <TabPane tab="订单明细" key="orderDetails">
                  <OrderDetailsPane />
                </TabPane>
                <TabPane tab="分配明细" key="allocDetails">
                  <AllocDetailsPane />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
