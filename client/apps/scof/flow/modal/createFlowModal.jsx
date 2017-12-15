import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Select } from 'antd';
import { closeCreateFlowModal, saveFlow, loadScvTrackings } from 'common/reducers/scofFlow';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.visibleFlowModal,
    tenantId: state.account.tenantId,
    customerPartners: state.partner.partners,
  }),
  {
    closeCreateFlowModal, loadPartners, saveFlow, loadScvTrackings,
  }
)
@Form.create()
export default class CreateFlowModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    closeCreateFlowModal: PropTypes.func.isRequired,
  }
  state = { trackings: null }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.props.loadPartners({
        tenantId: this.props.tenantId,
        role: PARTNER_ROLES.CUS,
      });
    }
  }
  handleOk = () => {
    this.props.form.validateFields((err, fields) => {
      if (!err) {
        const customer = this.props.customerPartners.filter(pt => pt.id === fields.customer)[0];
        this.props.saveFlow({
          name: fields.name,
          tracking_id: fields.tracking,
          partner_tenant_id: customer.partner_tenant_id,
          partner_id: customer.id,
          partner_name: customer.name,
          tenantId: this.props.tenantId,
        }).then((result) => {
          if (!result.error) {
            this.handleCancel();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.closeCreateFlowModal();
    this.setState({ trackings: null });
  }
  handleCustomerSelect = (customerPid) => {
    const customer = this.props.customerPartners.filter(pt => pt.id === customerPid)[0];
    if (customer.partner_tenant_id !== -1) {
      this.props.loadScvTrackings(customer.partner_tenant_id).then((result) => {
        if (!result.error && result.data.length > 0) {
          this.setState({ trackings: result.data });
        } else {
          this.setState({ trackings: null });
        }
      });
    } else {
      this.setState({ trackings: null });
    }
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, customerPartners, form: { getFieldDecorator } } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('createFlow')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form layout="vertical">
          <FormItem label={this.msg('flowName')}>
            {
             getFieldDecorator('name', {
               rules: [{ required: true, message: '流程名称必填' }],
             })(<Input />)
           }
          </FormItem>
          <FormItem label={this.msg('flowCustomer')}>
            {
             getFieldDecorator('customer', {
               rules: [{ required: true, message: '流程对应客户必填' }],
             })(<Select showSearch optionFilterProp="children" onSelect={this.handleCustomerSelect}>
               {customerPartners.map(data => (
                 <Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
             </Select>)
            }
          </FormItem>
          {this.state.trackings &&
            <FormItem label={this.msg('customerTracking')}>
              {
               getFieldDecorator('tracking')(<Select>
                 {this.state.trackings.map(data => (
                   <Option key={data.id} value={data.id}>{data.name}</Option>))}
               </Select>)
              }
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }
}
