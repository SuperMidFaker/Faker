import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Button, Table, Select, message } from 'antd';
import { closeSubFlowAuthModal, createProviderFlow, deleteProviderFlow } from 'common/reducers/scofFlow';
import RowAction from 'client/components/RowAction';
import { formatMsg } from '../message.i18n';

const { Option } = Select;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    submitting: state.scofFlow.submitting,
    visible: state.scofFlow.flowProviderModal.visible,
    flow: state.scofFlow.flowProviderModal.flow,
    providerList: state.scofFlow.flowGraph.providerFlows,
    vendorTenants: state.scofFlow.vendorTenants,
  }),
  {
    closeSubFlowAuthModal, createProviderFlow, deleteProviderFlow,
  }
)
export default class FlowProviderModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    flow: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
    providerList: PropTypes.shape({
      id: PropTypes.number.isRequired,
      tenant_id: PropTypes.number.isRequired,
    }),
  }
  state = {
    pendingProvider: { tenant_id: null },
  };
  msg = formatMsg(this.props.intl)
  handlePendingProviderSelect = (vendorTenantId) => {
    const pendingProvider = {
      tenant_id: vendorTenantId,
    };
    this.setState({ pendingProvider });
  }
  handleSaveProvider = () => {
    const { pendingProvider } = this.state;
    const { flow } = this.props;
    this.props.createProviderFlow(flow.id, pendingProvider.tenant_id).then((result) => {
      if (result.error) {
        if (result.error.message === 'provider_customer_norel') {
          message.error('提供方未与本租户建立客户关系', 10);
        } else {
          message.error(result.error.message, 10);
        }
      } else {
        this.setState({ pendingProvider: { tenant_id: null } });
        message.info('保存成功', 5);
      }
    });
  }
  handleDelete = (subFlowId) => {
    this.props.deleteProviderFlow(subFlowId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
      }
    });
  }
  handleCancel = () => {
    this.props.closeSubFlowAuthModal();
  }
  columns = [{
    title: '已授权提供方',
    dataIndex: 'tenant_id',
    render: (provider) => {
      const vendor = this.props.vendorTenants.filter(vtopt =>
        vtopt.partner_tenant_id === provider)[0];
      return vendor && vendor.name;
    },
  }, {
    width: 80,
    render: (o, record) =>
      <RowAction shape="circle" confirm="确定删除?" onConfirm={() => this.handleDelete(record.id)} icon="delete" />,
  }];
  render() {
    const { pendingProvider } = this.state;
    const {
      visible, vendorTenants, providerList, flow, submitting,
    } = this.props;
    return (
      <Modal
        title={flow.name}
        visible={visible}
        maskClosable={false}
        footer={[]}
        onCancel={this.handleCancel}
      >
        <Table
          size="middle"
          pagination={false}
          columns={this.columns}
          dataSource={providerList}
          rowKey="id"
        />
        <Form layout="inline">
          <FormItem>
            <Select allowClear showSearch value={pendingProvider.tenant_id} onChange={this.handlePendingProviderSelect} style={{ width: '200px' }}>
              {
                vendorTenants.filter(vt =>
                  providerList.filter(pl => pl.tenant_id === vt.partner_tenant_id).length === 0)
                .map(opt =>
                  <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
            }
            </Select>
          </FormItem>
          <FormItem>
            <Button type="primary" disabled={!pendingProvider.tenant_id} loading={submitting} onClick={this.handleSaveProvider} icon="plus">新增</Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

