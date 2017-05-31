import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Col, Icon, Row, Tabs, Tag, Popconfirm, message } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { CMS_DELEGATION_STATUS, CMS_DELEGATION_MANIFEST } from 'common/constants';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import BasicPane from './tabpanes/BasicPane';
import CustomsDeclPane from './tabpanes/CustomsDeclPane';
import CiqDeclPane from './tabpanes/CiqDeclPane';
import DutyTaxPane from './tabpanes/DutyTaxPane';
import ExpensesPane from './tabpanes/ExpensesPane';
import ActivityLoggerPane from './tabpanes/ActivityLoggerPane';
import DelgDispModal from './delgDispModal';
import { showDispModal, acceptDelg, reloadDelegationList } from 'common/reducers/cmsDelegation';
import { setPreviewStatus, hidePreviewer, setPreviewTabkey, loadBasicInfo, getShipmtOrderNo } from 'common/reducers/cmsDelgInfoHub';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import OperatorsPopover from 'client/common/operatorsPopover';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cmsDelgInfoHub.previewer.visible,
    previewLoading: state.cmsDelgInfoHub.basicPreviewLoading,
    previewer: state.cmsDelgInfoHub.previewer,
    tabKey: state.cmsDelgInfoHub.tabKey,
    previewKey: state.cmsDelgInfoHub.previewKey,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
    operators: state.crmCustomers.operators,
    partnerId: state.cmsDelgInfoHub.previewer.delgDispatch.send_partner_id,
  }),
  { hidePreviewer, setPreviewStatus, setPreviewTabkey, showDispModal, loadBasicInfo, loadOrderDetail, getShipmtOrderNo, acceptDelg, reloadDelegationList }
)
export default class DelegationDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    previewKey: PropTypes.string,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.previewKey !== this.props.previewKey) {
      nextProps.loadBasicInfo(this.props.tenantId, nextProps.previewKey, nextProps.tabKey);
    }
  }
  componentWillUnmount() {
    this.props.hidePreviewer();
  }
  handleTabChange = (tabKey) => {
    this.props.setPreviewTabkey(tabKey);
  }
  handleAssign = () => {
    this.props.showDispModal(this.props.previewer.delegation.delg_no, this.props.tenantId);
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'delgDispCancel' });
  }
  handleDelegationAccept = (record, lid, name) => {
    this.props.acceptDelg(
      lid, name, [this.props.previewer.delgDispatch.id], this.props.previewer.delegation.delg_no
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadBasicInfo(this.props.tenantId, this.props.previewKey, this.props.tabKey);
        this.props.reloadDelegationList();
      }
    });
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
  goHomeDock = () => {
    const { previewer } = this.props;
    this.props.getShipmtOrderNo(previewer.delegation.instance_uuid).then(
      (result) => {
        this.props.loadOrderDetail(result.data.order_no, this.props.tenantId);
        this.props.hidePreviewer();
      }
    );
  }
  renderTabs() {
    const { previewer, tabKey } = this.props;
    const { delgDispatch, delegation } = previewer;
    if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted) {
      return (
        <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="详情" key="basic">
            <BasicPane />
          </TabPane>
          <TabPane tab="操作" key="activity">
            <ActivityLoggerPane />
          </TabPane>
        </Tabs>
      );
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.accepted ||
      (delgDispatch.status === CMS_DELEGATION_STATUS.processing && delegation.manifested !== CMS_DELEGATION_MANIFEST.manifested) ||
      (delgDispatch.status >= CMS_DELEGATION_STATUS.processing && (delegation.decl_way_code === 'IBND' || delegation.decl_way_code === 'EBND'))) {
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
            <TabPane tab="详情" key="basic">
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
          <TabPane tab="详情" key="basic">
            <BasicPane />
          </TabPane>
        </Tabs>
      );
    } else if (delgDispatch.status > CMS_DELEGATION_STATUS.processing ||
      (delgDispatch.status === CMS_DELEGATION_STATUS.processing && delegation.manifested === CMS_DELEGATION_MANIFEST.manifested) &&
        delegation.decl_way_code !== 'IBND' && delegation.decl_way_code !== 'EBND') {
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
            <TabPane tab="详情" key="basic">
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
          <TabPane tab="详情" key="basic">
            <BasicPane />
          </TabPane>
        </Tabs>
      );
    }
  }
  renderTitle = () => {
    const { previewer } = this.props;
    const { delegation } = previewer;
    const button = delegation.instance_uuid ? <Button shape="circle" icon="home" onClick={this.goHomeDock} /> : '';
    return (
      <span>{button}<span>{delegation.delg_no}</span></span>
    );
  }
  renderBtns() {
    const { previewer, partnerId } = this.props;
    const { delgDispatch } = previewer;
    if (delgDispatch.recv_tenant_id === delgDispatch.customs_tenant_id) {
      if (delgDispatch.status === CMS_DELEGATION_STATUS.unaccepted) {
        return (
          <PrivilegeCover module="clearance" feature={this.props.ietype} action="edit">
            <OperatorsPopover module="delegation" partnerId={partnerId} handleAccept={this.handleDelegationAccept} />
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
          <InfoItem label="订单号"
            field={delegation.order_no}
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
    const { visible, previewLoading } = this.props;
    return (
      <DockPanel size="large" visible={visible} onClose={this.props.hidePreviewer}
        title={this.renderTitle()}
        extra={this.renderExtra()}
        alert={this.renderBtns()}
        loading={previewLoading}
      >
        {this.renderTabs()}
        <DelgDispModal />
      </DockPanel>
    );
  }
}
