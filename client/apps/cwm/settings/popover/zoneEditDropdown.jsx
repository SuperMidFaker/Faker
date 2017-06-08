import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, message, Popover, Icon, Input, Button, Dropdown, Menu } from 'antd';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
const FormItem = Form.Item;
import { updateZone, loadZones, loadLocations } from 'common/reducers/cwmWarehouse';
@injectIntl
@connect(
  () => ({}),
  { updateZone, loadZones, loadLocations }
)
@Form.create()
export default class ZoneEditPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    popoverVisible: false,
    dropdownVisible: false,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ popoverVisible: visible });
    if (this.state.popoverVisible) {
      this.setState({
        dropdownVisible: !this.state.popoverVisible,
      });
    }
  }
  editZone = (e) => {
    e.preventDefault();
    const { id, whseCode } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        this.props.updateZone(whseCode, zoneCode, id, zoneName).then(
          (result) => {
            if (!result.error) {
              message.info('保存成功');
              this.props.loadZones(whseCode).then(
                (data) => {
                  if (!data.error && data.data.length !== 0) {
                    this.props.stateChange(data.data[0].zone_code, data.data);
                    this.props.loadLocations(whseCode, data.data[0].zone_code);
                  }
                }
              );
            }
          }
        );
      }
    });
  }
  handleDropdownVisible = () => {
    this.setState({
      dropdownVisible: !this.state.dropdownVisible,
    });
  }
  handleZoneDelete = () => {
    this.props.deleteZone(this.props.zoneCode);
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const zonePopoverContent = (
      <Form>
        <FormItem>
          {
            getFieldDecorator('zoneCode', {
              rules: [{ required: true, messages: 'please input zoneCode' }],
            })(<Input placeholder="库区编号" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('zoneName', {
              rules: [{ required: true, messages: 'please input zoneName' }],
            })(<Input placeholder="库区描述" />)
          }
        </FormItem>
        <FormItem>
          <Button size="large" type="primary" style={{ width: '100%', marginTop: 10 }} onClick={this.editZone}>确定</Button>
        </FormItem>
      </Form>);
    return (
      <Dropdown visible={this.state.dropdownVisible} overlay={
        <Menu>
          <Menu.Item key="edit">
            <Popover content={zonePopoverContent}
              title="编辑库区" trigger="click" visible={this.state.popoverVisible}
              onVisibleChange={this.handleVisibleChange}
            >
              <a><Icon type="edit" /> 编辑</a>
            </Popover>
          </Menu.Item>
          <Menu.Item key="delete">
            <a onClick={this.handleZoneDelete}><Icon type="delete" /> 删除</a>
          </Menu.Item>
        </Menu>}
      >
        <span style={{ float: 'right' }} onClick={this.handleDropdownVisible}><Icon type="ellipsis" /></span>
      </Dropdown>
    );
  }
}
