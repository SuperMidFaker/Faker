import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, Button, Select, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import LottingPane from './tabpane/lottingPane';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { loadAsn, updateASN, clearTemporary } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);
const { Content } = Layout;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    submitting: state.cwmReceive.submitting,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    suppliers: state.cwmReceive.suppliers,
  }),
  { loadAsn, updateASN, clearTemporary }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class ReceivingASNDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    editable: true,
    asnHead: {},
    asnBody: [],
    fullscreen: true,
  }
  componentWillMount() {
    this.props.loadAsn(this.props.params.asnNo).then((result) => {
      if (!result.error) {
        this.setState({
          asnHead: result.data.asnHead,
          asnBody: result.data.asnBody,
        });
      }
    });
  }
  componentWillUnmount() {
    this.props.clearTemporary();
  }
  msg = key => formatMsg(this.props.intl, key);
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleSave = () => {
    const {
      temporaryDetails, defaultWhse, owners, loginId, tenantName, suppliers,
    } = this.props;
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = values;
        const owner = owners.find(item => item.id === values.owner_partner_id);
        const supplier = suppliers.find(sl => sl.name === values.supplier_name);
        data.asnNo = this.props.params.asnNo;
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.loginId = loginId;
        data.tenantName = tenantName;
        data.supplierCode = supplier && supplier.code;
        this.props.updateASN(data).then((result) => {
          if (!result.error) {
            message.success('收货通知已保存成功');
            this.context.router.push('/cwm/receiving/asn');
          } else {
            message.error('操作失败');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, submitting, defaultWhse } = this.props;
    const { asnHead, asnBody } = this.state;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select

                  value={defaultWhse.code}
                  style={{ width: 160 }}
                  disabled
                >
                  <Option value={defaultWhse.code}>{defaultWhse.name}</Option>
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('receivingASN')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.asnNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {this.state.editable && <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>}
            {this.state.editable && <Button type="primary" icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard asnHead={asnHead} form={form} editable={this.state.editable} />
            <MagicCard bodyStyle={{ padding: 0 }} hoverable={false}>
              <Tabs defaultActiveKey="asnDetails" onChange={this.handleTabChange}>
                <TabPane tab="ASN明细" key="asnDetails">
                  <DetailsPane asnBody={asnBody} detailEnable selectedOwner={asnHead.owner_partner_id} form={form} editable={this.state.editable} fullscreen={this.state.fullscreen} />
                </TabPane>
                <TabPane tab="批次属性" key="lottingProps">
                  <LottingPane editable={this.state.editable} form={form} asnNo={this.props.params.asnNo} />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
