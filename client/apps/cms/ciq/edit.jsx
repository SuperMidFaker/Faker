import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Breadcrumb, Button, Layout, Tabs, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateCiqHead, loadCiqDeclHead, ciqHeadChange } from 'common/reducers/cmsCiqDeclare';
import { format } from 'client/common/i18n/helpers';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import CiqDeclHeadPane from './tabpane/ciqDeclHeadPane';
import CiqDeclGoodsPane from './tabpane/ciqDeclGoodsPane';

import messages from './message.i18n';
import DeclTreePopover from '../common/popover/declTreePopover';

const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

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
    ciqs: state.cmsCiqDeclare.ciqDeclHead.ciqs,
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
    fullscreen: true,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleCusDeclVisit = () => {
    const { ciqDeclHead } = this.props;
    const ie = this.context.router.params.ioType === 'in' ? 'import' : 'export';
    const pathname = `/clearance/${ie}/cusdecl/${ciqDeclHead.bill_seq_no}/${this.props.router.params.declNo}`;
    this.context.router.push({ pathname });
  }
  handleSave = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
    if (values.ent_qualif_type_code) {
      [values.ent_qualif_type_code] = values.ent_qualif_type_code.split('|');
    }
    if (values.spec_pass_flag) {
      values.spec_pass_flag = values.spec_pass_flag.join(',');
    }
    if (values.special_decl_flag) {
      values.special_decl_flag = values.special_decl_flag.join(',');
    }
    this.props.updateCiqHead(this.props.router.params.declNo, values).then((result) => {
      if (!result.error) {
        this.props.loadCiqDeclHead(this.props.router.params.declNo);
        message.info(this.msg('saveSuccess'));
      }
    });
  }
  render() {
    const {
      form, entries, ciqDeclHead, ciqs,
    } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('basicInfo')} key="header">
      <CiqDeclHeadPane ioType={this.props.params.ioType} form={form} />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('goodsInfo')} key="body">
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
            {<DeclTreePopover
              entries={entries}
              ciqs={ciqs}
              selectedKeys={[`ciq-decl-${this.props.router.params.declNo}`]}
              billSeqNo={ciqDeclHead.bill_seq_no}
              ietype={this.props.params.ioType === 'in' ? 'import' : 'export'}
            />}
            <Button icon="file-excel">{this.msg('declExport')}</Button>
            <Button type="primary" icon="save" onClick={this.handleSave} disabled={this.props.ciqHeadChangeTimes === 0}>保存</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-min-width layout-min-width-large">
          <MagicCard
            bodyStyle={{ padding: 0 }}

            loading={this.props.declSpinning}
            onSizeChange={this.toggleFullscreen}
          >
            <Tabs defaultActiveKey="header">
              {tabs}
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
