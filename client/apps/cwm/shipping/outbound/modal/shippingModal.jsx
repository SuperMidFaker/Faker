import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Select, DatePicker, Form, Modal, Input, Radio, message } from 'antd';
import { closeShippingModal, shipConfirm, loadPickDetails, loadOutboundHead, loadShipDetails } from 'common/reducers/cwmOutbound';
import { WRAP_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.cwmOutbound.shippingModal.visible,
    pickedQty: state.cwmOutbound.shippingModal.pickedQty,
    skuPackQty: state.cwmOutbound.shippingModal.skuPackQty,
    id: state.cwmOutbound.shippingModal.id,
    loginId: state.account.loginId,
    username: state.account.username,
    submitting: state.cwmOutbound.submitting,
  }),
  { closeShippingModal, shipConfirm, loadPickDetails, loadOutboundHead, loadShipDetails }
)
@Form.create()
export default class ShippingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    outboundNo: PropTypes.string.isRequired,
    shipMode: PropTypes.string.isRequired,
    selectedRows: PropTypes.array,
    resetState: PropTypes.func,
  }
  state = {
    shippingMode: 0,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible && this.props.visible !== nextProps.visible) {
      this.props.form.setFieldsValue({
        waybill: '',
        pieces: '',
        volumes: '',
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeShippingModal();
  }
  handleChange = (e) => {
    this.setState({ shippingMode: e.target.value });
  }
  handleSubmit = () => {
    const { outboundNo, skuPackQty, pickedQty, username, shipMode, selectedRows, id } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let list = [];
        const outbounddata = { no: outboundNo,
          pieces: values.pieces,
          volumes: values.volumes,
          pack_type: values.pack,
        };
        if (shipMode === 'single') {
          list.push({ id,
            shipped_qty: pickedQty,
            shipped_pack_qty: pickedQty / skuPackQty,
            drop_id: '',
            waybill: values.waybill,
            shipped_type: this.state.shippingMode,
          });
        } else {
          list = list.concat(selectedRows.map(sr => ({
            id: sr.id,
            shipped_qty: sr.picked_qty,
            shipped_pack_qty: sr.picked_qty / sr.sku_pack_qty,
            drop_id: '',
            waybill: values.waybill,
            shipped_type: this.state.shippingMode,
          })));
        }
        this.props.shipConfirm(outbounddata, list, username, values.shippedBy, values.shippedDate).then((result) => {
          if (!result.error) {
            this.props.closeShippingModal();
            this.props.loadPickDetails(this.props.outboundNo);
            this.props.loadOutboundHead(this.props.outboundNo);
            this.props.resetState();
            this.props.loadShipDetails(this.props.outboundNo);
          } else if (result.error.message === 'normal_relno_empty') {
            message.error('对应保税普通出库未完成备案');
          } else if (result.error.message === 'normal_cusdeclno_empty') {
            message.error('对应保税普通出库未完成清关');
          } else {
            message.error(result.error.message);
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, username, submitting } = this.props;
    const { shippingMode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal maskClosable={false} title="发货确认" onOk={this.handleSubmit} onCancel={this.handleCancel} confirmLoading={submitting} visible={this.props.visible}>
        <Form>
          <FormItem {...formItemLayout} label="发货方式" >
            <Radio.Group value={shippingMode} onChange={this.handleChange}>
              <Radio.Button value={0}>配送单发货</Radio.Button>
              <Radio.Button value={1}>装车单发货</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem {...formItemLayout} label="配送面单号" >
            {
              getFieldDecorator('waybill', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="包装类型">
            {
              getFieldDecorator('pack', {
              })(<Select allowClear>
                {WRAP_TYPE.map(wt => <Option value={wt.value} key={wt.value}>{wt.text}</Option>)}
              </Select>)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="总包装件数">
            {
              getFieldDecorator('pieces', {
              })(<Input type="number" />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="总体积">
            {
              getFieldDecorator('volumes', {
              })(<Input type="number" />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货人员" >
            {
              getFieldDecorator('shippedBy', {
                initialValue: username,
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="发货时间" >
            {
              getFieldDecorator('shippedDate', {
                initialValue: moment(new Date()),
              })(<DatePicker showTime format="YYYY/MM/DD HH:mm" />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
