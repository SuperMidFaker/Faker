import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hideTransitionDock } from 'common/reducers/cwmTransition';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import TransitPane from './tabpane/transitPane';
import AdjustPane from './tabpane/adjustPane';
import FreezePane from './tabpane/freezePane';
import LogsPane from './tabpane/logsPane';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    detail: state.cwmTransition.transitionDock.detail,
    visible: state.cwmTransition.transitionDock.visible,
  }),
  { hideTransitionDock }
)
export default class TransitionDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    hideTransitionDock: PropTypes.func.isRequired,
  }
  state = {
  }

  componentWillUnmount() {
    this.props.hideTransitionDock();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleClose = () => {
    this.props.hideTransitionDock();
  }

  renderTitle = () => (<span>追踪ID:{this.props.detail.trace_id}</span>)
  renderTabs() {
    return (
      <Tabs defaultActiveKey="transfer">
        <TabPane tab={this.msg('库存转移')} key="transfer">
          <TransitPane />
        </TabPane>
        <TabPane tab={this.msg('数量调整')} key="adjust">
          <AdjustPane />
        </TabPane>
        <TabPane tab={this.msg('库存冻结')} key="freeze">
          <FreezePane />
        </TabPane>
        <TabPane tab={this.msg('变更记录')} key="logs">
          <LogsPane />
        </TabPane>
      </Tabs>
    );
  }
  render() {
    const { visible } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hideTransitionDock}
        title={this.renderTitle()}
      >
        {this.renderTabs()}
      </DockPanel>
    );
  }
}
