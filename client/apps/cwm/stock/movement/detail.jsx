import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Card, Col, Row, Tooltip, Radio } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import MovementDetailsPane from './tabpane/movementDetailsPane';
import { loadMovementHead, updateMovingMode } from 'common/reducers/cwmInventoryStock';
import { CWM_MOVEMENT_STATUS } from 'common/constants';
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
    movementHead: state.cwmInventoryStock.movementHead,
    reload: state.cwmInventoryStock.movementReload,
  }),
  { loadMovementHead, updateMovingMode }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class MovementDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    updateMovingMode: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    completed: false,
  }
  componentWillMount() {
    this.props.loadMovementHead(this.props.params.movementNo);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadMovementHead(this.props.params.movementNo);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleMovingModeChange = (ev) => {
    this.props.updateMovingMode(this.props.params.movementNo, ev.target.value);
  }
  render() {
    const { defaultWhse, movementHead } = this.props;
    const movingStatus = Object.keys(CWM_MOVEMENT_STATUS).filter(
      cis => CWM_MOVEMENT_STATUS[cis].value === movementHead.status
    )[0];
    const movingStep = movingStatus ? CWM_MOVEMENT_STATUS[movingStatus].step : 0;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {defaultWhse.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('movement')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.props.params.movementNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <RadioGroup value={movementHead.moving_mode} onChange={this.handleMovingModeChange} size="large" disabled={movingStep === 5}>
              <Tooltip title="扫码模式"><RadioButton value="scan"><Icon type="scan" /></RadioButton></Tooltip>
              <Tooltip title="手动模式"><RadioButton value="manual"><Icon type="solution" /></RadioButton></Tooltip>
            </RadioGroup>
          </div>
        </Header>
        <Content className="main-content">
          <Card bodyStyle={{ paddingBottom: 56 }}>
            <Row>
              <Col sm={24} lg={6}>
                <InfoItem addonBefore="货主" field={movementHead.owner_name} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="移库类型" field={movementHead.total_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="原因" field={movementHead.total_alloc_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="创建时间" field={movementHead.total_picked_qty} />
              </Col>
              <Col sm={12} lg={2}>
                <InfoItem addonBefore="移库时间" field={movementHead.total_shipped_qty} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={movingStep}>
                <Step description="未完成" />
                <Step description="已完成" />
              </Steps>
            </div>
          </Card>
          <Card bodyStyle={{ padding: 0 }} style={{ marginTop: 16 }}>
            <Tabs defaultActiveKey="movementDetails" onChange={this.handleTabChange}>
              <TabPane tab="移动明细" key="movementDetails">
                <MovementDetailsPane movementNo={this.props.params.movementNo} />
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </div>
    );
  }
}
