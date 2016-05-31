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
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, Checkbox, Input } from 'ant-ui';
import classNames from 'classnames';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

function addForm(props) {
  const { onCancel, close } = props;

  function onOk(e) {
    e.preventDefault();
    close();
    if (props.onOk) {
      const partnerName = document.getElementById('yPartnerName').value;
      const partnerCode = document.getElementById('yPartnerCode').value;
      props.onOk({partnerName, partnerCode});
    }
  }

  return (
    <div className="ant-confirm-body">
      <Form horizontal onSubmit={onOk}>
        <FormItem {...formItemLayout} label="合作伙伴名称:" required>
          <Input required id="yPartnerName"/>
        </FormItem>
        <FormItem {...formItemLayout} label="合作伙伴代码:" required>
          <Input required id="yPartnerCode"/>
        </FormItem>
        <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 24 }}>
          <Button type="ghost" size="large" onClick={onCancel} style={{ marginRight: 12 }}>
            取消
          </Button>
          <Button type="primary" size="large" htmlType="submit">
            添加
          </Button>
        </FormItem>
      </Form>
    </div>
  );
}

function editProviderForm(props) {
  const options = [
    {label: '货代', value: 'FWD'},
    {label: '报关', value: 'CCB'},
    {label: '运输', value: 'TRS'},
    {label: '仓储', value: 'WHS'}
  ];
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
    body = addForm({onCancel, close, onOk: props.onOk, partnerTenants: props.partnerTenants});
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
