import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Icon, Form, message, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal, billDelete } from 'common/reducers/cmsManifest';
import SheetHeadPanel from './forms/SheetHeadPanel';
import SheetBodyPanel from './forms/SheetBodyPanel';
import MergeSplitModal from './modals/mergeSplit';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    billHead: state.cmsManifest.billHead,
    billBodies: state.cmsManifest.billBodies,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal, billDelete }
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
    collapsed: true,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
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
  handleBillDelete = () => {
    this.props.billDelete(this.props.billHead.bill_seq_no).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('已删除');
        }
      }
    );
  }

  lockMenu = (
    <Menu>
      <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
      <Menu.Item key="delete">
        <Popconfirm title="确定删除清单?" onConfirm={this.handleBillDelete}>
          <a> <Icon type="delete" /> 删除</a>
        </Popconfirm>
      </Menu.Item>
    </Menu>)
  render() {
    const { ietype, readonly, form, billHead, billBodies, billMeta, ...actions } = this.props;
    const declEntryMenu = (<Menu onClick={this.handleEntryVisit}>
      {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
        <Icon type="file-text" />报关单{bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
      )}
    </Menu>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Layout>
          <Layout>
            <Header className="top-bar top-bar-fixed">
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
              <div className="top-bar-tools">
                <Dropdown overlay={this.lockMenu}>
                  <Button size="large">
                    <Icon type="setting" /> <Icon type="down" />
                  </Button>
                </Dropdown>
                {!this.props.readonly &&
                  <Button type="primary" size="large" icon="addfile" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button>
                }
              </div>
            </Header>
            <Content className="main-content top-bar-fixed">
              <div className="page-body tabbed fixed-height">
                <div className={`panel-body collapse ${readonly ? 'readonly' : ''}`}>
                  <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={billHead} type="bill" onSave={this.handleBillSave} />
                  <SheetBodyPanel ietype={ietype} readonly={readonly} data={billBodies} headNo={billHead.bill_seq_no}
                    onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
                    billSeqNo={billHead.bill_seq_no} type="bill"
                  />
                </div>
              </div>
            </Content>
          </Layout>
        </Layout>
        <MergeSplitModal />
      </QueueAnim>
    );
  }
}
