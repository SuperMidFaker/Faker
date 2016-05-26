/**
 * 添加partner时弹出的通用Modal组件, 参考自antd中的Model.confirm组件
 * @param {config<Object>} 配置对象, 参数如下:
 * { 
 *    onOk(value){}:        确认按钮按下后执行的函数,参数是当前选中的partner值
 *    partnerlist<Array>:   用于下拉选项的partner数组
 * }
 * @return {}
 * 
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Icon, Button, Form, Select } from 'ant-ui';
import classNames from 'classnames';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

function PartnerModal(config) {
  const props = { ...config };
  let div = document.createElement('div');
  document.body.appendChild(div);

  let d;
  let selectedPartnerValue;

  let width = props.width || 520;
  let style = props.style || {};
  
  const partnerOptions = props.partnerlist.map((partner, index) => <Option value={partner.name} key={index}>{partner.name}</Option>);

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
    props.onOk && props.onOk(selectedPartnerValue);
  }
  
  function handleSelectedPartnerValueChange(value) {
    selectedPartnerValue = value;
  }

  let body = (
    <div>
      <div className="ant-confirm-body">
        <Form horizontal>
          <FormItem {...formItemLayout} label="添加的合作伙伴:">
            <Select onChange={handleSelectedPartnerValueChange}>
              {partnerOptions}
            </Select>
          </FormItem>
        </Form>
      </div>
      <div className="ant-confirm-btns">
        <Button type="ghost" size="large" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" size="large" onClick={onOk}>
          添加
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
      title=""
      transitionName="zoom"
      footer=""
      maskTransitionName="fade"
      style={style}
      width={width}>
      <div style={{ zoom: 1, overflow: 'hidden' }}>{body}</div>
    </Modal>
    , div, function () {
      d = this;
    });
}

export default PartnerModal;
