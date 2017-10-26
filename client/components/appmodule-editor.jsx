import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Switch, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { DEFAULT_MODULES } from 'common/constants/module';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
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
    tenantApps: PropTypes.array,
  }
  state = {
    visible: false,
    enabledApps: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.setState({ visible: true });
    } else {
      this.setState({ visible: false });
    }
    if ('tenantApps' in nextProps) {
      const enMods = {};
      nextProps.tenantApps.forEach((mod) => {
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
      package: ap.package,
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
      <Modal maskClosable={false} title={formatMsg(intl, 'appEditorTitle')} visible={this.state.visible}
        onCancel={this.handleCancel} footer={[
          <Button key="confirm" type="primary" size="large" onClick={this.handleCancel}>
            {formatGlobalMsg(intl, 'ok')}
          </Button>]
        }
      >
        <Row className="module-editor">
          <Col span="8"><h4>{formatMsg(intl, 'appEditorNameCol')}</h4></Col>
          <Col span="8"><p className="type-label">{formatGlobalMsg(intl, 'desc')}</p></Col>
          <Col span="8">
            <label htmlFor="editor" className="type-label pull-right">
              {formatMsg(intl, 'appEditorSetCol')}
            </label>
          </Col>
        </Row>
        <Row className="module-editor">
          {
          this.props.appPackage.map(ap => (
            <div className="form-group clearfix" key={ap.id}>
              <Col span="8">
                <h4>{formatGlobalMsg(intl, DEFAULT_MODULES[ap.id].text)}</h4>
              </Col>
              <Col span="8">
                <p className="type-label">
                  {formatGlobalMsg(intl, DEFAULT_MODULES[ap.id].text)}
                </p>
              </Col>
              <Col span="8">
                <div className="pull-right">
                  <Switch checked={!!this.state.enabledApps[ap.id]}
                    onChange={checked => this.handleAppCheck(ap, checked)}
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
