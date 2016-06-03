/**
 * 发送线下邀请时弹出的通用Modal组件, 参考自antd中的Model.confirm组件
 * @param {config<Object>} 配置对象, 参数如下:
 * {
 *    onOk(value){}:           确认按钮按下后执行的函数,参数是当前选中的tenant对象
 * }
 * @return {}
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, Input, Icon } from 'ant-ui';
import classNames from 'classnames';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

function inviteModal(config) {
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

  function onOk() {
    close();
    if (props.onOk) {
      const phone = document.getElementById('yInvitePhone').value;
      const email = document.getElementById('yInviteEmail').value;
      props.onOk({phone, email});
    }
  }
  const body = (
    <div>
      <div className="ant-confirm-title" style={{marginBottom: 10, marginLeft: 20}}>
        <Icon type="info-circle-o" style={{color: '#2DB7F5', marginRight: 5}}/>该合作伙伴为线下用户,发送短信或邮件邀请他成为线上租户
      </div>
      <hr/>
      <div className="ant-confirm-body">
        <Form horizontal>
          <FormItem label="手机号码:" {...formItemLayout}>
            <Input id="yInvitePhone"/>
          </FormItem>
          <FormItem label="邮箱:" {...formItemLayout}>
            <Input id="yInviteEmail"/>
          </FormItem>
        </Form>
      </div>
      <div className="ant-confirm-btns">
        <Button type="ghost" size="large" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" size="large" onClick={onOk}>
          邀请
        </Button>
      </div>
    </div>
  );

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

export default inviteModal;
