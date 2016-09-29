import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BasicPane from './tabpanes/basic-pane';
import ExpensePane from './tabpanes/expensePane';
import DelegateTrackingPane from './tabpanes/delegateTrackingPane';
import ClearanceTrackingPane from './tabpanes/clearanceTrackingPane';
import { hidePreviewer, setPreviewStatus } from 'common/reducers/cmsDelegation';
import downloadMultiple from 'client/util/multipleDownloader';
import './preview-panel.less';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.previewer.visible,
    previewer: state.cmsDelegation.previewer,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tabKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
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
  handleAccept = () => {
    this.props.setPreviewStatus({ preStatus: 'accept' });
  }
  handleMake = () => {
    this.props.setPreviewStatus({ preStatus: 'make' });
    this.props.hidePreviewer();
  }
  handleDisp = () => {
    this.props.setPreviewStatus({ preStatus: 'dispatch' });
    this.props.hidePreviewer();
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'dispCancel' });
    this.props.hidePreviewer();
  }
  handleView = () => {
    this.props.setPreviewStatus({ preStatus: 'view' });
    this.props.hidePreviewer();
  }
  handleFilesDownload = () => {
    const { previewer } = this.props;
    downloadMultiple(previewer.files);
  }
  translateStatus(status, source) {
    switch (status) {
      case 0:
        {
          if (source === 1) return '待接单';
          if (source === 2) return '待供应商接单';
          break;
        }
      case 1:
        {
          if (source === 1) return '已接单';
          if (source === 2) return '供应商已接单';
          break;
        }
      case 2:
        {
          if (source === 1) return '制单中';
          if (source === 2) return '供应商制单中';
          break;
        }
      case 3: return '已申报';
      case 4: return '已结单';
      default: return '';
    }
  }
  tablePan() {
    const { previewer } = this.props;
    const { delegation, files, delegateTracking } = previewer;
    if (previewer.status === 3 || previewer.status === 4) {
      return (
        <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="费用" key="expenses">
            <ExpensePane />
          </TabPane>
          <TabPane tab="通关追踪" key="clearanceTracking">
            <ClearanceTrackingPane />
          </TabPane>
          <TabPane tab="日志" key="delegateTracking">
            <DelegateTrackingPane delegateTracking={delegateTracking} />
          </TabPane>
        </Tabs>
      );
    }
    return (
      <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
        <TabPane tab="委托" key="basic">
          <BasicPane delegation={delegation} files={files} />
        </TabPane>
        <TabPane tab="费用" key="expenses">
          <ExpensePane />
        </TabPane>
        <TabPane tab="日志" key="delegateTracking">
          <DelegateTrackingPane delegateTracking={delegateTracking} />
        </TabPane>
      </Tabs>
    );
  }
  button() {
    const { previewer } = this.props;
    const { delegation } = previewer;
    if (previewer.status === 0 && delegation.source === 1) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button size="large" type="primary" onClick={this.handleAccept}>
            接单
          </Button>
        </PrivilegeCover>
      );
    } else if (previewer.status === 0 && delegation.source === 2) {
      return (
        <div>
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button size="large" type="default" style={{ marginRight: 20 }}
              onClick={this.handleDispCancel}
            >
              撤回
            </Button>
          </PrivilegeCover>
          <Button id="dlbutton" size="large" onClick={this.handleFilesDownload}>
            <Icon type="download" />
          </Button>
        </div>
      );
    } else if (previewer.status === 1 && delegation.source === 1) {
      return (
        <div>
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <Button size="large" type="primary" style={{ marginRight: 20 }} onClick={this.handleMake}>
              制单
            </Button>
          </PrivilegeCover>
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <Button size="large" type="ghost" style={{ marginRight: 20 }} onClick={this.handleDisp}>
              分配
            </Button>
          </PrivilegeCover>
          <Button id="dlbutton" size="large" onClick={this.handleFilesDownload}>
            <Icon type="download" />
          </Button>
        </div>
      );
    } else if (previewer.status === 2 && delegation.source === 1) {
      return (
        <div>
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <Button size="large" type="primary" style={{ marginRight: 20 }} onClick={this.handleMake}>
              制单
            </Button>
          </PrivilegeCover>
          <Button id="dlbutton" size="large" onClick={this.handleFilesDownload}>
            <Icon type="download" />
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button size="large" type="primary" onClick={this.handleView}>
          查看
          </Button>
          <Button id="dlbutton" size="large" onClick={this.handleFilesDownload}>
            <Icon type="download" />
          </Button>
        </div>
      );
    }
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation } = previewer;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{delegation.delg_no}</span>
            <Tag color="blue">{this.translateStatus(delegation.status, delegation.source)}</Tag>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body">
            {this.tablePan()}
          </div>
          {this.state.tabKey === 'basic' &&
            <div className="footer">
              {this.button()}
            </div>
          }
        </div>
      </div>
    );
  }
}
