import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tabs, Badge } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BasicPane from './tabpanes/basic-pane';
import CustomsDeclPane from './tabpanes/CustomsDeclPane';
import CiqDeclPane from './tabpanes/CiqDeclPane';
import ExpensePane from './tabpanes/expensePane';
import DelegateTrackingPane from './tabpanes/delegateTrackingPane';
import ClearanceTrackingPane from './tabpanes/clearanceTrackingPane';
import { hidePreviewer, setPreviewStatus } from 'common/reducers/cmsDelegation';
import downloadMultiple from 'client/util/multipleDownloader';

const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

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
          if (source === 1) return <Badge status="default" text="待接单" />;
          if (source === 2) return <Badge status="default" text="待供应商接单" />;
          break;
        }
      case 1:
        {
          if (source === 1) return <Badge status="default" text="已接单" />;
          if (source === 2) return <Badge status="default" text="供应商已接单" />;
          break;
        }
      case 2:
        {
          if (source === 1) return <Badge status="warning" text="制单中" />;
          if (source === 2) return <Badge status="warning" text="供应商制单中" />;
          break;
        }
      case 3: return <Badge status="processing" text="已申报" />;
      case 4: return <Badge status="success" text="已放行" />;
      default: return '';
    }
  }
  tablePan() {
    const { previewer } = this.props;
    const { delegation, files, delegateTracking } = previewer;
    if (previewer.status === 3 || previewer.status === 4) {
      return (
        <Tabs type="card" activeKey={this.state.tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="报关" key="customsDecl">
            <CustomsDeclPane />
          </TabPane>
          <TabPane tab="报检" key="ciqDecl">
            <CiqDeclPane />
          </TabPane>
          <TabPane tab="鉴定办证" key="certs">
            <ExpensePane />
          </TabPane>
          <TabPane tab="缴税" key="taxes">
            <ExpensePane />
          </TabPane>
          <TabPane tab="计费" key="expenses">
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
      <Tabs type="card" activeKey={this.state.tabKey} onChange={this.handleTabChange}>
        <TabPane tab="业务信息" key="basic">
          <BasicPane delegation={delegation} files={files} />
        </TabPane>
        <TabPane tab="报关" key="customsDecl">
          <CustomsDeclPane />
        </TabPane>
        <TabPane tab="报检" key="ciqDecl">
          <CiqDeclPane />
        </TabPane>
        <TabPane tab="鉴定办证" key="certs">
          <ExpensePane />
        </TabPane>
        <TabPane tab="缴税" key="taxes">
          <ExpensePane />
        </TabPane>
        <TabPane tab="计费" key="expenses">
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
          <Button type="ghost" onClick={this.handleAccept}>
            接单
          </Button>
        </PrivilegeCover>
      );
    } else if (previewer.status === 0 && delegation.source === 2) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <ButtonGroup>
            <Button type="default" onClick={this.handleDispCancel}>
              撤回
            </Button>
            <Button type="ghost" onClick={this.handleFilesDownload}>
              <Icon type="download" />
            </Button>
          </ButtonGroup>
        </PrivilegeCover>
      );
    } else if (previewer.status === 1 && delegation.source === 1) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
          <ButtonGroup>
            <Button type="ghost" onClick={this.handleMake}>
              制单
            </Button>
            <Button type="ghost" onClick={this.handleDisp}>
              分配
            </Button>
            <Button type="ghost" onClick={this.handleFilesDownload}>
              <Icon type="download" />
            </Button>
          </ButtonGroup>
        </PrivilegeCover>
      );
    } else if (previewer.status === 2 && delegation.source === 1) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
          <ButtonGroup>
            <Button type="ghost" onClick={this.handleMake}>
              制单
            </Button>
            <Button type="ghost" onClick={this.handleFilesDownload}>
              <Icon type="download" />
            </Button>
          </ButtonGroup>
        </PrivilegeCover>
      );
    } else {
      return (
        <ButtonGroup>
          <Button type="ghost" onClick={this.handleView}>
          查看
          </Button>
          <Button type="ghost" onClick={this.handleFilesDownload}>
            <Icon type="download" />
          </Button>
        </ButtonGroup>
      );
    }
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation } = previewer;
    const closer = (
      <button
        onClick={this.handleClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{delegation.delg_no}</span>
            {this.translateStatus(delegation.status, delegation.source)}
            <div className="pull-right">
              <div className="toolbar">
                {this.state.tabKey === 'basic' && this.button()}
              </div>
              {closer}
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
