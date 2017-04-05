import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Layout, Tabs, message, Popconfirm, Spin } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { loadEntry, saveEntryHead } from 'common/reducers/cmsManifest';
import { deleteDecl, setFilterReviewed, showSendDeclModal } from 'common/reducers/cmsDeclare';
import { fillEntryId } from 'common/reducers/cmsDelegation';
import NavLink from 'client/components/nav-link';
import ButtonToggle from 'client/components/ButtonToggle';
import SheetHeadPanel from './panel/cdfHeadPanel';
import SheetBodyPanel from './panel/cdfBodyPanel';
import SheetExtraPanel from './panel/cdfExtraPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { DECL_STATUS } from 'common/constants';
import SendModal from './modals/sendModal';

const formatMsg = format(messages);
const { Sider, Header, Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
    tenantId: state.account.tenantId,
  }),
  { saveEntryHead, loadEntry, fillEntryId, deleteDecl, setFilterReviewed, showSendDeclModal }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
      editable: PropTypes.bool,
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
    let pathname = `/clearance/${ietype}/manifest/view/${billMeta.bill_seq_no}`;
    if (billMeta.editable) {
      pathname = `/clearance/${ietype}/manifest/${billMeta.bill_seq_no}`;
    }
    this.context.router.push({ pathname });
  }
  handleEntryHeadSave = () => {
    const formVals = this.props.form.getFieldsValue();
    const { head } = this.props;
    if (formVals.entry_id) {
      this.props.fillEntryId({ entryNo: formVals.entry_id, entryHeadId: head.id,
        billSeqNo: head.bill_seq_no, delgNo: head.delg_no }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          }
        });
    }
    this.props.saveEntryHead({ formVals, entryHeadId: head.id }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('保存成功');
      }
    });
  }
  handleDelete = () => {
    const head = this.props.head;
    this.props.deleteDecl(head.id, head.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.context.router.push(`/clearance/${this.props.ietype}/customs`);
      }
    });
  }
  handleReview = () => {
    const head = this.props.head;
    this.props.setFilterReviewed(this.props.head.id, DECL_STATUS.reviewed).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleRecall = () => {
    const head = this.props.head;
    this.props.setFilterReviewed(head.id, DECL_STATUS.proposed).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadEntry(head.bill_seq_no, head.pre_entry_seq_no, this.props.tenantId);
      }
    });
  }
  handleShowSendDeclModal = () => {
    const head = this.props.head;
    this.props.showSendDeclModal({ visible: true, preEntrySeqNo: head.pre_entry_seq_no, delgNo: head.delg_no });
  }
  render() {
    const { ietype, form, head, bodies, billMeta } = this.props;
    const readonly = !billMeta.editable;
    const path = `/clearance/${ietype}/customs/`;
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <NavLink to={path}>{this.msg('customsDeclaration')}</NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {head.entry_id || head.pre_entry_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
            <Button size="large" icon="rollback" onClick={this.handleManifestVisit}>查看源清单</Button>
            <div className="top-bar-tools">
              { head.status === 0 && <Button type="primary" size="large" onClick={this.handleReview}>{this.msg('review')}</Button> }
              { head.status === 0 && <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleDelete()}>
                <Button size="large" >{this.msg('delete')}</Button>
              </Popconfirm> }
              { head.status === 1 && <Button type="primary" size="large" onClick={this.handleShowSendDeclModal}>{this.msg('sendPackets')}</Button> }
              { head.status === 1 && <Button size="large" onClick={this.handleRecall}>{this.msg('recall')}</Button> }
              <ButtonToggle size="large"
                iconOff="folder" iconOn="folder-open"
                onClick={this.toggle}
              />
            </div>
          </Header>
          <Content className={`main-content layout-min-width layout-min-width-large ${readonly ? 'readonly' : ''}`}>
            <Spin spinning={this.props.declSpinning}>
              <div className="page-body tabbed">
                <Tabs defaultActiveKey="header">
                  <TabPane tab="报关单表头" key="header">
                    <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={head} type="entry" onSave={this.handleEntryHeadSave} />
                  </TabPane>
                  <TabPane tab="报关单表体" key="body">
                    <SheetBodyPanel ietype={ietype} readonly={readonly} data={bodies}
                      headNo={head.id} billSeqNo={head.bill_seq_no} type="entry"
                    />
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
            <SendModal ietype={ietype} />
          </div>
        </Sider>
      </Layout>
    );
  }
}
