import React, { Component, PropTypes } from 'react';
import { Button, Popover, Form, Input, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class PackagePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
    innerPacking: '',
    box: '',
    tray: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handlePackingChange = (e) => {
    this.setState({
      innerPacking: e.target.value,
    });
  }
  handleBoxChange = (e) => {
    this.setState({
      box: this.state.innerPacking * e.target.value,
    });
  }
  handleTrayChange = (e) => {
    this.setState({
      tray: this.state.innerPacking * this.state.box * e.target.value,
    });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  handleOk = () => {
    this.setState({ visible: false });
  }
  render() {
    const data = this.props.data;
    const content = (
      <div>
        <Form>
          <FormItem label="主单位" labelCol={{ span: 6 }}>
            <Row gutter={8}>
              <Col span="8">
                <Input defaultValue="1" disabled />
              </Col>
            </Row>
          </FormItem>
          <FormItem label="内包装" labelCol={{ span: 6 }}>
            <Row gutter={8}>
              <Col span="8">
                <Input onChange={this.handlePackingChange} />
              </Col>
              <Col span="8">
                <Input disabled value={this.state.innerPacking} />
              </Col>
            </Row>
          </FormItem>
          <FormItem label="箱" labelCol={{ span: 6 }}>
            <Row gutter={8}>
              <Col span="8">
                <Input onChange={this.handleBoxChange} />
              </Col>
              <Col span="8">
                <Input disabled value={this.state.box} />
              </Col>
            </Row>
          </FormItem>
          <FormItem label="托盘" labelCol={{ span: 6 }}>
            <Row gutter={8}>
              <Col span="8">
                <Input onChange={this.handleTrayChange} />
              </Col>
              <Col span="8">
                <Input disabled value={this.state.tray} />
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <div className="toolbar-right">
              <Button onClick={this.handleCancel}>取消</Button>
              <Button onClick={this.handleOk}>确定</Button>
            </div>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="包装代码" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button>{data}</Button>
      </Popover>
    );
  }
}
