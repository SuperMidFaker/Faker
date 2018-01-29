import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Col, Modal, Form, Input, Row, Select } from 'antd';
import { toggleItemDiffModal } from 'common/reducers/cmsTradeitem';
import { CMS_HSCODE_BRAND_TYPE, CMS_HSCODE_EXPORT_PREFER } from 'common/constants';

const FormItem = Form.Item;
const { Option } = Select;

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
  state = {
    masterModel: [],
    masterOthers: '',
    dataModel: [],
    dataOthers: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const masterOthers = nextProps.master.g_model ? nextProps.master.g_model.split('|').pop() : '';
      const dataOthers = nextProps.data.g_model ? nextProps.data.g_model.split('|').pop() : '';
      this.setState({
        masterModel: nextProps.master.g_model.split('|'),
        masterOthers,
        dataModel: nextProps.data.g_model.split('|'),
        dataOthers,
      });
    }
  }
  handleCancel = () => {
    this.props.toggleItemDiffModal(false);
  }
  render() {
    const { master, data } = this.props;
    const {
      masterModel, masterOthers, dataModel, dataOthers,
    } = this.state;
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
                {master.element && master.element.split(';').map((item, index) => {
                  if (item && index === 0) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Select value={masterModel[0]}>
                          {CMS_HSCODE_BRAND_TYPE.map(type => (
                            <Option key={type.value} value={type.value}>
                              {type.value} | {type.text}
                            </Option>))}
                        </Select>
                      </FormItem>
                    );
                  } else if (item && index === 1) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Select value={masterModel[1]}>
                          {CMS_HSCODE_EXPORT_PREFER.map(prefer => (
                            <Option key={prefer.value} value={prefer.value}>
                              {prefer.value} | {prefer.text}
                            </Option>))}
                        </Select>
                      </FormItem>
                    );
                  } else if (item && index >= 2) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Input value={masterModel[index]} />
                      </FormItem>
                    );
                  }
                  return '';
                })}
                <FormItem {...formItemLayout} label="其他">
                  <Input value={masterOthers} />
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
                {data.element && data.element.split(';').map((item, index) => {
                  if (item && index === 0) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Select value={dataModel[0]}>
                          {CMS_HSCODE_BRAND_TYPE.map(type => (
                            <Option key={type.value} value={type.value}>
                              {type.value} | {type.text}
                            </Option>))}
                        </Select>
                      </FormItem>
                    );
                  } else if (item && index === 1) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Select value={dataModel[1]}>
                          {CMS_HSCODE_EXPORT_PREFER.map(prefer => (
                            <Option key={prefer.value} value={prefer.value}>
                              {prefer.value} | {prefer.text}
                            </Option>))}
                        </Select>
                      </FormItem>
                    );
                  } else if (item && index >= 2) {
                    return (
                      <FormItem {...formItemLayout} label={item} key={item}>
                        <Input value={dataModel[index]} />
                      </FormItem>
                    );
                  }
                  return '';
                })}
                <FormItem {...formItemLayout} label="其他">
                  <Input value={dataOthers} />
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>

      </Modal>
    );
  }
}
