import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Alert, Breadcrumb, Icon, Dropdown, Radio, Layout, Menu, Steps, Button, Card, Col, Row, Tabs, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { loadInboundHead, updateInboundMode } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS } from 'common/constants';
import PutawayDetailsPane from './tabpane/putawayDetailsPane';
import ReceiveDetailsPane from './tabpane/receiveDetailsPane';
import Print from './printInboundList';
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
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
  }),
  { loadInboundHead, updateInboundMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class ReceiveInbound extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    printed: false,
    activeTab: '',
  }
  componentWillMount() {
    this.props.loadInboundHead(this.props.params.inboundNo).then((result) => {
      if (!result.error) {
        const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value ? 'putawayDetails' : 'receiveDetails';
        this.setState({
          activeTab,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadInboundHead(nextProps.params.inboundNo).then((result) => {
        if (!result.error) {
          const activeTab = result.data.status === CWM_INBOUND_STATUS.COMPLETED.value || result.data.status === CWM_INBOUND_STATUS.PARTIAL_PUTAWAY.value ? 'putawayDetails' : 'receiveDetails';
          this.setState({
            activeTab,
          });
        }
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleReceivingModeChange = (ev) => {
    this.props.updateInboundMode(this.props.params.inboundNo, ev.target.value);
  }
  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { defaultWhse, inboundHead } = this.props;
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
    const inbStatus = Object.keys(CWM_INBOUND_STATUS).filter(
      cis => CWM_INBOUND_STATUS[cis].value === inboundHead.status
    )[0];
    const currentStatus = inbStatus ? CWM_INBOUND_STATUS[inbStatus].step : 0;
    return (
      <div>
        <Header className="page-header">
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
          <div className="page-header-tools">
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step &&
            <Print inboundNo={this.props.params.inboundNo} />
            }
            {currentStatus < CWM_INBOUND_STATUS.COMPLETED.step && false &&
            <Dropdown overlay={tagMenu}>
              <Button size="large" onClick={this.handleTagging}>
                <Icon type="barcode" />标签 <Icon type="down" />
              </Button>
            </Dropdown>
            }
            <RadioGroup value={inboundHead.rec_mode} onChange={this.handleReceivingModeChange} size="large"
              disabled={currentStatus === CWM_INBOUND_STATUS.COMPLETED.step}
            >
              <Tooltip title="扫码模式" placement="bottom"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式" placement="bottom"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          {currentStatus >= CWM_INBOUND_STATUS.ALL_RECEIVED.value &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            inboundHead.total_received_qty < inboundHead.total_expect_qty &&
            <Alert message="实收数量少于预期数量，全部上架确认后必须手动关闭" type="info" showIcon closable />
          }
          {inboundHead.total_received_qty > inboundHead.total_expect_qty &&
            currentStatus < CWM_INBOUND_STATUS.COMPLETED.value &&
            <Alert message="实收数量超过预期数量，全部上架确认后必须手动关闭" type="warning" showIcon closable />
          }
          <Card bodyStyle={{ padding: 16, paddingBottom: 56 }} noHovering>
            <Row gutter={16} className="info-group-underline">
              <Col sm={24} lg={4}>
                <InfoItem label="货主" field={inboundHead.owner_name} />
              </Col>
              <Col sm={24} lg={4}>
                <InfoItem label="ASN编号" field={inboundHead.asn_no} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总预期数量" field={inboundHead.total_expect_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="总实收数量" field={inboundHead.total_received_qty} />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="创建时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={inboundHead.created_date && moment(inboundHead.created_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
              <Col sm={12} lg={3}>
                <InfoItem label="入库时间" addonBefore={<Icon type="clock-circle-o" />}
                  field={inboundHead.completed_date && moment(inboundHead.completed_date).format('YYYY.MM.DD HH:mm')}
                />
              </Col>
              <Col sm={24} lg={4}>
                <InfoItem label="操作模式" field={inboundHead.rec_mode === 'manual' ? '手动' : '扫码'} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={currentStatus}>
                <Step description="待入库" />
                <Step description="收货" />
                <Step description="上架" />
                <Step description="已入库" />
              </Steps>
            </div>
          </Card>
          <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }} noHovering>
            <Tabs activeKey={this.state.activeTab} onChange={this.handleTabChange}>
              <TabPane tab="收货明细" key="receiveDetails">
                <ReceiveDetailsPane inboundNo={this.props.params.inboundNo} />
              </TabPane>
              <TabPane tab="上架明细" key="putawayDetails" disabled={inboundHead.status === CWM_INBOUND_STATUS.CREATED.value}>
                <PutawayDetailsPane inboundNo={this.props.params.inboundNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
