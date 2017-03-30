import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Layout, Menu, Icon, Form, message, Popconfirm, Tabs, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addNewBillBody, delBillBody, editBillBody, saveBillHead,
  openMergeSplitModal, billDelete, updateHeadNetWt, loadBillBody, saveBillRules, setStepVisible, billHeadChange } from 'common/reducers/cmsManifest';
import { loadTemplateFormVals } from 'common/reducers/cmsSettings';
import NavLink from 'client/components/nav-link';
import SheetHeadPanel from './panel/manifestHeadPanel';
import SheetBodyPanel from './panel/manifestBodyPanel';
import MergeSplitModal from './modals/mergeSplit';
import SaveTemplateModal from './modals/saveTemplateSteps';
import SheetExtraPanel from './panel/manifestExtraPanel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    billHead: state.cmsManifest.billHead,
    billBodies: state.cmsManifest.billBodies,
    templates: state.cmsManifest.templates,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    formData: state.cmsSettings.formData,
  }),
  { addNewBillBody, delBillBody, editBillBody, saveBillHead, openMergeSplitModal,
    billDelete, updateHeadNetWt, loadBillBody, loadTemplateFormVals, saveBillRules,
    setStepVisible, billHeadChange }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create({ onValuesChange: (props, values) => props.billHeadChange(values) })
