import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideEditWhseModal, editWarehouse } from 'common/reducers/cwmWarehouse';
import { loadWhseContext } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.editWarehouseModal.visible,
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
        const { whseCode, whseName, whseAddress } = values;
        const { tenantId, loginId } = this.props;
        const { bonded } = this.state;
        this.props.editWarehouse(
          whseCode,
          whseName,
          whseAddress,
          bonded,
          tenantId,
          loginId,
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
  render() {
    const { form: { getFieldDecorator }, warehouse } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
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
          <FormItem {...formItemLayout} label="仓库地址" >
            {
              getFieldDecorator('whseAddress', {
                initialValue: warehouse.address,
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
