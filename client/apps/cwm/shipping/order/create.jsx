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
import ReceiverPane from './tabpane/receiverPane';
import CarrierPane from './tabpane/carrierPane';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { clearTemporary } from 'common/reducers/cwmReceive';
import { createSO } from 'common/reducers/cwmShippingOrder';

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
    submitting: state.cwmShippingOrder.submitting,
    defaultWhse: state.cwmContext.defaultWhse,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { clearTemporary, createSO }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
@Form.create()
export default class CreateShippingOrder extends Component {
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
    detailEnable: false,
    selectedOwner: null,
    region: {
      receiver_province: '',
      receiver_city: '',
      receiver_district: '',
      receiver_street: '',
      receiver_region_code: null,
    },
    carrier_name: '',
    fullscreen: true,
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
      temporaryDetails, defaultWhse, owners, loginId, tenantName,
    } = this.props;
    if (temporaryDetails.length === 0) {
      message.info('明细不能为空');
      return;
    }
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = { ...values, ...this.state.region, carrier_name: this.state.carrier_name };
        const owner = owners.find(item => item.id === values.owner_partner_id);
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.createSO(data).then((result) => {
          if (!result.error) {
            message.success('出货订单已创建成功');
            this.context.router.push('/cwm/shipping/order');
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
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }
  handleOwnerChange = (bool, partnerId) => {
    this.setState({
      detailEnable: bool,
      selectedOwner: partnerId,
    });
  }
  handleRegionChange = (region) => {
    this.setState({ region });
  }
  handleCarrierChange = (value) => {
    this.setState({ carrier_name: value });
  }
  render() {
    const {
      form, submitting, defaultWhse, temporaryDetails,
    } = this.props;
    const { region } = this.state;
    const disable = !(this.state.detailEnable && temporaryDetails.length !== 0);
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
                {this.msg('shippingOrder')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('createSO')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" disabled={disable} icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard form={form} handleOwnerChange={this.handleOwnerChange} />
            <MagicCard bodyStyle={{ padding: 0 }} hoverable={false}>
              <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
                <TabPane tab="订单明细" key="orderDetails">
                  <DetailsPane editable={this.state.editable} form={form} detailEnable={this.state.detailEnable} selectedOwner={this.state.selectedOwner} fullscreen={this.state.fullscreen} />
                </TabPane>
                <TabPane tab="收货人" key="receiver">
                  <ReceiverPane form={form} selectedOwner={this.state.selectedOwner} region={region} onRegionChange={this.handleRegionChange} />
                </TabPane>
                <TabPane tab="承运人" key="carrier">
                  <CarrierPane form={form} selectedOwner={this.state.selectedOwner} onCarrierChange={this.handleCarrierChange} />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Form>
        </Content>
      </div>
    );
  }
}
