/**
 * 添加partner时弹出的通用Modal组件, 参考自antd中的Model.confirm组件
 * @param {config<Object>} 配置对象, 参数如下:
 * {
 *    onOk(value){}:           确认按钮按下后执行的函数,参数是当前选中的tenant对象
 *    partnerTenants<Array>:   在mode='add'模式下的下拉选项的tenants数组, add模式下需要
 *    providerValues<Array>:   在mode='editProvider'模式下默认选中的provider types数组, editProvider模式下需要
 * }
 * @return {}
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, Checkbox, Input } from 'ant-ui';
import classNames from 'classnames';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

const options = [
  {label: '货代', value: 'FWD'},
  {label: '报关', value: 'CCB'},
  {label: '运输', value: 'TRS'},
  {label: '仓储', value: 'WHS'}
];

class PartnerForm extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    isProvider: PropTypes.bool,
    editInfo: PropTypes.object,
    partnerships: PropTypes.array, // 新增物流提供商的时候才用的到
  }
  constructor(...args) {
    super(...args);
    const inEdit = !!this.props.editInfo;
    this.state = {
      inEdit,
      partnerName: inEdit ? this.props.editInfo.name : '',
      partnerCode: inEdit ? this.props.editInfo.code : '',
      partnerships: this.props.partnerships || [],
    };
  }
  handleOk = (ev) => {
    ev.preventDefault();
    this.props.close();
    if (this.props.onOk) {
      const { inEdit, partnerName, partnerCode, partnerships } = this.state;
      if (inEdit) {
        this.props.onOk(partnerName, partnerCode);
      } else {
        this.props.onOk({ partnerName, partnerCode, partnerships });
      }
    }
  }
  handleNameChange = (ev) => {
    this.setState({ partnerName: ev.target.value });
  }
  handleCodeChange = (ev) => {
    this.setState({ partnerCode: ev.target.value });
  }
  handleProviderChange = (value) => {
    this.setState({ partnerships: value });
  }
  render() {
    const { inEdit, partnerName, partnerCode, partnerships } = this.state;
    const providerCheckbox = (
      <FormItem {...formItemLayout} label="物流提供商类型:" required>
        <CheckboxGroup
          options={options}
          defaultValue={partnerships}
          onChange={this.handleProviderChange}
        />
      </FormItem>
    );
    return (
      <div className="ant-confirm-body">
        <Form horizontal onSubmit={this.handleOk}>
          <FormItem {...formItemLayout} label="合作伙伴名称:" required>
            <Input required value={partnerName} onChange={this.handleNameChange} />
          </FormItem>
          <FormItem {...formItemLayout} label="合作伙伴代码:" required>
            <Input required value={partnerCode} onChange={this.handleCodeChange} />
          </FormItem>
          {this.props.isProvider && providerCheckbox}
          <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 24 }}>
            <Button type="ghost" size="large" onClick={this.props.onCancel} style={{ marginRight: 12 }}>
              取消
            </Button>
            <Button type="primary" size="large" htmlType="submit">
            { inEdit ? '修改' : '添加' }
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

function editProviderForm(props) {
  const { onCancel, close } = props;
  let { checkedProviderValues = [] } = props;

  function handleProvierChange(checkedValues) {
    checkedProviderValues = checkedValues;
    document.getElementById('yProviderBtn').disabled = checkedProviderValues.length === 0;
  }
  function onOk() {
    close();
    if (props.onOk) {
      props.onOk(checkedProviderValues);
    }
  }

  return (
    <div>
      <div className="ant-confirm-body">
        <Form horizontal>
          <CheckboxGroup
            options={options}
            defaultValue={checkedProviderValues}
            onChange={handleProvierChange} {...formItemLayout}/>
        </Form>
      </div>
      <div className="ant-confirm-btns">
        <Button type="ghost" size="large" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" size="large" onClick={onOk} id="yProviderBtn">
          添加
        </Button>
      </div>
    </div>
  );
}

function partnerModal(config) {
  const props = { ...config };
  const div = document.createElement('div');
  document.body.appendChild(div);
console.log(config);
  let d;

  const width = props.width || 520;
  const style = props.style || {};

  function close() {
    d.setState({
      visible: false,
    });
    ReactDOM.unmountComponentAtNode(div);
    div.parentNode.removeChild(div);
  }

  function onCancel() {
    close();
  }

  let body;
  if (props.mode === 'editProvider') {
    body = editProviderForm({onCancel, close, onOk: props.onOk, checkedProviderValues: props.providerValues});
  } else {
    body = <PartnerForm onCancel={onCancel} close={close} {...props} />;
  }

  const classString = classNames({
    'ant-confirm': true,
    [`ant-confirm-${props.type}`]: true,
    [props.className]: !!props.className,
  });

  ReactDOM.render(
    <Modal
      className={classString}
      visible
      closable={false}
      title=""
      transitionName="zoom"
      footer=""
      maskTransitionName="fade"
      style={style}
      width={width}>
      <div style={{ zoom: 1, overflow: 'hidden' }}>{body}</div>
    </Modal>
    , div, function A() {
      d = this;
    });
}

export default partnerModal;
