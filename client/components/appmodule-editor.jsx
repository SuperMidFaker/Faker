import React, {PropTypes} from 'react';
import {Modal, Switch, Row, Col} from '../../reusable/ant-ui';
import './appmodule-editor.less';

export default class ModuleEditor extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    appPackage: PropTypes.array.isRequired,
    switchTenantApps: PropTypes.func.isRequired,
    enabledModules: PropTypes.object
  }
  constructor() {
    super();
    this.state = {
      visible: false,
      enabledModules: {}
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.setState({visible: true});
    }
    if ('enabledModules' in nextProps) {
      this.setState({enabledModules: nextProps.enabledModules});
    }
  }
  handleOk() {
    this.props.switchTenantApps(this.props.tenantId, this.state.enabledModules);
    this.setState({
      visible: false
    });
  }
  handleCancel() {
    this.setState({
      visible: false
    });
  }
  handleAppCheck(ap, checked) {
    this.props.enabledModules[ap.id] = {
      enabled: checked,
      name: ap.name,
      package: ap.package
    };
  }
  render() {
    return (
      <Modal title="设置开通的应用" visible={this.state.visible} onOk={() => this.handleOk()}
         onCancel={() => this.handleCancel()}>
        <Row className="module-editor">
          <Col span="8"><h4>应用名称</h4></Col>
          <Col span="8"><p className="type-label">描述</p></Col>
          <Col span="8"><label className="type-label pull-right">开通状态</label></Col>
        </Row>
        <Row className="module-editor">
        {
          this.props.appPackage.map((ap, idx) => (
            <div className="form-group clearfix" key={`modeditor${idx}`}>
              <Col span="9"><h4>{ap.name}</h4></Col>
              <Col span="8"><p className="type-label">{ap.desc}</p></Col>
              <Col span="8">
                <div className="pull-right">
                  <Switch checked={this.state.enabledModules[ap.id] && this.state.enabledModules[ap.id].enabled}
                    onChange={(checked) => this.handleAppCheck(ap, checked)} />
                </div>
              </Col>
            </div>
          ))
        }
        </Row>
      </Modal>);
  }
}