export default class ManifestEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    readonly: PropTypes.bool,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
    templates: PropTypes.array.isRequired,
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
    headData: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billHead !== this.props.billHead) {
      this.setState({ headData: nextProps.billHead });
    }
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
        this.props.form.validateFields((errors) => {
          if (!errors) {
            const { billHead, ietype, loginId, tenantId } = this.props;
            const head = { ...billHead, ...this.props.form.getFieldsValue() };
            this.props.saveBillHead({ head, ietype, loginId, tenantId });
            this.generateEntry();
          } else {
            message.error('清单表头尚未填写完整');
          }
        });
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
    if (bodyDatas.length === 0 || wtSum === 0) {
      return message.error('请检查表体数据是否正确');
    }
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
  handleEntryVisit = (ev) => {
    const { ietype, billMeta } = this.props;
    const pathname = `/clearance/${ietype}/customs/${billMeta.bill_seq_no}/${ev.key}`;
    this.context.router.push({ pathname });
  }
  validateCode = (code, customsCode) => {
    let info = null;
    if (code === '' && customsCode === '') {
      info = '请填写社会信用代码或者海关编码';
    } else if (code && code.length !== 18) {
      info = `社会信用代码必须为18位, 当前${code.length}位`;
    } else if (customsCode && customsCode.length !== 10) {
      info = `海关10位编码必须为10位, 当前${customsCode.length}位`;
    }
    return info;
  }
  handleBillSave = () => {
    const { billHead, ietype, loginId, tenantId, formData } = this.props;
    const head = { ...billHead, ...this.props.form.getFieldsValue(), template_id: formData.template_id };
    const tradeInfo = this.validateCode(head.trade_co, head.trade_custco);
    if (tradeInfo) {
      return message.error(`${tradeInfo}`);
    }
    const ownInfo = this.validateCode(head.owner_code, head.owner_custco);
    if (ownInfo) {
      return message.error(`${ownInfo}`);
    }
    const agentInfo = this.validateCode(head.agent_code, head.agent_custco);
    if (agentInfo) {
      return message.error(`${agentInfo}`);
    }
    this.props.saveBillHead({ head, ietype, loginId, tenantId }).then(
    (result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.info('更新成功');
      }
    });
  }
  handleBillDelete = () => {
    this.props.billDelete(this.props.billHead).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('已删除');
          this.props.form.resetFields();
        }
      }
    );
  }
  handleSelectChange = (value) => {
    if (value) {
      this.props.loadTemplateFormVals(value).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          const formData = result.data.formData;
          for (const key in formData) {
            if (!formData[key]) {
              delete formData[key];
            }
          }
          const headData = { ...this.props.billHead, ...formData };
          this.setState({ headData });
          const rules = {
            template_id: formData.template_id,
            rule_g_name: formData.rule_g_name,
            rule_currency: formData.rule_currency,
            rule_orig_country: formData.rule_orig_country,
            rule_net_wt: formData.rule_net_wt,
            rule_g_unit: formData.rule_g_unit,
            rule_gunit_num: formData.rule_gunit_num,
            rule_element: formData.rule_element,
            merge_checked: formData.merge_checked,
            merge_byhscode: formData.merge_byhscode,
            merge_bygname: formData.merge_bygname,
            merge_bycurr: formData.merge_bycurr,
            merge_bycountry: formData.merge_bycountry,
            merge_bycopgno: formData.merge_bycopgno,
            merge_byengno: formData.merge_byengno,
            split_hscode: formData.split_hscode,
            split_spl_category: formData.split_spl_category,
            split_curr: formData.split_curr,
            split_percount: formData.split_percount,
            sort_customs: formData.sort_customs,
            sort_dectotal: formData.sort_dectotal,
            sort_hscode: formData.sort_hscode,
          };
          this.props.saveBillRules({ rules, billSeqNo: this.props.billHead.bill_seq_no });
        }
      });
    } else {
      this.setState({ headData: this.props.billHead });
      const { billHead, ietype, loginId, tenantId } = this.props;
      const head = { ...billHead, ...this.props.form.getFieldsValue(), template_id: null };
      this.props.saveBillHead({ head, ietype, loginId, tenantId });
    }
  }
  handleSaveAsTemplate = () => {
    this.props.setStepVisible(true);
  }
  handleLockMenu = (e) => {
    if (e.key === 'template') {
      this.props.setStepVisible(true);
    }
  }

  lockMenu = (
    <Menu onClick={this.handleLockMenu}>
      <Menu.Item key="lock"><Icon type="lock" /> 锁定清单</Menu.Item>
      <Menu.Item key="delete">
        <Popconfirm title="确定删除清单表头表体数据?" onConfirm={this.handleBillDelete}>
          <a> <Icon type="delete" /> 重置清单</a>
        </Popconfirm>
      </Menu.Item>
      <Menu.Item key="template"><Icon type="file" /> {this.msg('saveAsTemplate')}</Menu.Item>
    </Menu>)
  render() {
    const { ietype, readonly, form: { getFieldDecorator }, form, billHead, billBodies, billMeta, templates, ...actions } = this.props;
    const declEntryMenu = (<Menu onClick={this.handleEntryVisit}>
      {billMeta.entries.map(bme => (<Menu.Item key={bme.pre_entry_seq_no}>
        <Icon type="file-text" /> {bme.entry_id || bme.pre_entry_seq_no}</Menu.Item>)
      )}
    </Menu>);
    const path = `/clearance/${ietype}/manifest/`;
    const editable = !this.props.readonly && billMeta.entries.length === 0;
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
            {billMeta.entries.length > 0 &&
              <Dropdown overlay={declEntryMenu}>
                <Button size="large">生成的报关单<Icon type="down" /></Button>
              </Dropdown>
            }
            <div className="top-bar-tools">
              {editable && getFieldDecorator('model', { initialValue: billHead.template_id })(<Select
                showArrow={false}
                placeholder="选择模板"
                optionFilterProp="search"
                size="large"
                onChange={this.handleSelectChange}
                style={{ width: 200 }}
                allowClear
              >
                {templates.map(data => (<Option key={data.id} value={data.id}
                  search={`${data.id}${data.template_name}`}
                >{data.template_name}</Option>)
                  )}
              </Select>)
              }
              {editable && <Button type="primary" size="large" icon="addfile" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button> }
              {editable &&
                <Dropdown overlay={this.lockMenu}><Button size="large"> 更多 <Icon type="down" /></Button></Dropdown>
              }
              {!editable &&
                <Button type="primary" size="large" icon="file" onClick={this.handleSaveAsTemplate}>{this.msg('saveAsTemplate')}</Button>
              }
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
                  <SheetHeadPanel ietype={ietype} readonly={!editable} form={form} formData={this.state.headData} ruleRequired type="bill" onSave={this.handleBillSave} />
                </TabPane>
                <TabPane tab="清单表体" key="body">
                  <SheetBodyPanel ietype={ietype} readonly={!editable} headForm={form} data={billBodies} headNo={billHead.bill_seq_no}
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
        <SaveTemplateModal ietype={ietype} />
      </Layout>
    );
  }
}
