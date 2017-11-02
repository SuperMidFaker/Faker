import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideWarehouseModal, addWarehouse } from 'common/reducers/cwmWarehouse';
import { loadWhseContext } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';
import Cascader from 'client/components/RegionCascader';

const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    tenantName: state.account.tenantName,
    visible: state.cwmWarehouse.warehouseModal.visible,
  }),
  { hideWarehouseModal, addWarehouse, loadWhseContext }
)
@Form.create()
export default class WareHouseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    isBonded: 0,
    province: '',
    city: '',
    district: '',
    street: '',
    regionCode: null,
  }
  msg = formatMsg(this.props.intl)
  handleChange = (e) => {
    this.setState({
      isBonded: e.target.value,
    });
  }
  handleCancel = () => {
    this.props.hideWarehouseModal();
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { whseMode, whseCode, whseName, whseAddress, whseTel, ftzWhseCode } = values;
        const { tenantName } = this.props;
        const { isBonded, province, city, district, street, regionCode } = this.state;
        this.props.addWarehouse({ whseMode,
          whseCode,
          whseName,
          whseAddress,
          isBonded,
          tenantName,
          province,
          city,
          district,
          street,
          regionCode,
          whseTel,
          ftzWhseCode,
        }).then((result) => {
          if (!result.error) {
            message.info('添加仓库成功');
            this.props.hideWarehouseModal();
            this.props.loadWhseContext();
          } else {
            message.info(result.error.message);
          }
        });
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
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { isBonded, province, city, district, street } = this.state;
    const regionValues = [province, city, district, street];
    return (
      <Modal maskClosable={false} title="添加仓库" visible={this.props.visible} onCancel={this.handleCancel} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="仓库模式" >
            {
              getFieldDecorator('whseMode', {
              })(<Radio.Group>
                <Radio.Button value="PRI">自营仓库</Radio.Button>
                <Radio.Button value="PUB">公共仓库</Radio.Button>
              </Radio.Group>)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库代码" >
            {
              getFieldDecorator('whseCode', {
                rules: [{ required: true, messages: 'please input whseCode' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库名称" >
            {
              getFieldDecorator('whseName', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          {isBonded === 1 && <FormItem {...formItemLayout} label="海关仓库编号" >
            {getFieldDecorator('ftzWhseCode', {
            })(<Input />)}
          </FormItem>}
          <FormItem {...formItemLayout} label="仓库地址" >
            <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} />
          </FormItem>
          <FormItem {...formItemLayout} label="详细地址" >
            {
              getFieldDecorator('whseAddress')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="联系电话" >
            {
              getFieldDecorator('whseTel')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="保税性质" >
            <Radio.Group value={isBonded} onChange={this.handleChange}>
              <Radio.Button value={0}>非保税仓</Radio.Button>
              <Radio.Button value={1}>保税仓</Radio.Button>
            </Radio.Group>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
