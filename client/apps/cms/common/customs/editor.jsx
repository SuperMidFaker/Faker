import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Dropdown, Layout, Menu, Icon, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { fillEntryId } from 'common/reducers/cmsDelegation';
import { loadEntry } from 'common/reducers/cmsManifest';
import SheetHeadPanel from '../manifest/forms/SheetHeadPanel';
import SheetBodyPanel from '../manifest/forms/SheetBodyPanel';
import SheetExtraPanel from '../manifest/forms/SheetExtraPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Sider, Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    head: state.cmsManifest.entryHead,
    bodies: state.cmsManifest.entryBodies,
    tenantId: state.account.tenantId,
  }),
  { fillEntryId, loadEntry }
)
@connectNav({
  depth: 2,
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    visible: false,
    collapsed: true,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  lockMenu = (
    <Menu>
      <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
      <Menu.Item key="delete"><Icon type="delete" /> 删除</Menu.Item>
    </Menu>);
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
    const entryNo = this.props.form.getFieldsValue().entry_id;
    const { head } = this.props;
    this.props.fillEntryId({ entryNo, entryHeadId: head.id,
      billSeqNo: head.bill_seq_no, delgNo: head.delg_no }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
  }
  render() {
    const { ietype, form, head, bodies, billMeta } = this.props;
    const readonly = !billMeta.editable;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Layout>
          <Layout>
            <Header className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.props.ietype === 'import' ? this.msg('importOperation') : this.msg('exportOperation')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.msg('customsDeclaration')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {head.entry_id || head.pre_entry_seq_no}
                </Breadcrumb.Item>
              </Breadcrumb>
              <Button size="large" icon="rollback" onClick={this.handleManifestVisit}>查看源清单</Button>
              <div className="top-bar-tools">
                <Dropdown overlay={this.lockMenu}>
                  <Button size="large">
                    <Icon type="setting" /> <Icon type="down" />
                  </Button>
                </Dropdown>
                <Button size="large"
                  className={this.state.collapsed ? '' : 'btn-toggle-on'}
                  icon={this.state.collapsed ? 'menu-fold' : 'menu-unfold'}
                  onClick={this.toggle}
                >
                  附加信息
                </Button>
              </div>
            </Header>
            <Content className="main-content">
              <div className="page-body tabbed fixed-height">
                <div className={`panel-body collapse ${readonly ? 'readonly' : ''}`}>
                  <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={head} type="entry" onSave={this.handleEntryHeadSave} />
                  <SheetBodyPanel ietype={ietype} readonly={readonly} data={bodies}
                    headNo={head.id} billSeqNo={head.bill_seq_no} type="entry"
                  />
                </div>
              </div>
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
              <SheetExtraPanel />
            </div>
          </Sider>
        </Layout>
      </QueueAnim>
    );
  }
}
