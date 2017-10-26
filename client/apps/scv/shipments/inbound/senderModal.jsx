import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Select, message } from 'antd';
import RegionCascader from 'client/components/RegionCascader';
import { closeModal, sendInboundShipment } from 'common/reducers/scvInboundShipments';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.scvInboundShipments.sendModal.visible,
    shipment: state.scvInboundShipments.sendModal.shipment,
    brokers: state.scvInboundShipments.brokerPartners,
    transps: state.scvInboundShipments.transpPartners,
    tenantName: state.account.tenantName,
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    loginId: state.account.loginId,
  }),
  { closeModal, sendInboundShipment }
)
@Form.create()
export default class SendModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    shipment: PropTypes.shape({
      trans_mode: PropTypes.string.isRequired,
      bl_no: PropTypes.string.isRequired,
      hawb: PropTypes.string.isRequired,
    }).isRequired,
    brokers: PropTypes.arrayOf(PropTypes.shape({
      partner_id: PropTypes.number.isRequired,
      tid: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      partner_code: PropTypes.string.isRequired,
    })).isRequired,
    transps: PropTypes.arrayOf(PropTypes.shape({
      partner_id: PropTypes.number.isRequired,
      tid: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      partner_code: PropTypes.string.isRequired,
    })).isRequired,
    closeModal: PropTypes.func.isRequired,
    sendInboundShipment: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    region: {
      code: '',
      province: '',
      city: '',
      district: '',
      street: '',
    },
  }
  handleDestRegionChange = (region) => {
    const [code, province, city, district, street] = region;
    this.setState({
      region: {
        code, province, city, district, street,
      },
    });
  }
  handleCancel = () => {
    this.props.closeModal();
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { brokers, transps, shipment, tenantName, tenantId,
          loginId, loginName } = this.props;
        const { region } = this.state;
        const form = this.props.form.getFieldsValue();
        const broker = brokers.filter(cus => cus.partner_id === form.brkPartnerId)[0];
        const trs = transps.filter(trp => trp.partner_id === form.trsPartnerId)[0];
        this.props.sendInboundShipment({
          shipment,
          region,
          broker,
          trs,
          tenant: { name: tenantName, id: tenantId, loginId, loginName },
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.setState({ region: {} });
            this.props.closeModal();
            this.props.reload();
          }
        });
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, brokers, transps, form: { getFieldDecorator } } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('sendShipment')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form layout="horizontal">
          <FormItem label={this.msg('broker')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('brkPartnerId', {
              rules: [{ required: true, message: 'broker must be select', type: 'number' }],
            })(<Select showSearch optionFilterProp="searched" allowClear>
              {
                brokers.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>
                ))
              }
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('sendTrucking')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('trsPartnerId', {
              rules: [{ required: true, message: 'Trucking provider must be selected', type: 'number' }],
            })(<Select showSearch optionFilterProp="searched" allowClear>
              {
                transps.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>
                ))
              }
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('transportDest')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <RegionCascader onChange={this.handleDestRegionChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
