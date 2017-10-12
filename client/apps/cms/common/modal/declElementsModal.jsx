import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Form, Input } from 'antd';
import { hideDeclElementsModal } from 'common/reducers/cmsManifest';

const FormItem = Form.Item;
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
    visible: false,
    model: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.setState({
        model: nextProps.gModel,
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
    let model = '';
    const values = Object.values(data);
    for (let i = 0; i < values.length; i++) {
      if (model) {
        model += `|${values[i]}`;
      } else if (!model) {
        model = values[i];
      }
    }
    this.setState({ model });
  }
  render() {
    const { form: { getFieldDecorator }, disabled } = this.props;
    const { model } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    const element = this.props.element.split(';');
    const gModel = this.props.gModel ? this.props.gModel.split('|') : [];
    return (
      <div>
        <Modal
          title="规格型号"
          visible={this.props.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          {element.map((item, index) => {
            if (item) {
              return (
                <FormItem {...formItemLayout} label={item}>
                  {getFieldDecorator(item, {
                    initialValue: gModel[index] || '',
                  })(
                    <Input disabled={disabled} onChange={e => this.handleInputChange(e.target.value, item)} />
                )}
                </FormItem>
              );
            } else {
              return '';
            }
          })}
          <FormItem {...formItemLayout} label="规格型号">
            <Input value={model} disabled={disabled} />
          </FormItem>
        </Modal>
      </div>
    );
  }
}
