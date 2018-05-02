import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import Cascader from 'client/components/RegionCascader';
import { hideEditWhseModal, editWarehouse } from 'common/reducers/cwmWarehouse';
import { loadWhse, loadWhseContext } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    loginId: state.account.loginId,
    visible: state.cwmWarehouse.editWarehouseModal.visible,
    warehouse: state.cwmWarehouse.editWarehouseModal.warehouse,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  {
    hideEditWhseModal, editWarehouse, loadWhseContext, loadWhse,
  }
)
@Form.create()
export default class WareHouseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    warehouse: PropType.shape({ code: PropType.string }).isRequired,
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
        whseTel: nextProps.warehouse.whse_tel,
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
        const {
          whseMode, whseCode, whseName, whseAddress, whseTel, ftzWhseCode,
        } = values;
        const { loginId, warehouse, defaultWhse } = this.props;
        const {
          bonded, province, city, district, street, regionCode,
        } = this.state;
        this.props.editWarehouse({
          whseMode,
          whseCode,
          whseName,
          whseAddress,
          bonded,
          loginId,
          province,
          city,
          district,
          street,
          regionCode,
          whseTel,
          ftzWhseCode,
        }).then((result) => {
          if (!result.error) {
            this.props.loadWhseContext();
            if (whseMode === 'PRI' && warehouse.code === defaultWhse.code && warehouse.whse_mode !== whseMode) {
              this.props.loadWhse(warehouse.code);
            }
            message.info('编辑仓库成功');
            this.props.hideEditWhseModal();
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
    const { form: { getFieldDecorator }, warehouse } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const {
      province, city, district, street,
    } = this.state;
    const regionValues = [province, city, district, street];
    return (
      <Modal maskClosable={false} title="编辑仓库" visible={this.props.visible} onCancel={this.handleCancel} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="仓库模式" >
            {
              getFieldDecorator('whseMode', {
                initialValue: warehouse.whse_mode,
              })(<Radio.Group>
                <Radio.Button value="PRI">自营仓库</Radio.Button>
                <Radio.Button value="PUB">公共仓库</Radio.Button>
              </Radio.Group>)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="保税性质" >
            <Radio.Group value={this.state.bonded} onChange={this.handleChange}>
              <Radio.Button value={0}>非保税仓</Radio.Button>
              <Radio.Button value={1}>保税仓</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem {...formItemLayout} label="仓库代码" >
            {
              getFieldDecorator('whseCode', {
                initialValue: warehouse.code,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库名称" >
            {
              getFieldDecorator('whseName', {
                rules: [{ required: true, message: 'please input whseName' }],
                initialValue: warehouse.name,
              })(<Input />)
            }
          </FormItem>
          {this.state.bonded === 1 && <FormItem {...formItemLayout} label="自贸区仓库号" >
            {getFieldDecorator('ftzWhseCode', {
              initialValue: warehouse.ftz_whse_code,
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
              getFieldDecorator('whseTel', {
                initialValue: warehouse.whse_tel,
              })(<Input />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
