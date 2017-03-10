import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Icon, Form, message, Popconfirm, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead,
  openMergeSplitModal, billDelete, updateHeadNetWt, loadBillBody } from 'common/reducers/cmsManifest';
import NavLink from 'client/components/nav-link';
import SheetHeadPanel from './forms/SheetHeadPanel';
import SheetBodyPanel from './forms/SheetBodyPanel';
import MergeSplitModal from './modals/mergeSplit';
import SheetExtraPanel from './forms/SheetExtraPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    billHead: state.cmsManifest.billHead,
    billBodies: state.cmsManifest.billBodies,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal, billDelete, updateHeadNetWt, loadBillBody }
)
@connectNav({
  depth: 2,
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
    this.props.loadBillBody(this.props.billHead.bill_seq_no).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.generateEntry();
      }
    });
  }
  generateEntry = () => {
    const billHead = this.props.billHead;
    const bodyDatas = this.props.billBodies;
    let wtSum = 0;
    bodyDatas.forEach((body) => {
      if (body.wet_wt) {
        wtSum += Number(body.wet_wt);
      }
    });
    if (wtSum > billHead.gross_wt) {
      this.props.updateHeadNetWt(billHead.bill_seq_no, wtSum);
      message.error('毛重必须大于总净重');
    } else if (wtSum > 0) {
      this.props.updateHeadNetWt(billHead.bill_seq_no, wtSum);
      const totGrossWt = billHead.gross_wt;
      const datas = [];
      let wts = 0;
      for (let i = 0; i < bodyDatas.length - 1; i++) {
        const body = bodyDatas[i];
        const grosswt = (totGrossWt * body.wet_wt / wtSum).toFixed(3);
        wts += Number(grosswt);
        const data = { ...body, gross_wt: grosswt };
        datas.push(data);
        this.props.editBillBody(data);
      }
      const lastwt = totGrossWt - wts;
      const lastBody = bodyDatas[bodyDatas.length - 1];
      datas.push({ ...lastBody, gross_wt: lastwt });
      this.props.editBillBody({ ...lastBody, gross_wt: lastwt });
      this.props.openMergeSplitModal();
    }
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
        <Icon type="file-text" /> {bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
      )}
    </Menu>);
    const path = `/clearance/${ietype}/manifest/`;
    const generateEntry = !this.props.readonly && billMeta.entries.length === 0;
    return (
      <Layout>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.props.ietype === 'import' ? this.msg('importClearance') : this.msg('exportClearance')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <NavLink to={path}>{this.msg('declManifest')}</NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {billMeta.bill_seq_no}
              </Breadcrumb.Item>
            </Breadcrumb>
            {billMeta.entries.length > 0 ? (
              <Dropdown overlay={declEntryMenu}>
                <Button size="large" >生成的报关单<Icon type="down" /></Button>
              </Dropdown>
              ) : null}
            <div className="top-bar-tools">
              {generateEntry &&
                <Button type="primary" size="large" icon="addfile" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button>
                }
              <Dropdown overlay={this.lockMenu}>
                <Button size="large">
                  <Icon type="setting" /> <Icon type="down" />
                </Button>
              </Dropdown>
              <Button size="large"
                className={this.state.collapsed ? '' : 'btn-toggle-on'}
                icon={this.state.collapsed ? 'folder' : 'folder-open'}
                onClick={this.toggle}
              />
            </div>
          </Header>
          <Content className={`main-content layout-min-width layout-min-width-large ${readonly ? 'readonly' : ''}`}>
            <div className="page-body tabbed">
              <Tabs defaultActiveKey="header">
                <TabPane tab="清单表头" key="header">
                  <SheetHeadPanel ietype={ietype} readonly={readonly} form={form} formData={billHead} type="bill" onSave={this.handleBillSave} />
                </TabPane>
                <TabPane tab="清单表体" key="body">
                  <SheetBodyPanel ietype={ietype} readonly={readonly} headForm={form} data={billBodies} headNo={billHead.bill_seq_no}
                    onAdd={actions.addNewBillBody} onDel={actions.delBillBody} onEdit={actions.editBillBody}
                    billSeqNo={billHead.bill_seq_no} type="bill"
                  />
                </TabPane>
              </Tabs>
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
            <div className="panel-header">
              <h3>附加资料</h3>
            </div>
            <SheetExtraPanel type="bill" />
          </div>
        </Sider>
        <MergeSplitModal />
      </Layout>
    );
  }
}
