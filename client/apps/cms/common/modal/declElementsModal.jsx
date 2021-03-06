import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Modal, Form, Input, Select } from 'antd';
import { CMS_HSCODE_BRAND_TYPE, CMS_HSCODE_EXPORT_PREFER } from 'common/constants';
import { hideDeclElementsModal } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@connect(
  state => ({
    visible: state.cmsManifest.declElementsModal.visible,
    element: state.cmsManifest.declElementsModal.element,
    gModel: state.cmsManifest.declElementsModal.gModel,
    disabled: state.cmsManifest.declElementsModal.disabled,
    id: state.cmsManifest.declElementsModal.id,
  }),
  { hideDeclElementsModal }
)
@Form.create()
export default class DeclElementsModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
  }
  state = {
    model: '',
    others: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const others = nextProps.gModel ? nextProps.gModel.split('|').pop() : '';
      this.setState({
        model: nextProps.gModel,
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
    this.props.hideDeclElementsModal();
    this.props.form.resetFields();
  }
  handleInputChange = (value, item) => {
    const data = this.props.form.getFieldsValue();
    const values = [];
    Object.keys(data).forEach((key) => {
      if (key === item) {
        values.push(value);
      } else {
        values.push(data[key]);
      }
    });
    values.push(this.state.others);
    const model = values.join('|');
    this.setState({ model });
  }
  handleOthersChange = (e) => {
    let { model } = this.state;
    if (model) {
      const values = model.split('|');
      values.splice(-1, 1, e.target.value);
      model = values.join('|');
    } else {
      model = '';
      const element = this.props.element ? this.props.element.split(';') : [];
      for (let i = 0; i < element.length; i++) {
        model += '|';
      }
      model += `|${e.target.value}`;
    }
    this.setState({
      model,
      others: e.target.value,
    });
  }
  render() {
    const { form: { getFieldDecorator }, disabled } = this.props;
    const { model, others } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const element = this.props.element ? this.props.element.split(';').filter(elem => elem) : [];
    const gModel = this.props.gModel ? this.props.gModel.split('|') : [];
    return (
      <Modal
        maskClosable={false}
        title="规格型号"
        width={800}
        style={{ top: 24 }}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form className="form-layout-compact">
          <FormItem>
            <TextArea value={model} disabled autosize />
          </FormItem>
          {!disabled && <Alert message="根据海关规定应填报以下要素" type="info" closable />}
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
      </Modal>
    );
  }
}
