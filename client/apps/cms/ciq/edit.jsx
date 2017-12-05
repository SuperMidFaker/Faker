import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Icon, Layout, Tabs, message, Popover, Tree } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import CiqDeclHeadPane from './tabpane/ciqDeclHeadPane';
import CiqDeclGoodsPane from './tabpane/ciqDeclGoodsPane';
import { updateCiqHead, loadCiqDeclHead, ciqHeadChange } from 'common/reducers/cmsCiqDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const TabPane = Tabs.TabPane;
const TreeNode = Tree.TreeNode;

const navObj = {
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ciqDeclHead: state.cmsCiqDeclare.ciqDeclHead.head,
    entries: state.cmsCiqDeclare.ciqDeclHead.entries,
    ciqHeadChangeTimes: state.cmsCiqDeclare.ciqHeadChangeTimes,
  }),
  { updateCiqHead, loadCiqDeclHead, ciqHeadChange }
)
@connectNav(navObj)
@Form.create({ onValuesChange: props => props.ciqHeadChange() })
export default class CiqDeclEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ioType: PropTypes.oneOf(['in', 'out']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: true,
    fullscreen: true,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleCusDeclVisit = () => {
    const { ciqDeclHead } = this.props;
    const pathname = `/clearance/${this.context.router.params.ioType === 'in' ? 'import' : 'export'}/cusdecl/${ciqDeclHead.bill_seq_no}/${this.props.router.params.declNo}`;
    this.context.router.push({ pathname });
  }
  handleSave = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
    if (values.spec_pass_flag) {
      values.spec_pass_flag = values.spec_pass_flag.join(',');
    }
    if (values.special_decl_flag) {
      values.special_decl_flag = values.special_decl_flag.join(',');
    }
    this.props.updateCiqHead(this.props.router.params.declNo, values).then((result) => {
      if (!result.error) {
        this.props.loadCiqDeclHead(this.props.router.params.declNo);
        message.info('保存成功');
      }
    });
  }
  handleSelect = (selectedKeys) => {
    const type = this.props.params.ioType === 'in' ? 'import' : 'export';
    const { ciqDeclHead } = this.props;
    if (selectedKeys[0].indexOf('0-0-0') !== -1) {
      const pathname = `/clearance/${type}/manifest/view/${ciqDeclHead.bill_seq_no}`;
      this.context.router.push({ pathname });
    } else {
      const pathname = `/clearance/${type}/cusdecl/${ciqDeclHead.bill_seq_no}/${selectedKeys[0].slice(6)}`;
      this.context.router.push({ pathname });
    }
  }
  render() {
    const { form, entries } = this.props;
    const popoverContent = (
      <Tree
        showLine
        defaultExpandedKeys={['0-0-0']}
        onSelect={this.handleSelect}
      >
        <TreeNode title="报关单" key="0-0">
          <TreeNode title="申报清单" key="0-0-0" />
          {entries.length > 0 && (
          <TreeNode title="关联报关单" key="0-0-1">
            {entries.map(bme => <TreeNode title={bme.entry_id || bme.pre_entry_seq_no} key={`0-0-1-${bme.entry_id || bme.pre_entry_seq_no}`} />)}
          </TreeNode>
        )}
        </TreeNode>
      </Tree>
    );
    const DeclPopover = (
      <Popover content={popoverContent}>
        <Button ><Icon type="link" />转至<Icon type="down" /></Button>
      </Popover>
    );
    const tabs = [];
    tabs.push(
      <TabPane tab="基本信息" key="header">
        <CiqDeclHeadPane ioType={this.props.params.ioType} form={form} />
      </TabPane>);
    tabs.push(
      <TabPane tab="商品信息" key="body">
        <CiqDeclGoodsPane ioType={this.props.params.ioType} fullscreen={this.state.fullscreen} />
      </TabPane>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('ciqDecl')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.router.params.declNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {/* <Dropdown overlay={declEntryMenu}>
              <Button ><Icon type="link" />转至 <Icon type="down" /></Button>
            </Dropdown> */}
            {DeclPopover}
            <Button icon="file-excel">九城商检导出</Button>
            <Button type="primary" icon="save" onClick={this.handleSave} disabled={this.props.ciqHeadChangeTimes === 0}>保存</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-min-width layout-min-width-large">
          <MagicCard bodyStyle={{ padding: 0 }} hoverable={false} loading={this.props.declSpinning} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
