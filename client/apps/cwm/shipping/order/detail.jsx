import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Layout, Tabs, Button, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { clearTemporary } from 'common/reducers/cwmReceive';
import { getSo, updateSo } from 'common/reducers/cwmShippingOrder';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import WhseSelect from '../../common/whseSelect';
import HeadCard from './card/headCard';
import DetailsPane from './tabpane/detailsPane';
import ReceiverPane from './tabpane/receiverPane';
import CarrierPane from './tabpane/carrierPane';
import messages from '../message.i18n';


const formatMsg = format(messages);
const { Content } = Layout;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
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
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
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
    this.props.getSo(this.props.params.soNo).then((result) => {
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
    });
  }
  componentWillUnmount() {
    this.props.clearTemporary();
  }
  msg = key => formatMsg(this.props.intl, key);
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
        data.soNo = this.props.params.soNo;
        data.ownerName = owner.name;
        data.ownerTenantId = owner.partner_tenant_id;
        data.temporaryDetails = temporaryDetails;
        data.whseCode = defaultWhse.code;
        data.loginId = loginId;
        data.tenantName = tenantName;
        this.props.updateSo(data).then((result) => {
          if (!result.error) {
            message.success('出货订单已保存成功');
            this.context.router.push('/cwm/shipping/order');
          } else {
            message.error('操作失败');
          }
        });
      }
    });
  };
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleRegionChange = (region) => {
    this.setState({ region });
  }
  handleCarrierChange = (value) => {
    this.setState({ carrier_name: value });
  }
  handleOwnerChange = (bool, partnerId) => {
    this.setState({
      soHead: { ...this.state.soHead, owner_partner_id: partnerId },
    });
  }
  render() {
    const { form, submitting } = this.props;
    const { soHead, soBody, region } = this.state;
    return (
      <div>
        <PageHeader
          breadcrumb={[
            <WhseSelect disabled />,
            this.msg('shippingOrder'),
            this.props.params.soNo,
          ]}
        >
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={submitting} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard
              soHead={soHead}
              form={form}
              editable={this.state.editable}
              handleOwnerChange={this.handleOwnerChange}
            />
            <MagicCard bodyStyle={{ padding: 0 }} >
              <Tabs defaultActiveKey="orderDetails" onChange={this.handleTabChange}>
                <TabPane tab="订单明细" key="orderDetails">
                  <DetailsPane
                    soBody={soBody}
                    detailEnable
                    selectedOwner={soHead.owner_partner_id}
                    form={form}
                    editable={this.state.editable}

                  />
                </TabPane>
                <TabPane tab="收货人" key="receiver">
                  <ReceiverPane
                    form={form}
                    selectedOwner={soHead.owner_partner_id}
                    soHead={soHead}
                    region={region}
                    onRegionChange={this.handleRegionChange}
                  />
                </TabPane>
                <TabPane tab="承运人" key="carrier">
                  <CarrierPane
                    form={form}
                    selectedOwner={soHead.owner_partner_id}
                    soHead={soHead}
                    onCarrierChange={this.handleCarrierChange}
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
