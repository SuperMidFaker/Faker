import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Popover, Button, Form, Input, Row, Col, Icon } from 'antd';
import { updateStandbyInfo, loadStandbyInfo } from 'common/reducers/cmsCiqDeclare';

const FormItem = Form.Item;

@Form.create()
@connect(
  () => ({}),
  { updateStandbyInfo, loadStandbyInfo }
)
export default class StandbyPopover extends Component {
  static propTypes = {
    goodsId: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    info: {},
  }
  componentWillMount() {
    this.props.loadStandbyInfo(this.props.goodsId).then((result) => {
      if (!result.error) {
        this.setState({
          info: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsId !== this.props.goodsId && nextProps.goodsId) {
      this.props.form.resetFields();
      this.props.loadStandbyInfo(nextProps.goodsId).then((result) => {
        if (!result.error) {
          this.setState({
            info: result.data,
          });
        }
      });
    }
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleOk = () => {
    const { form, goodsId } = this.props;
    form.validateFields((err, values) => {
      this.props.updateStandbyInfo(values, goodsId);
      this.setState({
        visible: false,
      });
    });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { info } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const content = (
      <Form className="form-layout-compact">
        <FormItem {...formItemLayout} colon={false} label="备用一">
          {getFieldDecorator('standby_1', {
            initialValue: info.standby_1,
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} colon={false} label="备用二">
          {getFieldDecorator('standby_2', {
            initialValue: info.standby_2,
          })(<Input />)}
        </FormItem>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" style={{ float: 'right' }} onClick={this.handleOk}>确定</Button>
          </Col>
        </Row>
      </Form>
    );
    return (
      <Popover
        title="备用信息"
        content={content}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Button
          type="primary"
          size="small"
          ghost
        ><Icon type="ellipsis" /></Button>
      </Popover>
    );
  }
}
