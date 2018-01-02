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
    }
  }
  handleOk = () => {
    const { id, disabled } = this.props;
    const { model } = this.state;
    if (!disabled) {
      this.props.onOk(model, id);
    }
    this.props.hideDeclElementsModal();
    this.props.form.resetFields();
    this.setState({
      model: '',
    });
  }
  handleCancel = () => {
    this.props.hideDeclElementsModal();
    this.props.form.resetFields();
    this.setState({
      model: '',
    });
  }
  handleInputChange = (value, item) => {
    const data = this.props.form.getFieldsValue();
    data[item] = value;
    const values = [];
    for (const key in data) {
      if (key) {
        values.push(data[key]);
      }
    }
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
    const element = this.props.element ? this.props.element.split(';') : [];
    const gModel = this.props.gModel ? this.props.gModel.split('|') : [];
    return (
      <div>
        <Modal
          maskClosable={false}
          title="规格型号"
          width={800}
          visible={this.props.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
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
                      onChange={e => this.handleInputChange(e.target.value, item)}
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
                      onChange={e => this.handleInputChange(e.target.value, item)}
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
                      initialValue: gModel[index - 1] || '',
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
      </div>
    );
  }
}
