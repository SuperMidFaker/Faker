import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Breadcrumb, Icon, Form, Layout, Tabs, Steps, Card, Col, Row, Tooltip, Radio } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import MovementDetailsPane from './tabpane/movementDetailsPane';
import { loadMovementHead, updateMovingMode } from 'common/reducers/cwmMovement';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

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
    tenantName: state.account.tenantName,
    defaultWhse: state.cwmContext.defaultWhse,
    movementHead: state.cwmMovement.movementHead,
    reload: state.cwmMovement.movementReload,
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
    mode: 'scan',
    fullscreen: true,
  }
  componentWillMount() {
    this.props.loadMovementHead(this.props.params.movementNo).then((result) => {
      if (!result.error) {
        this.setState({
          mode: result.data.moving_mode,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadMovementHead(this.props.params.movementNo);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleMovingModeChange = (ev) => {
    this.setState({
      mode: ev.target.value,
    });
    this.props.updateMovingMode(this.props.params.movementNo, ev.target.value);
  }
  render() {
    const { defaultWhse, movementHead } = this.props;
    const movingStep = movementHead.isdone ? 1 : 0;
    const scanLabel = this.state.mode === 'scan' ? ' 扫码模式' : '';
    const manualLabel = this.state.mode === 'manual' ? ' 手动模式' : '';
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
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
          </PageHeader.Title>
          <PageHeader.Actions>
            <RadioGroup value={this.state.mode} onChange={this.handleMovingModeChange} disabled={movingStep === 1}>
              <Tooltip title="扫码模式"><RadioButton value="scan"><Icon type="scan" />{scanLabel}</RadioButton></Tooltip>
              <Tooltip title="手动模式"><RadioButton value="manual"><Icon type="solution" />{manualLabel}</RadioButton></Tooltip>
            </RadioGroup>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ paddingBottom: 48 }} noHovering>
            <Row>
              <Col sm={24} lg={6}>
                <InfoItem addonBefore="货主" field={movementHead.owner_name} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore="库存移动类型" field={movementHead.move_type} />
              </Col>
              <Col sm={12} lg={6}>
                <InfoItem addonBefore="原因" field={movementHead.reason} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore="创建时间" field={moment(movementHead.created_date).format('YYYY-MM-DD HH:mm')} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore="库存移动时间" field={movementHead.completed_date && moment(movementHead.completed_date).format('YYYY-MM-DD HH:mm')} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={movingStep}>
                <Step title="未完成" />
                <Step title="已完成" />
              </Steps>
            </div>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }} noHovering onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="movementDetails" onChange={this.handleTabChange}>
              <TabPane tab="移动明细" key="movementDetails">
                <MovementDetailsPane movementNo={this.props.params.movementNo} mode={this.state.mode} movementHead={movementHead} fullscreen={this.state.fullscreen} />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
