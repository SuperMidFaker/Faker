import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import BasicPane from './tabpanes/basic-pane';
import DelegateTrackingPane from './tabpanes/delegateTrackingPane';
import ClearanceTrackingPane from './tabpanes/clearanceTrackingPane';
import { hidePreviewer } from 'common/reducers/cmsDelegation';

import './preview-panel.less';
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.previewer.visible,
    previewer: state.cmsDelegation.previewer,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tabKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: this.props.previewer.tabKey || 'basic',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey !== this.state.tabKey) {
      this.setState({ tabKey: nextProps.tabKey || 'basic' });
    }
  }
  handleTabChange = (tabKey) => {
    this.setState({ tabKey });
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  translateStatus(status) {
    switch (status) {
      case 0: return '待委托';
      case 1: return '委托中';
      case 2: return '未申报';
      case 3: return '已申报';
      case 4: return '已结单';
      default: return '';
    }
  }
  tablePan() {
    const { previewer } = this.props;
    const { delegation, delegateTracking } = previewer;
    if (previewer.status === 'declared'
      || previewer.status === 'finished'
      || previewer.status === 'accepted') {
      return (
        <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab="基础信息" key="basic">
            <BasicPane delegation={delegation} />
          </TabPane>
          <TabPane tab="委托追踪" key="delegateTracking">
            <DelegateTrackingPane delegateTracking={delegateTracking} />
          </TabPane>
          <TabPane tab="通关追踪" key="clearanceTracking">
            <ClearanceTrackingPane />
          </TabPane>
        </Tabs>
      );
    }
    return (
      <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
        <TabPane tab="基础信息" key="basic">
          <BasicPane delegation={delegation} />
        </TabPane>
        <TabPane tab="委托追踪" key="delegateTracking">
          <DelegateTrackingPane delegateTracking={delegateTracking} />
        </TabPane>
      </Tabs>
    );
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation } = previewer;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{delegation.delg_no}</span>
            <Tag color="blue">{this.translateStatus(delegation.status)}</Tag>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body">
            {this.tablePan()}
          </div>
        </div>
      </div>
    );
  }
}
