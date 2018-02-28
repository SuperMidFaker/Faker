import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, Button } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { addSofInvoice } from 'common/reducers/sofInvoice';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    submitting: state.cwmReceive.submitting,
    temporaryDetails: state.sofInvoice.temporaryDetails,
  }),
  { addSofInvoice }
)
@connectNav({
  depth: 3,
  moduleName: 'scof',
})
@Form.create()
export default class CreateInvoice extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
    packageType: '',
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handlePackageSelect = (value) => {
    this.setState({
      packageType: value,
    });
  }
  handleSave = () => {
    const { temporaryDetails } = this.props;
    const { packageType } = this.state;
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.addSofInvoice({ ...values, packageType }, temporaryDetails).then((result) => {
          if (!result.error) {
            this.context.router.goBack();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  render() {
    const {
      form, submitting, temporaryDetails,
    } = this.props;
    const disable = !(temporaryDetails.length !== 0);
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('invoices')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('createInvoice')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancel}>
              {this.gmsg('cancel')}
            </Button>
            <Button type="primary" disabled={disable} icon="save" loading={submitting} onClick={this.handleSave}>
              {this.gmsg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard
              form={form}
              editable
              packageType={this.state.packageType}
              handlePackageSelect={this.handlePackageSelect}
            />
            <MagicCard bodyStyle={{ padding: 0 }} >
              <Tabs defaultActiveKey="invoiceDetails" onChange={this.handleTabChange}>
                <TabPane tab="发票明细" key="invoiceDetails">
                  <DetailsPane
                    editable
                    form={form}
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
