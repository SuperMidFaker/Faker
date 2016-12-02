import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Tabs, Badge } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import BasicPane from './tabpanes/BasicPane';
import CustomsDeclPane from './tabpanes/CustomsDeclPane';
import CiqDeclPane from './tabpanes/CiqDeclPane';
import CertsPane from './tabpanes/CertsPane';
import DutyTaxPane from './tabpanes/DutyTaxPane';
import ExpensesPane from './tabpanes/ExpensesPane';
import DelegateTrackingPane from './tabpanes/delegateTrackingPane';
import { hidePreviewer, setPreviewStatus, setPreviewTabkey } from 'common/reducers/cmsDelegation';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cmsDelegation.previewer.visible,
    previewer: state.cmsDelegation.previewer,
    tabKey: state.cmsDelegation.previewer.tabKey,
    delgPanel: state.cmsDelegation.delgPanel,
    ciqdecl: state.cmsDeclare.previewer.ciqdecl,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus, setPreviewTabkey }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    ciqdecl: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
    setPreviewTabkey: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleTabChange = (tabKey) => {
    this.props.setPreviewTabkey(tabKey);
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
  handleCiqDisp = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqdispatch' });
    this.props.hidePreviewer();
  }
  handleAssignAll = () => {
    this.props.setPreviewStatus({ preStatus: 'assignAll' });
    this.props.hidePreviewer();
  }
  handleDispAllCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'allDispCancel' });
    this.props.hidePreviewer();
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'delgDispCancel' });
    this.props.hidePreviewer();
  }
  handleCiqDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqDispCancel' });
    this.props.hidePreviewer();
  }
  handleView = () => {
    this.props.setPreviewStatus({ preStatus: 'view' });
    this.props.hidePreviewer();
  }
  handleCiqFinish = () => {
    this.props.setPreviewStatus({ preStatus: 'ciqfinish' });
    this.props.hidePreviewer();
  }
  translateStatus(delg) {
    const status = delg.status;
    const tenantid = delg.recv_tenant_id;
    switch (status) {
      case 0:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="default" text="待接单" />;
          } else {
            return <Badge status="default" text="待供应商接单" />;
          }
        }
      case 1:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="default" text="已接单" />;
          } else {
            return <Badge status="default" text="供应商已接单" />;
          }
        }
      case 2:
        {
          if (tenantid === this.props.tenantId) {
            return <Badge status="warning" text="制单中" />;
          } else {
            return <Badge status="warning" text="供应商制单中" />;
          }
        }
      case 3:
        {
          if (delg.sub_status === 1) {
            return <Badge status="processing" text="部分申报" />;
          } else {
            return <Badge status="processing" text="已申报" />;
          }
        }
      case 4:
        {
          if (delg.sub_status === 1) {
            return <Badge status="success" text="部分放行" />;
          } else {
            return <Badge status="success" text="已放行" />;
          }
        }
      default: return '';
    }
  }
  tablePan() {
    const { previewer, tabKey } = this.props;
    const { delegation, files, delegateTracking } = previewer;
    if (delegation.status === 0) {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="日志" key="delegateTracking">
            <DelegateTrackingPane delegateTracking={delegateTracking} />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === 1 || delegation.status === 2) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="委托" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="鉴定办证" key="certs">
              <CertsPane />
            </TabPane>
            <TabPane tab="计费" key="expenses">
              <ExpensesPane />
            </TabPane>
            <TabPane tab="日志" key="delegateTracking">
              <DelegateTrackingPane delegateTracking={delegateTracking} />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
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
            <CertsPane />
          </TabPane>
          <TabPane tab="计费" key="expenses">
            <ExpensesPane />
          </TabPane>
          <TabPane tab="日志" key="delegateTracking">
            <DelegateTrackingPane delegateTracking={delegateTracking} />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === 3 || delegation.status === 4) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="委托" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="鉴定办证" key="certs">
              <CertsPane />
            </TabPane>
            <TabPane tab="缴税" key="taxes">
              <DutyTaxPane />
            </TabPane>
            <TabPane tab="计费" key="expenses">
              <ExpensesPane />
            </TabPane>
            <TabPane tab="日志" key="delegateTracking">
              <DelegateTrackingPane delegateTracking={delegateTracking} />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
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
            <CertsPane />
          </TabPane>
          <TabPane tab="缴税" key="taxes">
            <DutyTaxPane />
          </TabPane>
          <TabPane tab="计费" key="expenses">
            <ExpensesPane />
          </TabPane>
          <TabPane tab="日志" key="delegateTracking">
            <DelegateTrackingPane delegateTracking={delegateTracking} />
          </TabPane>
        </Tabs>
      );
    }
  }
  button() {
    const { previewer, tabKey, ciqdecl, delgPanel } = this.props;
    if (tabKey === 'basic') {
      if (previewer.delegation.btkey === 'recall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleDispAllCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (previewer.delegation.btkey === 'assign') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="ghost" onClick={this.handleAssignAll}>
              转包
            </Button>
          </PrivilegeCover>
        );
      }
    } else if (tabKey === 'customsDecl') {
      if (delgPanel.btkey === 'delgDispMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="primary" onClick={this.handleMake}>
                制单
              </Button>
              <span />
              <Button type="ghost" onClick={this.handleDisp}>
                指定报关单位
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgRecall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleDispCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgRecallMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="default" onClick={this.handleDispCancel}>
                撤回
              </Button>
              <span />
              <Button type="ghost" onClick={this.handleMake}>
                制单
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgMake') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="ghost" onClick={this.handleMake}>
                制单
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (delgPanel.btkey === 'delgView') {
        return (
          <div className="btn-bar">
            <Button type="ghost" onClick={this.handleView}>
            查看
            </Button>
          </div>
        );
      }
    } else if (tabKey === 'ciqDecl') {
      if (ciqdecl.btkey === 'ciqDispFinish') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="create">
            <div className="btn-bar">
              <Button type="ghost" onClick={this.handleCiqDisp}>
                指定报检单位
              </Button>
              <span />
              <Button type="primary" onClick={this.handleCiqFinish}>
                完成
              </Button>
            </div>
          </PrivilegeCover>
        );
      } else if (ciqdecl.btkey === 'ciqRecall') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleCiqDispCancel}>
              撤回
            </Button>
          </PrivilegeCover>
        );
      } else if (ciqdecl.btkey === 'ciqRecallFinish') {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <div className="btn-bar">
              <Button type="default" onClick={this.handleCiqDispCancel}>
                撤回
              </Button>
              <span />
              <Button type="primary" onClick={this.handleCiqFinish}>
                完成
              </Button>
            </div>
          </PrivilegeCover>
        );
      }
    }
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation, delegateTracking } = previewer;
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
            {this.translateStatus(delegateTracking)}
            <div className="toolbar">
              {this.button()}
            </div>
            {closer}
          </div>
          <div className="body">
            {this.tablePan()}
          </div>
        </div>
      </div>
    );
  }
}
