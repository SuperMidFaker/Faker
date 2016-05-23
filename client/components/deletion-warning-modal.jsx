import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { Modal, Icon, Button, Form, Input } from 'ant-ui';

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
    onCancel: PropTypes.func
  }
  constructor() {
    super();
    this.state = {
      visible: true,
      okDisabled: true,
      okLoading: false
    };
  }
  close() {
    this.setState({
      visible: false
    });
    this.props.close();
  }
  onCancel() {
    let cancelFn = this.props.onCancel;
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
    let okFn = this.props.onOk;
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

  handleInputChange(ev) {
    if (ev.target.value === this.props.confirmString) {
      this.setState({okDisabled: false});
    } else {
      this.setState({okDisabled: true});
    }
  }

  render() {
    const {width, title, content, iconClassType, okCancel, cancelText, okText} = this.props;
    return (
      <Modal
        prefixCls="ant-modal"
        className="ant-confirm"
        visible={this.state.visible}
        closable={false}
        title=""
        transitionName="zoom"
        footer=""
        maskTransitionName="fade" width={width}>
        <div style={{zoom: 1, overflow: 'hidden'}}>
          <div className="ant-confirm-body">
            <Icon type={iconClassType} />
            <span className="ant-confirm-title">{title}</span>
            <div className="ant-confirm-content">
              <Form.Item>
                <Input type="text" placeholder="请记住权力越大,责任越大" onChange={(ev) => this.handleInputChange(ev)} />
              </Form.Item>
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
              loading={this.state.okLoading} onClick={() => this.onOk()}>
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
  props = props || {};
  props.iconClassType  = props.iconClassName || 'question-circle';

  props.width = props.width || 416;
  // 默认为 true，保持向下兼容
  if (!('okCancel' in props)) {
    props.okCancel = true;
  }
  props.okText = props.okText || (props.okCancel ? '确定' : '知道了');
  props.cancelText = props.cancelText || '取消';

  props.close = () => {
    ReactDOM.unmountComponentAtNode(div);
    div.parentNode.removeChild(div);
  };
  ReactDOM.render(<WarningModal {...props} />, div, function () {
  });
}
