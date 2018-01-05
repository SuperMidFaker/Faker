import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Col, Modal, Form, Input, Row, Select } from 'antd';
import { CMS_HSCODE_BRAND_TYPE, CMS_HSCODE_EXPORT_PREFER } from 'common/constants';
import { toggleItemDiffModal } from 'common/reducers/cmsTradeitem';

const FormItem = Form.Item;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsTradeitem.itemDiffModal.visible,
    element: state.cmsManifest.declElementsModal.element,
    gModel: state.cmsManifest.declElementsModal.gModel,
    disabled: state.cmsManifest.declElementsModal.disabled,
    id: state.cmsManifest.declElementsModal.id,
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
    others: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const others = nextProps.gModel ? nextProps.gModel.split('|').pop() : '';
      this.setState({
        others,
      });
      nextProps.form.resetFields();
    }
  }
  handleOk = () => {
    const { id, disabled, form } = this.props;
    if (!disabled) {
      const data = form.getFieldsValue();
      const parts = [];
      Object.keys(data).forEach((key) => {
        parts.push(data[key]);
      });
      parts.push(this.state.others);
      this.props.onOk(parts.join('|'), id);
    }
    this.handleCancel();
  }
  handleCancel = () => {
    this.props.toggleItemDiffModal(false);
  }

  render() {
    const {
      baselineTitle, currentTitle, form: { getFieldDecorator }, disabled,
    } = this.props;
    const { others } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const element = this.props.element ? this.props.element.split(';').filter(elem => elem) : [];
    const gModel = this.props.gModel ? this.props.gModel.split('|') : [];
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
            <Card title={baselineTitle || '基准数据'}>
              <Form className="form-layout-compact">
                <FormItem {...formItemLayout} label="HS编码">
                  <Input />
                </FormItem>
                <FormItem {...formItemLayout} label="中文品名">
                  <Input />
                </FormItem>
                {element.map((item, index) => {
                if (item && index === 0) {
                  return (
                    <FormItem {...formItemLayout} label={item} key={item}>
                      {getFieldDecorator(item, {
                        initialValue: gModel[0] || '',
                      })(<Select
                        disabled={disabled}
                        onChange={value => this.handleInputChange(value, item)}
                      >
                        {CMS_HSCODE_BRAND_TYPE.map(type => (
                          <Option key={type.value} value={type.value}>
                            {type.value} | {type.text}
                          </Option>))}
                      </Select>)}
                    </FormItem>
                  );
                } else if (item && index === 1) {
                  return (
                    <FormItem {...formItemLayout} label={item} key={item}>
                      {getFieldDecorator(item, {
                        initialValue: gModel[1] || '',
                      })(<Select
                        disabled={disabled}
                        onChange={value => this.handleInputChange(value, item)}
                      >
                        {CMS_HSCODE_EXPORT_PREFER.map(prefer => (
                          <Option key={prefer.value} value={prefer.value}>
                            {prefer.value} | {prefer.text}
                          </Option>))}
                      </Select>)}
                    </FormItem>
                  );
                } else if (item && index >= 2) {
                  return (
                    <FormItem {...formItemLayout} label={item} key={item}>
                      {getFieldDecorator(item, {
                        initialValue: gModel[index] || '',
                      })(<Input
                        disabled={disabled}
                        onChange={e => this.handleInputChange(e.target.value, item)}
                      />)}
                    </FormItem>
                  );
                }
                return '';
              })}
                <FormItem {...formItemLayout} label="其他">
                  <Input value={others} disabled={disabled} onChange={this.handleOthersChange} />
                </FormItem>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={currentTitle || '当前数据'}>
              <Form className="form-layout-compact">
                <FormItem {...formItemLayout} label="HS编码">
                  <Input />
                </FormItem>
                <FormItem {...formItemLayout} label="中文品名">
                  <Input />
                </FormItem>
                {element.map((item, index) => {
              if (item && index === 0) {
                return (
                  <FormItem {...formItemLayout} label={item} key={item}>
                    {getFieldDecorator(item, {
                      initialValue: gModel[0] || '',
                    })(<Select
                      disabled={disabled}
                      onChange={value => this.handleInputChange(value, item)}
                    >
                      {CMS_HSCODE_BRAND_TYPE.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.value} | {type.text}
                        </Option>))}
                    </Select>)}
                  </FormItem>
                );
              } else if (item && index === 1) {
                return (
                  <FormItem {...formItemLayout} label={item} key={item}>
                    {getFieldDecorator(item, {
                      initialValue: gModel[1] || '',
                    })(<Select
                      disabled={disabled}
                      onChange={value => this.handleInputChange(value, item)}
                    >
                      {CMS_HSCODE_EXPORT_PREFER.map(prefer => (
                        <Option key={prefer.value} value={prefer.value}>
                          {prefer.value} | {prefer.text}
                        </Option>))}
                    </Select>)}
                  </FormItem>
                );
              } else if (item && index >= 2) {
                return (
                  <FormItem {...formItemLayout} label={item} key={item}>
                    {getFieldDecorator(item, {
                      initialValue: gModel[index] || '',
                    })(<Input
                      disabled={disabled}
                      onChange={e => this.handleInputChange(e.target.value, item)}
                    />)}
                  </FormItem>
                );
              }
              return '';
            })}
                <FormItem {...formItemLayout} label="其他">
                  <Input value={others} disabled={disabled} onChange={this.handleOthersChange} />
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>

      </Modal>
    );
  }
}
