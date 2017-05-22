import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Badge, Form, Breadcrumb, Button, Icon, Layout, Tabs, Tooltip, message, Popconfirm, Spin, Dropdown, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { loadEntry, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal } from 'common/reducers/cmsDeclare';
import NavLink from 'client/components/nav-link';
import ButtonToggle from 'client/components/ButtonToggle';
import SheetHeadPanel from './panel/cdfHeadPanel';
import SheetBodyPanel from './panel/cdfBodyPanel';
import SheetExtraPanel from './panel/cdfExtraPanel';
import DeclReleasedModal from './modals/declReleasedModal';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';
import SendModal from './modals/sendModal';
import LegalInspectionPanel from './panel/legaInspectionPanel';

const formatMsg = format(messages);
const { Sider, Header, Content } = Layout;
const TabPane = Tabs.TabPane;
const navObj = {
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
};

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
    tenantId: state.account.tenantId,
  }),
  { saveEntryHead, loadEntry, deleteDecl, setDeclReviewed, openDeclReleasedModal, showSendDeclModal, setNavTitle }
)
@connectNav(navObj)
@Form.create()
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
    declSpinning: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
    collapsed: true,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.preEntrySeqNo !== this.props.params.preEntrySeqNo) {
      this.props.loadEntry(nextProps.params.billseqno, nextProps.params.preEntrySeqNo, nextProps.tenantId);
      this.props.setNavTitle(navObj);
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleDock = () => {
    this.setState({ visible: true });
  }
  handleManifestVisit = () => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/manifest/view/${billMeta.bill_seq_no}`;
    this.context.router.push({ pathname });
  }
  handleEntryHeadSave = () => {
    const formVals = this.props.form.getFieldsValue(); // *todo* save entry mark/note
    this.props.saveEntryHead({ formVals, entryHeadId: this.props.head.id }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功');
      }
    });
  }
  handleDelete = () => {
    const head = this.props.head;
    this.props.deleteDecl(head.id, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.context.router.push(`/clearance/${this.props.ietype}/customs`);
      }
    });
  }
  handleReview = () => {
    const head = this.props.head;
    this.props.setDeclReviewed([this.props.head.id], CMS_DECL_STATUS.reviewed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleRecall = () => {
    const head = this.props.head;
    this.props.setDeclReviewed([head.id], CMS_DECL_STATUS.proposed.value).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleShowSendDeclModal = () => {
    const head = this.props.head;
    this.props.showSendDeclModal({ visible: true, preEntrySeqNo: head.pre_entry_seq_no, delgNo: head.delg_no, agentCustCo: head.agent_custco });
  }
  handleMarkReleasedModal = () => {
    const head = this.props.head;
    this.props.openDeclReleasedModal(head.entry_id, head.pre_entry_seq_no, head.delg_no);
  }
  reloadEntry = () => {
    this.props.loadEntry(this.props.head.bill_seq_no, this.props.head.pre_entry_seq_no, this.props.tenantId);
  }
  handleEntryVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
  }
  render() {
    const { ietype, form, head, bodies, billMeta } = this.props;
    const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === head.status)[0];
    const declEntryMenu = (
      <Menu onClick={this.handleEntryVisit}>
        {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
          <Icon type="file" /> {bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
        )}
      </Menu>);
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Icon type="file" /> <NavLink to={`/clearance/${ietype}/customs/`}>{this.msg('customsDeclaration')}</NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {head.entry_id || head.pre_entry_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
            {declkey && <Badge status={CMS_DECL_STATUS[declkey].badge} text={CMS_DECL_STATUS[declkey].text} />}
            <div className="top-bar-tools">
              { head.status === CMS_DECL_STATUS.proposed.value && <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete()}>
                <Tooltip title={this.msg('delete')} placement="bottom">
                  <Button size="large" icon="delete" />
                </Tooltip>
              </Popconfirm> }
              { head.status === CMS_DECL_STATUS.proposed.value &&
                <Button type="primary" size="large" icon="check-circle-o" onClick={this.handleReview}>{this.msg('review')}</Button>
              }
              { head.status === CMS_DECL_STATUS.reviewed.value &&
                <Tooltip title={this.msg('recall')} placement="bottom"><Button size="large" icon="left-circle-o" onClick={this.handleRecall} /></Tooltip>
              }
              { head.status === CMS_DECL_STATUS.reviewed.value &&
                <Button type="primary" size="large" icon="mail" onClick={this.handleShowSendDeclModal}>{this.msg('sendPackets')}</Button>
              }
              { (head.status === CMS_DECL_STATUS.finalized.value || head.status === CMS_DECL_STATUS.sent.value) &&
                <Button type="primary" ghost size="large" icon="flag" onClick={this.handleMarkReleasedModal}>{this.msg('markReleased')}</Button>
              }
              <Dropdown.Button size="large" onClick={this.handleManifestVisit} overlay={declEntryMenu}>
                <Icon type="file-text" /> 查看报关清单
              </Dropdown.Button>
              <ButtonToggle size="large"
                iconOff="folder" iconOn="folder-open"
                onClick={this.toggle}
              />
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large readonly">
            <Spin spinning={this.props.declSpinning}>
              <div className="page-body tabbed">
                <Tabs defaultActiveKey="header">
                  <TabPane tab="报关单表头" key="header">
                    <SheetHeadPanel ietype={ietype} form={form} formData={head} />
                  </TabPane>
                  <TabPane tab="报关单表体" key="body">
                    <SheetBodyPanel ietype={ietype} data={bodies} headNo={head.id} />
                  </TabPane>
                  <TabPane tab="法检物料" key="legalInspection">
                    <LegalInspectionPanel ietype={ietype} data={bodies} />
                  </TabPane>
                </Tabs>
              </div>
            </Spin>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.collapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>附加资料</h3>
            </div>
            <SheetExtraPanel type="entry" />
          </div>
        </Sider>
        <SendModal ietype={ietype} reload={this.reloadEntry} />
        <DeclReleasedModal reload={this.reloadEntry} />
      </Layout>
    );
  }
}
