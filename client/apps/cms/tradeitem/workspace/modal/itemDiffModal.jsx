import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Col, Modal, Form, Input, Row } from 'antd';
import { toggleItemDiffModal } from 'common/reducers/cmsTradeitem';

const FormItem = Form.Item;

@connect(
  state => ({
    visible: state.cmsTradeitem.itemDiffModal.visible,
    master: state.cmsTradeitem.itemDiffModal.master,
    data: state.cmsTradeitem.itemDiffModal.data,
  }),
  { toggleItemDiffModal }
)
@Form.create()
export default class ItemDiffModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    baselineTitle: PropTypes.string,
    currentTitle: PropTypes.string,
  }
  handleCancel = () => {
    this.props.toggleItemDiffModal(false);
  }
  render() {
    const { master, data } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const title = (<div>
      <span>商品归类数据对比</span>
      <div className="toolbar-right">
        <Button onClick={this.handleCancel}>关闭</Button>
      </div>
    </div>);
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        visible={this.props.visible}
        closable={false}
        footer={null}
        wrapClassName="fullscreen-modal"
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="基准数据">
              <Form className="form-layout-compact">
                <FormItem {...formItemLayout} label="HS编码">
                  <Input value={master.hscode} />
                </FormItem>
                <FormItem {...formItemLayout} label="中文品名">
                  <Input value={master.g_name} />
                </FormItem>
                <FormItem {...formItemLayout} label="规范申报要素">
                  <Input value={master.element} />
                </FormItem>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="当前数据">
              <Form className="form-layout-compact">
                <FormItem {...formItemLayout} label="HS编码">
                  <Input value={data.hscode} />
                </FormItem>
                <FormItem {...formItemLayout} label="中文品名">
                  <Input value={data.g_name} />
                </FormItem>
                <FormItem {...formItemLayout} label="规范申报要素">
                  <Input value={data.element} />
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>

      </Modal>
    );
  }
}
