import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Col, Icon, Row, Tabs, Tag, Popconfirm } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { CMS_DELEGATION_STATUS } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import MdIcon from 'client/components/MdIcon';
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
    previewer: state.cmsDelgInfoHub.previewer,
    tabKey: state.cmsDelgInfoHub.tabKey,
    delgNo: state.cmsDelgInfoHub.previewer.delgNo,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus, setPreviewTabkey, openAcceptModal, showDispModal, loadBasicInfo }
)
export default class DelegationDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    delgNo: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
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
  handleAccept = () => {
    this.props.openAcceptModal({
      tenantId: this.props.tenantId,
      dispatchIds: [this.props.previewer.delgDispatch.id],
      type: 'delg',
      delg_no: this.props.previewer.delgNo,
      opt: 'accept',
    });
    this.props.setPreviewStatus({ preStatus: 'accept' });
    // this.props.hidePreviewer();
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
  renderTabs() {
    const { previewer, tabKey } = this.props;
    const { delgDispatch } = previewer;
    if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted) {
      return (
        <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="委托详情" key="basic">
            <BasicPane />
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
              <BasicPane />
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
            <BasicPane />
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
              <BasicPane />
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
            <BasicPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  renderTitle() {
    const { ietype, previewer } = this.props;
    const { delegation } = previewer;
    return ietype === 'import' ?
      <span><MdIcon mode="ikons" type="login" tagWrapped />{delegation.delg_no}</span> :
      <span><MdIcon mode="ikons" type="logout" tagWrapped />{delegation.delg_no}</span>;
  }
  renderBtns() {
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
  renderExtra() {
    const { delegation, delgDispatch } = this.props.previewer;
    return (
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
      </Row>);
  }
  render() {
    const { visible } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hidePreviewer}
        title={this.renderTitle()}
        extra={this.renderExtra()}
        alert={this.renderBtns()}
      >
        {this.renderTabs()}
        <AcceptModal />
        <DelgDispModal />
      </DockPanel>
    );
  }
}
