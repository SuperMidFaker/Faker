/**
 * 添加partner时弹出的通用Modal组件, 参考自antd中的Model.confirm组件
 * @param {config<Object>} 配置对象, 参数如下:
 * {
 *    onOk(value){}:           确认按钮按下后执行的函数,参数是当前选中的tenant对象
 *    partnerTenants<Array>:   用于下拉选项的tenants数组
 * }
 * @return {}
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Form, Select } from 'ant-ui';
import classNames from 'classnames';

const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14}
};

function partnerModal(config) {
  const props = { ...config };
  const div = document.createElement('div');
  document.body.appendChild(div);

  let d;
  let selectedPartnerTenant;

  const width = props.width || 520;
  const style = props.style || {};
  const tenantOptions = props.partnerTenants.map((tenant, index) => <Option value={tenant.id} key={index}>{tenant.name}</Option>);

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
      props.onOk(selectedPartnerTenant);
    }
  }
  function handleSelectedPartnerValueChange(value) {
    selectedPartnerTenant = props.partnerTenants.find(tenant => tenant.id === value);
  }

  const body = (
    <div>
      <div className="ant-confirm-body">
        <Form horizontal>
          <FormItem {...formItemLayout} label="添加的合作伙伴:">
            <Select onChange={handleSelectedPartnerValueChange}>
              {tenantOptions}
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
    , div, function A() {
      d = this;
    });
}

export default partnerModal;
