import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Select, Checkbox, Modal, Icon, Input, Button, Form, Tabs, message } from 'antd';
import { connect } from 'react-redux';
import { showOpenApiConfigModal, updateDevAppSetting, genOAuthToken } from 'common/reducers/hubDevApp';
import { loadPartners } from 'common/reducers/partner';
import { loadPartnerFlowList } from 'common/reducers/scofFlow';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    visible: state.hubDevApp.openapiConfigModal.visible,
    app: state.hubDevApp.app,
    flows: state.scofFlow.partnerFlows,
    partners: state.partner.partners,
  }),
  {
    showOpenApiConfigModal, updateDevAppSetting, genOAuthToken, loadPartners, loadPartnerFlowList,
  }
)
@Form.create()
export default class AppOpenApiModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    orderCreate: { enabled: false, customer_partner_id: null, flow_id: null },
    token: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      let customerPartnerId;
      if (nextProps.app.openapi) {
        const openapi = JSON.parse(nextProps.app.openapi);
        let orderCreateApi = openapi['order.create'];
        if (orderCreateApi) {
          orderCreateApi.enabled = true;
          customerPartnerId = orderCreateApi.customer_partner_id;
        } else {
          orderCreateApi = { enabled: false };
        }
        this.setState({
          orderCreate: {
            enabled: orderCreateApi.enabled,
            customer_partner_id: orderCreateApi.customer_partner_id,
            flow_id: orderCreateApi.flow_id,
          },
        });
      }
      this.setState({ token: nextProps.app.access_token });
      this.props.loadPartners({ role: PARTNER_ROLES.CUS });
      this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
    }
  }
  msg = formatMsg(this.props.intl);
  handleOrderCreateCheck =(ev) => {
    let orderCreate = { ...this.state.orderCreate };
    orderCreate.enabled = ev.target.checked;
    if (!orderCreate.enabled) {
      orderCreate = { enabled: false };
    }
    this.setState({ orderCreate });
  }
  handleOrderCustomerChange = (customerPartnerId) => {
    const orderCreate = { ...this.state.orderCreate };
    orderCreate.customer_partner_id = customerPartnerId;
    this.setState({ orderCreate });
    this.props.loadPartnerFlowList({ partnerId: customerPartnerId });
  }
  handleFlowChange = (flowId) => {
    const orderCreate = { ...this.state.orderCreate };
    orderCreate.flow_id = flowId;
    this.setState({ orderCreate });
  }
  handleOAuthTokenGen = () => {
    const { app } = this.props;
    this.props.genOAuthToken(app.app_id, app.app_secret).then((result) => {
      if (!result.error) {
        message.success('授权Token生成成功');
        this.setState({ token: result.data.access_token });
      }
    });
  }
  handleCancel = () => {
    this.props.showOpenApiConfigModal(false);
    this.setState({ orderCreate: { enabled: false }, token: null });
  }
  handleOk = () => {
    const { orderCreate } = this.state;
    const { app } = this.props;
    const openapi = {};
    if (orderCreate.enabled) {
      if (!orderCreate.flow_id) {
        message.error('请配置订单创建流程参数');
        return;
      }
      openapi['order.create'] = {
        customer_partner_id: orderCreate.customer_partner_id,
        flow_id: orderCreate.flow_id,
      };
    }
    this.props.updateDevAppSetting({ openapi: JSON.stringify(openapi) }, app.id).then((result) => {
      if (!result.error) {
        this.handleCancel();
      }
    });
  }
  render() {
    const { visible, partners, flows } = this.props;
    const { orderCreate, token } = this.state;
    return (
      <Modal
        title="OPENAPI配置"
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        destroyOnClose
        width={800}
        style={{ top: 24 }}
        bodyStyle={{ padding: 0 }}
        maskClosable={false}
      >
        <Tabs
          defaultActiveKey="info"
          tabPosition="left"
          style={{ height: 640 }}
        >
          <TabPane tab={<span><Icon type="profile" />订单创建接口</span>} key="info">
            <Form layout="vertical">
              <FormItem>
                <Checkbox checked={orderCreate.enabled} onChange={this.handleOrderCreateCheck}>
                是否启用
                </Checkbox>
              </FormItem>
              <FormItem label="订单客户参数">
                <Select
                  value={orderCreate.customer_partner_id}
                  disabled={!orderCreate.enabled}
                  showSearch
                  allowClear
                  onChange={this.handleOrderCustomerChange}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 360 }}
                >
                  {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
                </Select>
              </FormItem>
              <FormItem label="订单流程参数" required>
                <Select
                  value={orderCreate.flow_id}
                  disabled={!orderCreate.enabled}
                  showSearch
                  allowClear
                  onChange={this.handleFlowChange}
                >
                  {flows.map(data => <Option key={data.id} value={data.id}>{data.name}</Option>)}
                </Select>
              </FormItem>
              <FormItem label="授权Token">
                <Input disabled value={token} />
              </FormItem>
              <FormItem>
                {!token &&
                <Button icon="key" onClick={this.handleOAuthTokenGen}>{this.msg('generate')}</Button>}
              </FormItem>
            </Form>
          </TabPane>
        </Tabs>

      </Modal>
    );
  }
}

