import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Form, Select, message } from 'antd';
import { formatMsg } from '../message.i18n';
import { updateWhse } from 'common/reducers/cwmWarehouse';
import { loadWhseSupervisionApps } from 'common/reducers/openIntegration';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};

@injectIntl
@connect(
  state => ({
    whseSupervisonApps: state.openIntegration.whseSupervisonApps,
  }),
  { loadWhseSupervisionApps, updateWhse }
)
export default class SupervisionPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    ftzAppId: PropTypes.string,
  }
  state = { ftzAppId: '' }
  componentWillMount() {
    this.props.loadWhseSupervisionApps();
    if (this.props.ftzAppId) {
      this.setState({ ftzAppId: this.props.ftzAppId });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.ftzAppId !== this.props.ftzAppId) {
      this.setState({ ftzAppId: nextProps.ftzAppId });
    }
  }

  msg = formatMsg(this.props.intl)
  handleFtzAppSelect = (appid) => {
    this.setState({ ftzAppId: appid });
  }
  handleSaveFtzApp = () => {
    const ftz = this.props.whseSupervisonApps.filter(wsa => wsa.uuid === this.state.ftzAppId)[0];
    if (ftz) {
      this.props.updateWhse({ ftz_type: ftz.app_type, ftz_integration_app_id: ftz.uuid }, this.props.whseCode).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('监管系统已设置');
        }
      });
    }
  }
  render() {
    const { whseSupervisonApps } = this.props;
    return (
      <div style={{ padding: 24 }}>
        <Form layout="horizontal">
          <FormItem label="主管海关" {...formItemLayout}>
            <Select
              optionLabelProp="children"
              showArrow
              allowClear
            />
          </FormItem>
          <FormItem label="保税监管系统" {...formItemLayout}>
            <Select placeholder="请选择保税监管系统" allowClear
              value={this.state.ftzAppId} onSelect={this.handleFtzAppSelect}
            >
              {whseSupervisonApps.map(wsa =>
                <Option key={wsa.uuid} value={wsa.uuid}>{wsa.name}</Option>
              )}
            </Select>
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" onClick={this.handleSaveFtzApp}>保存</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
