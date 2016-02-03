import React, { PropTypes } from 'react';
import { Modal, Button, Switch, Row, Col, message } from 'ant-ui';
import './appmodule-editor.less';

export default class ModuleEditor extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    appPackage: PropTypes.array.isRequired,
    switchTenantApp: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    tenantApps: PropTypes.array
  }
  constructor() {
    super();
    this.state = {
      visible: false,
      enabledApps: {}
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.setState({visible: true});
    } else {
      this.setState({visible: false});
    }
    if ('tenantApps' in nextProps) {
      const enMods = {};
      nextProps.tenantApps.forEach(mod => {
        enMods[mod.id] = true;
      });
      this.setState({enabledApps: enMods});
    }
  }
  handleCancel() {
    this.props.onCancel();
  }
  handleAppCheck(ap, checked) {
    const app = {
      id: ap.id,
      name: ap.name,
      desc: ap.desc,
      package: ap.package
    };
    this.props.switchTenantApp(this.props.tenantId, checked, app, this.props.index).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  render() {
    return (
      <Modal title="设置开通的应用" visible={this.state.visible}
        onCancel={() => this.handleCancel()} footer={
          [
            <Button key="confirm" type="primary" size="large" onClick={() => this.handleCancel()}>
             确定
            </Button>
          ]
        }
      >
        <Row className="module-editor">
          <Col span="8"><h4>应用名称</h4></Col>
          <Col span="8"><p className="type-label">描述</p></Col>
          <Col span="8"><label className="type-label pull-right">开通状态</label></Col>
        </Row>
        <Row className="module-editor">
        {
          this.props.appPackage.map((ap, idx) => (
            <div className="form-group clearfix" key={`modeditor${idx}`}>
              <Col span="8"><h4>{ap.name}</h4></Col>
              <Col span="8"><p className="type-label">{ap.desc}</p></Col>
              <Col span="8">
                <div className="pull-right">
                  <Switch checked={!!this.state.enabledApps[ap.id]}
                    onChange={(checked) => this.handleAppCheck(ap, checked)}
                  />
                </div>
              </Col>
            </div>
          ))
        }
        </Row>
      </Modal>);
  }
}
