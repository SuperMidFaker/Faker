import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Icon, Checkbox } from 'antd';
import classNames from 'classnames';

const CheckboxGroup = Checkbox.Group;

const options = [
  { label: '货代', value: 'FWD' },
  { label: '报关', value: 'CCB' },
  { label: '运输', value: 'TRS' },
  { label: '仓储', value: 'WHS' },
  { label: '供应商', value: 'SUP' },
];

function receiveModal(config) {
  const props = { ...config };
  const div = document.createElement('div');
  document.body.appendChild(div);

  let d;
  let partnerships;

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
      props.onOk(partnerships);
    }
  }
  function handleChange(checkedValues) {
    partnerships = checkedValues;
  }
  const body = (
    <div>
      <div className="ant-confirm-title" style={{ marginBottom: 10 }}>
        <Icon type="info-circle-o" style={{ color: '#2DB7F5', marginRight: 5 }} />请选择合作关系
      </div>
      <hr />
      <div className="ant-confirm-body">
        <CheckboxGroup options={options} onChange={handleChange} />
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
      width={width}
    >
      <div style={{ zoom: 1, overflow: 'hidden' }}>{body}</div>
    </Modal>
    , div, function A() {
      d = this;
    });
}

export default receiveModal;
