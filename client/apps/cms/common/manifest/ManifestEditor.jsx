import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Menu, Icon, Form, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal } from 'common/reducers/cmsManifest';
import SheetHeadPanel from '../forms/SheetHeadPanel';
import SheetBodyPanel from '../forms/SheetBodyPanel';
import ExtraDock from '../modals/extraDock';
import MergeSplitModal from './modals/mergeSplit';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    billHead: state.cmsManifest.billHead,
    billBodies: state.cmsManifest.billBodies,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class ManifestEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    readonly: PropTypes.bool,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    visible: false,
    collapsed: false,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  lockMenu = (
    <Menu>
      <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
      <Menu.Item key="delete"><Icon type="delete" /> 删除(不可恢复)</Menu.Item>
    </Menu>)
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleGenerateEntry = () => {
    this.props.openMergeSplitModal();
  }
  handleDock = () => {
    this.setState({ visible: true });
  }
  handleEntryVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
  }
  handleBillSave = () => {
    // todo bill head save sync with entry head, vice verse
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { billHead, ietype, loginId, tenantId } = this.props;
        const head = { ...billHead, ...this.props.form.getFieldsValue() };
        this.props.saveBillHead({ head, ietype, loginId, tenantId }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              message.info('更新成功');
            }
          }
        );
      }
    });
  }
  render() {
    const { ietype, readonly, form, billHead, billBodies, billMeta, ...actions } = this.props;
    const declEntryMenu = (<Menu onClick={this.handleEntryVisit}>
      {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
        <Icon type="file-text" />报关单{bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
      )}
    </Menu>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              制单
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Dropdown overlay={declEntryMenu}>
                <a style={{ fontSize: 14 }}>报关清单 {billMeta.bill_seq_no}<Icon type="down" /></a>
              </Dropdown>
            </Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="top-bar-tools">
          <Dropdown overlay={this.lockMenu}>
            <Button>
              <Icon type="setting" /> <Icon type="down" />
            </Button>
          </Dropdown>
          {!this.props.readonly &&
            <Button type="primary" icon="addfile" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button>
          }
          <Icon
            className="trigger"
            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggle}
          />
        </div>
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <div className={`panel-body collapse ${readonly ? 'readonly' : ''}`}>
              <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={billHead} type="bill" onSave={this.handleBillSave} />
              <SheetBodyPanel ietype={ietype} readonly={readonly} data={billBodies} headNo={billHead.bill_seq_no}
                onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
                billSeqNo={billHead.bill_seq_no} type="bill"
              />
            </div>
          </div>
        </div>
        <MergeSplitModal />
        <ExtraDock visible={this.state.visible} />
      </QueueAnim>
    );
  }
}
