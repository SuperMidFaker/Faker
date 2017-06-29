import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, Button, Card, Col, Row } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import OrderListPane from './tabpane/orderListPane';
import OrderDetailsPane from './tabpane/orderDetailsPane';
import { loadReceiveModal } from 'common/reducers/cwmReceive';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;
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
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadReceiveModal }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class WaveDetail extends Component {
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
  componentWillMount() {
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
    const { defaultWhse } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('shippingWave')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.waveNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.allocated && !this.state.picked &&
            <Button type={!this.state.printedPickingList && 'primary'} size="large" icon="printer" onClick={this.handlePrint} />
            }
            <Button size="large">释放</Button>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="波次号" field="04601|米思米(中国)精密机械贸易" />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="说明" field="米思米华东DC" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem addonBefore="总订单数" field="50" />
                </Col>
                <Col sm={12} lg={2}>
                  <InfoItem addonBefore="总订单明细数" field="50" />
                </Col>
              </Row>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="orderList" onChange={this.handleTabChange}>
                <TabPane tab="订单列表" key="orderList">
                  <OrderListPane />
                </TabPane>
                <TabPane tab="订单明细" key="orderDetails">
                  <OrderDetailsPane />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}