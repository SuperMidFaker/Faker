import React, { PropTypes } from 'react';
import { Modal, Button, Switch, Row, Col, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { APP_ENTITY_META_INFO } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import './appmodule-editor.less';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

@injectIntl
export default class ModuleEditor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    appPackage: PropTypes.array.isRequired,
    switchTenantApp: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    tenantApps: PropTypes.array
  }
  state = {
    visible: false,
    enabledApps: {}
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.setState({ visible: true });
    } else {
      this.setState({ visible: false });
    }
    if ('tenantApps' in nextProps) {
      const enMods = {};
      nextProps.tenantApps.forEach(mod => {
        enMods[mod.id] = true;
      });
      this.setState({ enabledApps: enMods });
    }
  }
  handleCancel = () => {
    this.props.onCancel();
  }
  handleAppCheck(ap, checked) {
    const app = {
      id: ap.id,
      name: formatGlobalMsg(this.props.intl, APP_ENTITY_META_INFO[ap.id].name),
      desc: formatGlobalMsg(this.props.intl, APP_ENTITY_META_INFO[ap.id].desc),
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
    const { intl } = this.props;
    return (
      <Modal title={formatMsg(intl, 'appEditorTitle')} visible={this.state.visible}
        onCancel={this.handleCancel} footer={
          [
            <Button key="confirm" type="primary" size="large" onClick={this.handleCancel}>
            { formatGlobalMsg(intl, 'ok') }
            </Button>
          ]
        }
      >
        <Row className="module-editor">
          <Col span="8"><h4>{ formatMsg(intl, 'appEditorNameCol') }</h4></Col>
          <Col span="8"><p className="type-label">{ formatGlobalMsg(intl, 'desc') }</p></Col>
          <Col span="8">
            <label className="type-label pull-right">
            { formatMsg(intl, 'appEditorSetCol') }
            </label>
          </Col>
        </Row>
        <Row className="module-editor">
        {
          this.props.appPackage.map((ap, idx) => (
            <div className="form-group clearfix" key={`modeditor${idx}`}>
              <Col span="8">
                <h4>{formatGlobalMsg(intl, APP_ENTITY_META_INFO[ap.id].name)}</h4>
              </Col>
              <Col span="8">
                <p className="type-label">
                {formatGlobalMsg(intl, APP_ENTITY_META_INFO[ap.id].desc)}
                </p>
              </Col>
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
