import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Dropdown, Form, Radio, Layout, Menu, Steps, Button, Card, Col, Row, Tabs, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { openReceiveModal, getInboundDetail, confirm, showExpressReceivingModal, updateInboundMode } from 'common/reducers/cwmReceive';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { CWM_INBOUND_STATUS } from 'common/constants';
import PutawayDetailsPane from './tabpane/putawayDetailsPane';
import ReceiveDetailsPane from './tabpane/receiveDetailsPane';
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
    tenantName: state.account.tenantName,
    defaultWhse: state.cwmContext.defaultWhse,
    locations: state.cwmWarehouse.locations,
  }),
  { openReceiveModal, getInboundDetail, loadLocations, confirm, showExpressReceivingModal, updateInboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class ReceiveInbound extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentStatus: 0,
    printed: false,
    inboundHead: {},
    confirmDisabled: true,
  }
  componentWillMount() {
    this.loadInbound();
    this.props.loadLocations(this.props.defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  loadInbound = () => {
    this.props.getInboundDetail(this.props.params.inboundNo).then((result) => {
      const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
        cis => CWM_INBOUND_STATUS[cis].value === result.data.inboundHead.status
      )[0];
      this.setState({
        inboundHead: result.data.inboundHead,
        currentStatus: inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0,
      });
    });
  }
  handleReceivingModeChange = (ev) => {
    this.props.updateInboundMode(this.state.inboundHead.inbound_no, ev.target.value).then((result) => {
      if (!result.error) {
        const head = { ...this.state.inboundHead };
        head.rec_mode = ev.target.value;
        this.setState({ inboundHead: head });
      }
    });
  }
  handlePrint = () => {
    this.setState({
      printed: true,
    });
  }

  render() {
    const { defaultWhse } = this.props;
    const { inboundHead } = this.state;
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
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('receivingInound')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.inboundNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Tooltip title="打印入库单" placement="bottom">
              <Button size="large" icon="printer" onClick={this.handlePrint} />
            </Tooltip>
            }
            {this.state.currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup value={inboundHead.rec_mode} onChange={this.handleReceivingModeChange} size="large"
              disabled={this.state.currentStatus === CWM_INBOUND_STATUS.COMPLETED.step}
            >
              <Tooltip title="扫码收货" placement="bottom"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="人工收货" placement="bottom"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <Card bodyStyle={{ paddingBottom: 56 }}>
              <Row>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="货主" field={inboundHead.owner_name} />
                </Col>
                <Col sm={24} lg={6}>
                  <InfoItem addonBefore="ASN编号" field={inboundHead.asn_no} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="总预期数量" field={inboundHead.total_expect_qty} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="总实收数量" field={inboundHead.total_received_qty} />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="装箱数量" field={inboundHead.convey_box_qty} editable />
                </Col>
                <Col sm={12} lg={3}>
                  <InfoItem addonBefore="码盘数量" field={inboundHead.convey_pallet_qty} editable />
                </Col>
              </Row>
              <div className="card-footer">
                <Steps progressDot current={this.state.currentStatus}>
                  <Step description="待入库" />
                  <Step description="收货" />
                  <Step description="上架" />
                  <Step description="入库完成" />
                </Steps>
              </div>
            </Card>
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="receiveDetails" onChange={this.handleTabChange}>
                <TabPane tab="收货明细" key="receiveDetails">
                  <ReceiveDetailsPane inboundNo={this.props.params.inboundNo} inboundHead={inboundHead} />
                </TabPane>
                <TabPane tab="上架明细" key="putawayDetails">
                  <PutawayDetailsPane inboundNo={this.props.params.inboundNo} />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
