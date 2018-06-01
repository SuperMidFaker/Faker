import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Form, Layout, Tabs, Steps, Card, Col, Row, Tooltip, Radio, Button, Dropdown, Menu } from 'antd';
import { loadMovementHead, updateMovingMode } from 'common/reducers/cwmMovement';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { CWM_MOVEMENT_TYPE } from 'common/constants';
import PrintMovement from './billsPrint/printMovement';
import MovementDetailsPane from './tabpane/movementDetailsPane';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Step } = Steps;
const { TabPane } = Tabs;

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
    updateMovingMode: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    mode: 'scan',
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
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleMovingModeChange = (ev) => {
    this.setState({
      mode: ev.target.value,
    });
    this.props.updateMovingMode(this.props.params.movementNo, ev.target.value);
  }
  render() {
    const { defaultWhse, movementHead } = this.props;
    const movingStep = movementHead.isdone ? 1 : 0;
    const scanLabel = this.state.mode === 'scan' ? `${this.msg('scan')}` : '';
    const manualLabel = this.state.mode === 'manual' ? `${this.msg('manual')}` : '';
    const printMenu = (
      <Menu>
        <Menu.Item>
          <PrintMovement movementNo={this.props.params.movementNo} />
        </Menu.Item>
      </Menu>
    );
    const breadcrumb = [
      defaultWhse.name,
      this.msg('movement'),
      this.props.params.movementNo,
    ];
    if (movementHead.transaction_no) {
      breadcrumb.push(movementHead.transaction_no);
    }
    return (
      <Layout>
        <PageHeader
          breadcrumb={breadcrumb}
        >
          <PageHeader.Actions>
            <Dropdown overlay={printMenu}>
              <Button icon="printer" />
            </Dropdown>
            <RadioGroup
              value={this.state.mode}
              onChange={this.handleMovingModeChange}
              disabled={movingStep === 1}
            >
              <Tooltip title={this.msg('scan')}><RadioButton value="scan"><Icon type="scan" />{scanLabel}</RadioButton></Tooltip>
              <Tooltip title={this.msg('manual')}><RadioButton value="manual"><Icon type="solution" />{manualLabel}</RadioButton></Tooltip>
            </RadioGroup>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Card bodyStyle={{ paddingBottom: 48 }} >
            <Row>
              <Col sm={24} lg={6}>
                <InfoItem addonBefore={this.msg('ownerName')} field={movementHead.owner_name} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore={this.msg('moveType')} field={movementHead.move_type && CWM_MOVEMENT_TYPE[movementHead.move_type - 1].text} />
              </Col>
              <Col sm={12} lg={6}>
                <InfoItem addonBefore={this.msg('reason')} field={movementHead.reason} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore={this.gmsg('createdDate')} field={moment(movementHead.created_date).format('YYYY-MM-DD HH:mm')} />
              </Col>
              <Col sm={12} lg={4}>
                <InfoItem addonBefore={this.msg('completedDate')} field={movementHead.completed_date && moment(movementHead.completed_date).format('YYYY-MM-DD HH:mm')} />
              </Col>
            </Row>
            <div className="card-footer">
              <Steps progressDot current={movingStep}>
                <Step title={this.msg('undone')} />
                <Step title={this.msg('done')} />
              </Steps>
            </div>
          </Card>
          <MagicCard bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey="movementDetails" onChange={this.handleTabChange}>
              <TabPane tab={this.msg('movementDetails')} key="movementDetails">
                <MovementDetailsPane
                  movementNo={this.props.params.movementNo}
                  mode={this.state.mode}
                  movementHead={movementHead}

                />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
