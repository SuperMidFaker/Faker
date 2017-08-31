import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideEditWhseModal, editWarehouse } from 'common/reducers/cwmWarehouse';
import { loadWhseContext } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';
import Cascader from 'client/components/RegionCascader';

const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.editWarehouseModal.visible,
    warehouse: state.cwmWarehouse.editWarehouseModal.warehouse,
  }),
  { hideEditWhseModal, editWarehouse, loadWhseContext }
)
@Form.create()
export default class WareHouseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    warehouse: PropType.object.isRequired,
  }
  state = {
    bonded: 0,
    province: '',
    city: '',
    district: '',
    street: '',
    regionCode: null,
  }
  componentWillMount() {
    this.setState({
      bonded: this.props.warehouse.bonded,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.warehouse.code !== this.props.warehouse.code) {
      this.setState({
        bonded: nextProps.warehouse.bonded,
        province: nextProps.warehouse.whse_province,
        city: nextProps.warehouse.whse_city,
        district: nextProps.warehouse.whse_district,
        street: nextProps.warehouse.whse_street,
        regionCode: nextProps.warehouse.whse_region_code,
      });
      this.props.form.setFieldsValue({
        whseCode: nextProps.warehouse.code,
        whseName: nextProps.warehouse.name,
        whseAddress: nextProps.warehouse.whse_address,
        tel: nextProps.warehouse.tel,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleChange = (e) => {
    this.setState({
      bonded: e.target.value,
    });
  }
  handleCancel = () => {
    this.props.hideEditWhseModal();
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { whseCode, whseName, whseAddress, tel, customsWhseCode } = values;
        const { tenantId, loginId } = this.props;
        const { bonded, province, city, district, street, regionCode } = this.state;
        this.props.editWarehouse(
          whseCode,
          whseName,
          whseAddress,
          bonded,
          tenantId,
          loginId,
          province,
          city,
          district,
          street,
          regionCode,
          tel,
          customsWhseCode,
        ).then(
          (result) => {
            if (!result.error) {
              message.info('编辑仓库成功');
              this.props.hideEditWhseModal();
              this.props.loadWhseContext(tenantId);
            }
          }
        );
      }
    });
  }
  handleRegionChange = (value) => {
    const [code, province, city, district, street] = value;
    this.setState({
      province,
      city,
      district,
      street,
      regionCode: code,
    });
  }
  render() {
    const { form: { getFieldDecorator }, warehouse } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { province, city, district, street } = this.state;
    const regionValues = [province, city, district, street];
    return (
      <Modal title="编辑仓库" visible={this.props.visible} onCancel={this.handleCancel} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="仓库代码" >
            {
              getFieldDecorator('whseCode', {
                initialValue: warehouse.code,
              })(<Input disabled />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库名称" >
            {
              getFieldDecorator('whseName', {
                rules: [{ required: true, messages: 'please input whseName' }],
                initialValue: warehouse.name,
              })(<Input />)
            }
          </FormItem>
          {this.state.bonded === 1 && <FormItem {...formItemLayout} label="海关编号" >
            {getFieldDecorator('customsWhseCode', {
              initialValue: warehouse.customs_whse_code,
            })(<Input />)}
          </FormItem>}
          <FormItem {...formItemLayout} label="仓库地址" >
            <Cascader region={regionValues} onChange={this.handleRegionChange} />
          </FormItem>
          <FormItem {...formItemLayout} label="详细地址" >
            {
              getFieldDecorator('whseAddress', {
                initialValue: warehouse.whse_address,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="联系电话" >
            {
              getFieldDecorator('tel', {
                initialValue: warehouse.tel,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="保税性质" >
            <Radio.Group value={this.state.bonded} onChange={this.handleChange}>
              <Radio.Button value={0}>非保税仓</Radio.Button>
              <Radio.Button value={1}>保税仓</Radio.Button>
            </Radio.Group>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
