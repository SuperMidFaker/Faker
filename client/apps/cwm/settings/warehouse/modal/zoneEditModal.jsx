import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, message, Input, Modal } from 'antd';
import { updateZone, loadZones, loadLocations, hideZoneModal } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cwmWarehouse.zoneModal.visible,
  }),
  {
    updateZone, loadZones, loadLocations, hideZoneModal,
  }
)
@Form.create()
export default class ZoneEditModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    zone: PropTypes.object.isRequired,
  }
  state = {
    popoverVisible: false,
    dropdownVisible: false,
  }
  msg = formatMsg(this.props.intl)
  editZone = (e) => {
    e.preventDefault();
    const { zone: { id }, whseCode } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        this.props.updateZone(whseCode, zoneCode, id, zoneName).then((result) => {
          if (!result.error) {
            message.info('保存成功');
            this.props.loadZones(whseCode).then((data) => {
              if (!data.error) {
                this.props.stateChange(data.data[0].zone_code, data.data);
                this.props.loadLocations(whseCode, data.data[0].zone_code);
                this.props.hideZoneModal();
              }
            });
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.hideZoneModal();
  }
  render() {
    const { form: { getFieldDecorator }, zone } = this.props;
    const zonePopoverContent = (
      <Form>
        <FormItem label="库区代码">
          {
            getFieldDecorator('zoneCode', {
              rules: [{ required: true, messages: 'please input zoneCode' }],
              initialValue: zone.zone_code,
            })(<Input placeholder="库区编号" />)
          }
        </FormItem>
        <FormItem label="库区名称">
          {
            getFieldDecorator('zoneName', {
              rules: [{ required: true, messages: 'please input zoneName' }],
              initialValue: zone.zone_name,
            })(<Input placeholder="库区描述" />)
          }
        </FormItem>
      </Form>);
    return (
      <Modal maskClosable={false} visible={this.props.visible} title="编辑库区" onCancel={this.handleCancel} onOk={this.editZone}>
        {zonePopoverContent}
      </Modal>
    );
  }
}
