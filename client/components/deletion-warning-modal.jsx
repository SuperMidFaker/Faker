import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Modal, Icon, Button, Form, Input } from 'antd';

const FormItem = Form.Item;
class WarningModal extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    iconClassType: PropTypes.string.isRequired,
    cancelText: PropTypes.string.isRequired,
    okText: PropTypes.string.isRequired,
    okCancel: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    confirmString: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  }
  constructor() {
    super();
    this.state = {
      visible: true,
      okDisabled: true,
      okLoading: false,
    };
  }
  onCancel() {
    const cancelFn = this.props.onCancel;
    if (cancelFn) {
      let ret;
      if (cancelFn.length) {
        ret = cancelFn(() => this.close());
      } else {
        ret = cancelFn();
        if (!ret) {
          this.close();
        }
      }
      if (ret && ret.then) {
        ret.then(() => this.close());
      }
    } else {
      this.close();
    }
  }

  onOk() {
    const okFn = this.props.onOk;
    if (okFn) {
      let ret;
      if (okFn.length) {
        ret = okFn(() => this.close());
      } else {
        ret = okFn();
        if (!ret) {
          this.close();
        }
      }
      if (ret && ret.then) {
        ret.then(() => this.close());
      }
    } else {
      this.close();
    }
  }

  close() {
    this.setState({
      visible: false,
    });
    this.props.close();
  }

  handleInputChange(ev) {
    if (ev.target.value === this.props.confirmString) {
      this.setState({ okDisabled: false });
    } else {
      this.setState({ okDisabled: true });
    }
  }

  render() {
    const { width, title, content, iconClassType, okCancel, cancelText, okText } = this.props;
    return (
      <Modal maskClosable={false}
        prefixCls="ant-modal"
        className="ant-confirm"
        visible={this.state.visible}
        closable={false}
        title=""
        transitionName="zoom"
        footer=""
        maskTransitionName="fade" width={width}
      >
        <div style={{ zoom: 1, overflow: 'hidden' }}>
          <div className="ant-confirm-body">
            <Icon type={iconClassType} />
            <span className="ant-confirm-title">{title}</span>
            <div className="ant-confirm-content">
              <FormItem>
                <Input type="text" placeholder="请记住权力越大,责任越大" onChange={ev => this.handleInputChange(ev)} />
              </FormItem>
              <h3>{content}</h3>
            </div>
          </div>
          <div className="ant-confirm-btns">
            {
            okCancel &&
            <Button type="ghost" size="large" onClick={() => this.onCancel()}>
              {cancelText}
            </Button>
          }
            <Button type="primary" size="large" disabled={this.state.okDisabled}
              loading={this.state.okLoading} onClick={() => this.onOk()}
            >
              {okText}
            </Button>
          </div>
        </div>
      </Modal>);
  }
}
export default function (props) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const tprops = props || {};
  tprops.iconClassType = tprops.iconClassName || 'question-circle';

  tprops.width = tprops.width || 416;
  // 默认为 true，保持向下兼容
  if (!('okCancel' in tprops)) {
    tprops.okCancel = true;
  }
  tprops.okText = tprops.okText || (tprops.okCancel ? '确定' : '知道了');
  tprops.cancelText = tprops.cancelText || '取消';

  tprops.close = () => {
    ReactDOM.unmountComponentAtNode(div);
    div.parentNode.removeChild(div);
  };
  function noop() {}
  ReactDOM.render(<WarningModal {...tprops} />, div, noop);
}
