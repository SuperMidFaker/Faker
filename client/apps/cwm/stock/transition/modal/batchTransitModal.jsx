
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Modal, Select, Form, DatePicker, Row, Col, Input } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeBatchTransitModal, batchTransit } from 'common/reducers/cwmTransition';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visible: state.cwmTransition.batchTransitModal.visible,
  }),
  { closeBatchTransitModal, batchTransit }
)
export default class BatchTransitModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
  }
  state = {
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeBatchTransitModal();
    this.setState({
      location: '',
    });
  }

  handleSubmit = () => {
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="批量转移" width={800} onCancel={this.handleCancel} visible={this.props.visible} onOk={this.handleSubmit} okText="确认转移">
        <Alert message="已选择 项 库存数量总计" type="info" />
        <Form>
          <Row gutter={16} className="form-row">
            <Col span={8}>
              <FormItem {...formItemLayout} label="所属货主">
                <Select disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="SKU">
                <Select disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="商品货号">
                <Input disabled />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16} className="form-row">
            <Col span={8}>
              <FormItem {...formItemLayout} label="货物属性">
                <Select disabled />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="是否分拨">
                <Select disabled />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16} className="form-row">
            <Col span={8}>
              <FormItem {...formItemLayout} label="品名">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="批次号">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="序列号">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="库别">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="包装情况">
                <Input placeholder="" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16} className="form-row">
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性1">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性2">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性3">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性4">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性5">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性6">
                <Input placeholder="" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="失效日期">
                <DatePicker placeholder="" style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性7">
                <DatePicker placeholder="" style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label="扩展属性8">
                <DatePicker placeholder="" style={{ width: '100%' }} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="转移原因">
                <Input placeholder="" />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
