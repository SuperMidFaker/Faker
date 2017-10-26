import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { loadReceivers, addReceiver, toggleReceiverModal, updateReceiver } from 'common/reducers/cwmWarehouse';
import Cascader from 'client/components/RegionCascader';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;


@injectIntl
@connect(
  state => ({
    visible: state.cwmWarehouse.receiverModal.visible,
    receiver: state.cwmWarehouse.receiverModal.receiver,
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
  }),
  { loadReceivers, addReceiver, toggleReceiverModal, updateReceiver }
)
@Form.create()
export default class WhseReceiversModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.array,
  }
  state = {
    region: {
      province: '',
      city: '',
      district: '',
      street: '',
      region_code: null,
    },
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      if (nextProps.receiver.id) {
        const { receiver: {
          province,
          city,
          district,
          street,
          region_code,
        } } = nextProps;
        this.setState({
          region: {
            province,
            city,
            district,
            street,
            region_code,
          },
        });
        this.props.form.setFieldsValue(nextProps.receiver);
      } else {
        this.setState({
          region: {
            province: '',
            city: '',
            district: '',
            street: '',
            region_code: null,
          },
        });
        this.props.form.setFieldsValue({});
      }
    }
  }

  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleReceiverModal(false);
  }
  handleOk = () => {
    const { form, tenantId, whseCode, loginId, whseOwners, whseTenantId, receiver } = this.props;
    const { region } = this.state;
    let ownerTenantId = null;
    const recv = form.getFieldsValue();
    const owner = whseOwners.find(item => item.owner_partner_id === receiver.owner_partner_id);
    if (owner) {
      ownerTenantId = owner.owner_tenant_id;
    }
    const data = Object.assign({}, recv, { ...region,
      whse_code: whseCode,
      owner_tenant_id: ownerTenantId,
      tenantId,
      loginId });
    if (receiver.id) {
      this.props.updateReceiver({ ...data, id: receiver.id }).then(() => {
        this.props.loadReceivers(whseCode, whseTenantId);
        this.props.toggleReceiverModal(false);
      });
    } else {
      this.props.addReceiver(data).then(() => {
        this.props.loadReceivers(whseCode, whseTenantId);
        this.props.toggleReceiverModal(false);
      });
    }
  }
  handleRegionChange = (value) => {
    const [code, province, city, district, street] = value;
    const region = { region_code: code, province, city, district, street };
    this.setState({ region });
  }
  render() {
    const { visible, form: { getFieldDecorator }, whseOwners } = this.props;
    const { region } = this.state;
    const regionValues = [region.province, region.city, region.district, region.street];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal maskClosable={false} title="添加收货人" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Form layout="horizontal">
          <FormItem label="代码" required {...formItemLayout}>
            {getFieldDecorator('code')(<Input />)}
          </FormItem>
          <FormItem label="名称" required {...formItemLayout}>
            {getFieldDecorator('name')(<Input required />)}
          </FormItem>
          <FormItem label="海关编码" {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input />)}
          </FormItem>
          <FormItem label="收货仓库号" {...formItemLayout}>
            {getFieldDecorator('ftz_whse_code')(<Input />)}
          </FormItem>
          <FormItem label="关联货主" required {...formItemLayout}>
            {getFieldDecorator('owner_partner_id')(
              <Select id="select"
                showSearch
                placeholder=""
                optionFilterProp="children"
                notFoundContent=""
              >
                {
                  whseOwners.map(pt => (
                    <Option searched={`${pt.owner_code}${pt.owner_name}`}
                      value={pt.owner_partner_id} key={pt.owner_partner_id}
                    >
                      {pt.owner_code ? `${pt.owner_code} | ${pt.owner_name}` : pt.owner_name}
                    </Option>)
                  )
                }
              </Select>
              )}
          </FormItem>

          <FormItem label="地区" required {...formItemLayout}>
            <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} />
          </FormItem>
          <FormItem label="详细地址" {...formItemLayout}>
            {getFieldDecorator('address')(<Input />)}
          </FormItem>
          <FormItem label="邮政编码" {...formItemLayout}>
            {getFieldDecorator('post_code')(<Input />)}
          </FormItem>
          <FormItem label="联系人" {...formItemLayout} >
            {getFieldDecorator('contact')(<Input />)}
          </FormItem>
          <FormItem label="手机" {...formItemLayout} >
            {getFieldDecorator('phone')(<Input />)}
          </FormItem>
          <FormItem label="电话" {...formItemLayout} >
            {getFieldDecorator('number')(<Input />)}
          </FormItem>

        </Form>
      </Modal>
    );
  }
}
