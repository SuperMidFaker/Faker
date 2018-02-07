import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, Button } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { UpdateSofInvoice, getInvoice, clearInvoice } from 'common/reducers/sofInvoice';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.sofInvoice.temporaryDetails,
    invoiceHead: state.sofInvoice.invoiceHead,
    partners: state.partner.partners,
  }),
  { getInvoice, UpdateSofInvoice, clearInvoice }
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  componentWillMount() {
    this.props.getInvoice(this.props.params.invoiceNo).then((result) => {
      if (!result.error) {
        this.setState({
          packageType: result.data.head.package_type,
        });
      }
    });
  }
  componentWillUnmount() {
    this.props.clearInvoice();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  handleSave = () => {
    const { temporaryDetails, partners, invoiceHead } = this.props;
    const { packageType } = this.state;
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = { ...values };
        if (isNaN(data.buyer)) { // eslint-disable-line
          const partner = partners.find(pn => pn.name === data.buyer);
          data.buyer = partner.id;
        }
        if (isNaN(data.seller)) { // eslint-disable-line
          const partner = partners.find(pn => pn.name === data.seller);
          data.seller = partner.id;
        }
        this.props.UpdateSofInvoice(
          { ...data, packageType },
          temporaryDetails,
          invoiceHead.id
        ).then((result) => {
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
  handlePackageSelect = (value) => {
    this.setState({
      packageType: value,
    });
  }
  render() {
    const { form } = this.props;
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
            {<Button type="ghost" onClick={this.handleCancel}>
              {this.gmsg('cancel')}
            </Button>}
            {<Button type="primary" icon="save" onClick={this.handleSave}>
              {this.gmsg('save')}
            </Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard
              editable={false}
              form={form}
              packageType={this.state.packageType}
              handlePackageSelect={this.handlePackageSelect}
            />
            <MagicCard bodyStyle={{ padding: 0 }} >
              <Tabs defaultActiveKey="invoiceDetails" onChange={this.handleTabChange}>
                <TabPane tab="发票明细" key="invoiceDetails">
                  <DetailsPane
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
