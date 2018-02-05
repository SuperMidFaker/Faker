import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, Button, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    submitting: state.cwmReceive.submitting,
  }),
  { }
)
@connectNav({
  depth: 3,
  moduleName: 'scof',
})
@Form.create()
export default class EditInvoice extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    tenantName: PropTypes.string.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    editable: true,
    invoiceHead: {},
    fullscreen: true,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
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
            message.success('发票已保存成功');
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
    const { form, submitting } = this.props;
    const { invoiceHead } = this.state;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('invoices')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.invoiceNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            {this.state.editable && <Button type="ghost" onClick={this.handleCancel}>
              {this.gmsg('cancel')}
            </Button>}
            {this.state.editable && <Button type="primary" icon="save" loading={submitting} onClick={this.handleSave}>
              {this.gmsg('save')}
            </Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard invoiceHead={invoiceHead} form={form} editable={this.state.editable} />
            <MagicCard bodyStyle={{ padding: 0 }} >
              <Tabs defaultActiveKey="invoiceDetails" onChange={this.handleTabChange}>
                <TabPane tab="发票明细" key="invoiceDetails">
                  <DetailsPane
                    form={form}
                    editable={this.state.editable}
                    fullscreen={this.state.fullscreen}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
