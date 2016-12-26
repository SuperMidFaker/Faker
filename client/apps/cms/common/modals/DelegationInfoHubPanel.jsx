import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Col, Dropdown, Icon, Menu, Row, Tabs } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { CMS_DELEGATION_STATUS } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import BasicPane from './tabpanes/BasicPane';
import CustomsDeclPane from './tabpanes/CustomsDeclPane';
import CiqDeclPane from './tabpanes/CiqDeclPane';
import DutyTaxPane from './tabpanes/DutyTaxPane';
import ExpensesPane from './tabpanes/ExpensesPane';
import ActivityLoggerPane from './tabpanes/ActivityLoggerPane';
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
export default class DelegationInfoHubPanel extends React.Component {
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
    const { tenantId } = this.props;
    const status = delg.status;
    const tenantid = delg.recv_tenant_id;
    switch (status) {
      case 0:
        {
          if (tenantid === tenantId) {
            return <Badge status="default" text="待接单" />;
          } else {
            return <Badge status="default" text="待供应商接单" />;
          }
        }
      case 1:
        {
          if (tenantid === tenantId) {
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
  infoTabs() {
    const { previewer, tabKey } = this.props;
    const { delegation, files } = previewer;
    if (delegation.status === CMS_DELEGATION_STATUS.unaccepted) {
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === CMS_DELEGATION_STATUS.accepted || delegation.status === CMS_DELEGATION_STATUS.processing) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="费用" key="expenses">
              <ExpensesPane />
            </TabPane>
            <TabPane tab="委托详情" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="报关" key="customsDecl">
            <CustomsDeclPane />
          </TabPane>
          <TabPane tab="报检" key="ciqDecl">
            <CiqDeclPane />
          </TabPane>
          <TabPane tab="费用" key="expenses">
            <ExpensesPane />
          </TabPane>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
        </Tabs>
      );
    } else if (delegation.status === CMS_DELEGATION_STATUS.declaring || delegation.status === CMS_DELEGATION_STATUS.released) {
      if (delegation.ciq_type === 'NA') {
        return (
          <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="报关" key="customsDecl">
              <CustomsDeclPane />
            </TabPane>
            <TabPane tab="缴税" key="taxes">
              <DutyTaxPane />
            </TabPane>
            <TabPane tab="费用" key="expenses">
              <ExpensesPane />
            </TabPane>
            <TabPane tab="委托详情" key="basic">
              <BasicPane delegation={delegation} files={files} />
            </TabPane>
          </Tabs>
        );
      }
      return (
        <Tabs type="card" activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="报关" key="customsDecl">
            <CustomsDeclPane />
          </TabPane>
          <TabPane tab="报检" key="ciqDecl">
            <CiqDeclPane />
          </TabPane>
          <TabPane tab="缴税" key="taxes">
            <DutyTaxPane />
          </TabPane>
          <TabPane tab="费用" key="expenses">
            <ExpensesPane />
          </TabPane>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
        </Tabs>
      );
    }
  }

  delgBtns() {
    const { previewer, tenantId } = this.props;
    const { delgDispatch } = previewer;
    if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted && delgDispatch.recv_tenant_id === tenantId) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button type="primary" onClick={this.handleDispAllCancel}>
            接单
          </Button>
        </PrivilegeCover>
      );
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted && delgDispatch.send_tenant_id === tenantId) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button type="ghost" onClick={this.handleDispAllCancel}>
            撤回
          </Button>
        </PrivilegeCover>
      );
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.accepted && delgDispatch.recv_tenant_id === tenantId) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button type="default" onClick={this.handleAssignAll}>
            分配
          </Button>
        </PrivilegeCover>
      );
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.released && delgDispatch.send_tenant_id === tenantId) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Button type="default" onClick={this.handleCompleteDelg}>
            结单
          </Button>
        </PrivilegeCover>
      );
    }
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation, delgDispatch } = previewer;
    const menu = (
      <Menu>
        <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
        <Menu.Item key="delete"><Icon type="delete" /> 删除(不可恢复)</Menu.Item>
      </Menu>
    );
    const closer = (
      <button
        onClick={this.handleClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel info-hub-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{delegation.delg_no}</span>
            {this.translateStatus(delgDispatch)}
            <div className="toolbar-right">
              {this.delgBtns()}
              <Dropdown overlay={menu}>
                <Button><Icon type="ellipsis" /></Button>
              </Dropdown>
              {closer}
            </div>
            <Row>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="委托方"
                  field={delegation.customer_name} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="6">
                <InfoItem labelCol={{ span: 3 }} label="提运单号"
                  field={delegation.bl_wb_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="订单号"
                  field={delegation.order_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="发票号"
                  field={delegation.invoice_no} fieldCol={{ span: 9 }}
                />
              </Col>
              <Col span="4">
                <InfoItem labelCol={{ span: 3 }} label="委托日期" fieldCol={{ span: 9 }}
                  field={moment(delgDispatch.delg_time).format('YYYY.MM.DD')}
                />
              </Col>
            </Row>
          </div>
          <div className="body with-header-summary">
            <Row gutter={16}>
              <Col sm={24} md={12} lg={12}>
                {this.infoTabs()}
              </Col>
              <Col sm={24} md={12} lg={12}>
                <ActivityLoggerPane />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
