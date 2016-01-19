import React, {PropTypes} from 'react';
import {Modal, Switch} from '../../reusable/ant-ui';

export default class ModuleEditor extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    appPackage: PropTypes.array.isRequired,
    enabledModules: PropTypes.object
  }
  render() {
    return (
      <Modal title="设置开通的应用" visible={this.props.visible} onOk={() => this.handleOkBtn()}>
        <div className="mod-editor-header">
          <h4>应用名称</h4>
          <p className="mod-editor-label pull-right">描述</p>
          <p className="mod-editor-label pull-right">开通状态</p>
        </div>
        <form className="mod-editor-form">
        {
          this.props.appPackage.map((ap, idx) => (
            <div className="form-group clearfix" key={`modeditor${idx}`}>
              <label>{ap.name}</label>
              <label>{ap.desc}</label>
              <Switch checked={true/* this.props.enabledModules[ap.name].enabled */}
                onChange={this.handleAppEnableChange} />
            </div>
          ))
        }
        </form>
      </Modal>);
  }
}
