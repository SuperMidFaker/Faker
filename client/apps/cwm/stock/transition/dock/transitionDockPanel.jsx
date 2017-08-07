import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import moment from 'moment';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hideTransitionDock } from 'common/reducers/cwmInventoryStock';
// import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import { format } from 'client/common/i18n/helpers';
import TransitPane from './tabpane/transitPane';
import LogPane from './tabpane/logPane';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    transitionDock: state.cwmInventoryStock.transitionDock,
    visible: state.cwmInventoryStock.transitionDock.visible,
  }),
  { hideTransitionDock }
)
export default class TransitionDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    transitionDock: PropTypes.object.isRequired,
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

  renderTitle = () => (
    <span>追踪号</span>
    )

  renderTabs() {
    return (
      <Tabs defaultActiveKey="transit" onChange={this.handleTabChange}>
        <TabPane tab={this.msg('库存变更')} key="transit">
          <TransitPane />
        </TabPane>
        <TabPane tab={this.msg('变更记录')} key="log">
          <LogPane />
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
