import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Form, Layout, Tabs, Button, Select, message } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import ReceiverPane from './tabpane/receiverPane';
import CarrierPane from './tabpane/carrierPane';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { clearTemporary } from 'common/reducers/cwmReceive';
import { getSo, updateSo } from 'common/reducers/cwmShippingOrder';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    submitting: state.cwmShippingOrder.submitting,
    temporaryDetails: state.cwmReceive.temporaryDetails,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { getSo, updateSo, clearTemporary }
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
    soHead: {},
    soBody: [],
    region: {
      receiver_province: '',
      receiver_city: '',
      receiver_district: '',
      receiver_street: '',
      receiver_region_code: null,
    },
    carrier_name: '',
  }
  componentWillMount() {
    this.props.getSo(this.props.params.soNo).then(
      (result) => {
        if (!result.error) {
          this.setState({
            soHead: result.data.soHead,
            soBody: result.data.soBody,
            region: {
              receiver_province: result.data.soHead.receiver_province,
              receiver_city: result.data.soHead.receiver_city,
              receiver_district: result.data.soHead.receiver_district,
              receiver_street: result.data.soHead.receiver_street,
              receiver_region_code: result.data.soHead.receiver_region_code,
            },
            carrier_name: result.data.soHead.carrier_name,
          });
        }
      }
    );
  }
  componentWillUnmount() {
    this.props.clearTemporary();
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSaveBtnClick = () => {
    const { temporaryDetails, defaultWhse, owners, tenantId, loginId, tenantName } = this.props;
    if (temporaryDetails.length === 0) {
      message.info('明细不能为空');
      return;
    }
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        const data = { ...values, ...this.state.region, carrier_name: this.state.carrier_name };
        const owner = owners.find(item => item.id === values.owner_partner_id);
        data.soNo = this.props.params.soNo;
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.tenantId = tenantId;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.updateSo(data).then(
          (result) => {
            if (!result.error) {
              message.success('发货通知已保存成功');
              this.context.router.push('/cwm/shipping/order');
            } else {
              message.error('操作失败');
            }
          }
        );
      }
    });
  };
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleUploadFiles = (fileList) => {
    this.setState({
      attachments: fileList,
    });
  }
  handleRegionChange = (region) => {
    this.setState({ region });
  }
  handleCarrierChange = (value) => {
    this.setState({ carrier_name: value });
  }
  render() {
    const { form, submitting, defaultWhse } = this.props;
    const { soHead, soBody, region } = this.state;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select
                size="large"
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
              {this.props.params.soNo}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content">
          <Form layout="vertical">
            <HeadCard soHead={soHead} form={form} editable={this.state.editable} />
            <Card bodyStyle={{ padding: 0 }} noHovering>
              <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
                <TabPane tab="订单明细" key="orderDetails">
                  <DetailsPane soBody={soBody} detailEnable selectedOwner={soHead.owner_partner_id} form={form} editable={this.state.editable} />
                </TabPane>
                <TabPane tab="收货人" key="receiver">
                  <ReceiverPane form={form} selectedOwner={soHead.owner_partner_id} soHead={soHead} region={region} onRegionChange={this.handleRegionChange} />
                </TabPane>
                <TabPane tab="承运人" key="carrier">
                  <CarrierPane form={form} selectedOwner={soHead.owner_partner_id} soHead={soHead} onCarrierChange={this.handleCarrierChange} />
                </TabPane>
              </Tabs>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
