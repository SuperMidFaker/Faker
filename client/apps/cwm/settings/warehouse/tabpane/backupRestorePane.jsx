import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Form } from 'antd';
import { formatMsg } from '../message.i18n';
import { loadWhseSupervisionApps } from 'common/reducers/openIntegration';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whseSupervisonApps: state.openIntegration.whseSupervisonApps,
  }),
  { loadWhseSupervisionApps }
)
export default class DataImportPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  msg = formatMsg(this.props.intl)

  render() {
    return (
      <div style={{ padding: 24 }}>
        <Form layout="inline">
          <FormItem label="" />
          <FormItem >
            <Button type="primary" size="large" onClick={this.handleSaveFtzApp}>上传</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
