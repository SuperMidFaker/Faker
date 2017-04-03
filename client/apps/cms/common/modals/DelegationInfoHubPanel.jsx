import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Spin, Badge, Button, Col, Dropdown, Icon, Menu, Row, Tabs, Tag, Popconfirm } from 'antd';
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
import AcceptModal from './acceptModal';
import DelgDispModal from './delgDispModal';
import { openAcceptModal, showDispModal } from 'common/reducers/cmsDelegation';
import { setPreviewStatus, hidePreviewer, setPreviewTabkey, loadBasicInfo } from 'common/reducers/cmsDelgInfoHub';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cmsDelgInfoHub.previewer.visible,
    basicSpinning: state.cmsDelgInfoHub.basicPreviewLoading,
    previewer: state.cmsDelgInfoHub.previewer,
    tabKey: state.cmsDelgInfoHub.tabKey,
    delgNo: state.cmsDelgInfoHub.previewer.delgNo,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus, setPreviewTabkey, openAcceptModal, showDispModal, loadBasicInfo }
)
export default class DelegationInfoHubPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    delgNo: PropTypes.string,
    basicSpinning: PropTypes.bool.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.delgNo !== this.props.delgNo) {
      nextProps.loadBasicInfo(
        this.props.tenantId,
        nextProps.delgNo,
        nextProps.tabKey,
      );
    }
  }
  handleTabChange = (tabKey) => {
    this.props.setPreviewTabkey(tabKey);
  }
  handleClose = () => {
    this.props.hidePreviewer();
  }
  handleAccept = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.previewer.delgDispatch.id],
      type: 'delg',
      delg_no: this.props.previewer.delgNo,
      opt: 'accept',
    });
    this.props.setPreviewStatus({ preStatus: 'accept' });
    this.props.hidePreviewer();
  }
  handleMake = () => {
    this.props.setPreviewStatus({ preStatus: 'make' });
    this.props.hidePreviewer();
  }
  handleAssign = () => {
    this.props.showDispModal(this.props.previewer.delgNo, this.props.tenantId);
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'delgDispCancel' });
  }
  translateStatus(delegation, delgDispatch) {
    let status = delgDispatch.status;
    if (delgDispatch.status === 1 && delgDispatch.sub_status === 0) {
      status = 0;
    }
    let ciqTag = '';
    if (delegation.ciq_inspect === 'NL') {
      ciqTag = <Tag color="cyan">包装检疫</Tag>;
    } else if (delegation.ciq_inspect === 'LA' || delegation.ciq_inspect === 'LB') {
      ciqTag = <Tag color="orange">法定检验</Tag>;
    }
    switch (status) {
      case CMS_DELEGATION_STATUS.unaccepted:
        {
          if (delgDispatch.recv_tenant_id === delgDispatch.customs_tenant_id) {
            return <span><Badge status="default" text="待接单" /> {ciqTag}</span>;
          } else {
            return <span><Badge status="default" text="待供应商接单" /> {ciqTag}</span>;
          }
        }
      case CMS_DELEGATION_STATUS.accepted:
        {
          if (delgDispatch.recv_tenant_id === delgDispatch.customs_tenant_id) {
            return <span><Badge status="default" text="已接单" /> {ciqTag}</span>;
          } else {
            return <span><Badge status="default" text="供应商已接单" /> {ciqTag}</span>;
          }
        }
      case CMS_DELEGATION_STATUS.processing:
        {
          if (delgDispatch.recv_tenant_id === delgDispatch.customs_tenant_id) {
            return <span><Badge status="warning" text="制单中" /> {ciqTag}</span>;
          } else {
            return <span><Badge status="warning" text="供应商制单中" /> {ciqTag}</span>;
          }
        }
      case CMS_DELEGATION_STATUS.declaring:
        {
          if (delgDispatch.sub_status === 1) {
            return <span><Badge status="processing" text="部分申报" /> {ciqTag}</span>;
          } else {
            return <span><Badge status="processing" text="已申报" /> {ciqTag}</span>;
          }
        }
      case CMS_DELEGATION_STATUS.released:
        {
          if (delgDispatch.sub_status === 1) {
            return <span><Badge status="success" text="部分放行" /> {ciqTag}</span>;
          } else {
            return <span><Badge status="success" text="已放行" /> {ciqTag}</span>;
          }
        }
      default: return '';
    }
  }
  infoTabs() {
    const { previewer, tabKey } = this.props;
    const { delegation, delgDispatch, files } = previewer;
    if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted) {
      return (
        <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane delegation={delegation} files={files} />
          </TabPane>
          <TabPane tab="操作" key="activity">
            <ActivityLoggerPane />
          </TabPane>
        </Tabs>
      );
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.accepted || delgDispatch.status === CMS_DELEGATION_STATUS.processing) {
      if (delgDispatch.recv_services.indexOf('ciq') === -1) {
        return (
          <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="操作" key="activity">
              <ActivityLoggerPane />
            </TabPane>
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
        <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="操作" key="activity">
            <ActivityLoggerPane />
          </TabPane>
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
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.declaring || delgDispatch.status === CMS_DELEGATION_STATUS.released) {
      if (delgDispatch.recv_services.indexOf('ciq') === -1) {
        return (
          <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
            <TabPane tab="操作" key="activity">
              <ActivityLoggerPane />
            </TabPane>
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
        <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="操作" key="activity">
            <ActivityLoggerPane />
          </TabPane>
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
    const { previewer } = this.props;
    const { delgDispatch } = previewer;
    if (delgDispatch.recv_tenant_id === delgDispatch.customs_tenant_id) {
      if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="primary" onClick={this.handleAccept}>
              接单
            </Button>
          </PrivilegeCover>
        );
      } else if (delgDispatch.status === CMS_DELEGATION_STATUS.accepted) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleAssign}>
              分配
            </Button>
          </PrivilegeCover>
        );
      } else if (delgDispatch.status === CMS_DELEGATION_STATUS.released) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Button type="default" onClick={this.handleCompleteDelg}>
              结单
            </Button>
          </PrivilegeCover>
        );
      }
    } else if (delgDispatch.customs_tenant_id === -1) {
      if (delgDispatch.sub_status === CMS_DELEGATION_STATUS.accepted &&
        delgDispatch.status === CMS_DELEGATION_STATUS.accepted) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <Popconfirm title="你确定撤回分配吗?" onConfirm={this.handleDispCancel} >
              <Button type="ghost">撤回</Button>
            </Popconfirm>
          </PrivilegeCover>
        );
      }
    } else if (delgDispatch.sub_status === CMS_DELEGATION_STATUS.unaccepted &&
        delgDispatch.status === CMS_DELEGATION_STATUS.accepted) {
      return (
        <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
          <Popconfirm title="你确定撤回分配吗?" onConfirm={this.handleDispCancel} >
            <Button type="ghost">撤回</Button>
          </Popconfirm>
        </PrivilegeCover>
      );
    }
  }
  render() {
    const { visible, previewer, basicSpinning } = this.props;
    const { delegation, delgDispatch } = previewer;
    const menu = (
      <Menu>
        <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
        <Menu.Item key="delete" className="mdc-text-red"><Icon type="delete" /> 删除</Menu.Item>
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
      <div className={`dock-panel dock-panel-lg ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <Spin spinning={basicSpinning}>
            <div className="header">
              <span className="title">{delegation.delg_no}</span>
              {this.translateStatus(delegation, delgDispatch)}
              <div className="toolbar-right">
                {this.delgBtns()}
                <Dropdown overlay={menu}>
                  <Button><Icon type="ellipsis" /></Button>
                </Dropdown>
                {closer}
              </div>
              <Row>
                <Col span="8">
                  <InfoItem label="委托方"
                    field={delgDispatch.send_name}
                  />
                </Col>
                <Col span="6">
                  <InfoItem label="提运单号"
                    field={delegation.bl_wb_no}
                  />
                </Col>
                <Col span="6">
                  <InfoItem label="发票号"
                    field={delegation.invoice_no}
                  />
                </Col>
                <Col span="4">
                  <InfoItem label="委托日期" addonBefore={<Icon type="calendar" />}
                    field={moment(delgDispatch.delg_time).format('YYYY.MM.DD')}
                  />
                </Col>
              </Row>
            </div>
          </Spin>
          <div className="body with-header-summary">
            {this.infoTabs()}
          </div>
        </div>
        <AcceptModal />
        <DelgDispModal />
      </div>
    );
  }
}
