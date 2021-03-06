import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Form, Select, message } from 'antd';
import { formatMsg } from '../message.i18n';
import { updateWhse, loadCustoms } from 'common/reducers/cwmWarehouse';
import { loadWhseSupervisionApps } from 'common/reducers/hubIntegration';

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
    whseSupervisonApps: state.hubIntegration.whseSupervisonApps,
    customs: state.cwmWarehouse.customs,
  }),
  { loadWhseSupervisionApps, updateWhse, loadCustoms }
)
export default class SupervisionPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    ftzAppId: PropTypes.string,
    customsCode: PropTypes.string,
  }
  state = {
    ftzAppId: '',
    customsCode: '',
    customs: [],
  }
  componentWillMount() {
    this.props.loadCustoms().then((result) => {
      this.setState({
        customs: result.data.slice(0, 20),
        customsCode: this.props.customsCode,
      });
    });
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
    const { customsCode } = this.state;
    if (ftz) {
      this.props.updateWhse({ ftz_type: ftz.app_type, ftz_integration_app_id: ftz.uuid, customs_code: customsCode }, this.props.whseCode).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('监管系统已设置');
        }
      });
    }
  }
  handleSelect = (customsCode) => {
    this.setState({
      customsCode,
    });
  }
  handleSearch = (value) => {
    if (value) {
      const customs = this.props.customs.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.customs_code);
      });
      this.setState({
        customs: customs.slice(0, 20),
      });
    }
  }
  render() {
    const { whseSupervisonApps } = this.props;
    const { customsCode, customs } = this.state;
    return (
      <div style={{ padding: 24 }}>
        <Form layout="horizontal">
          <FormItem label="主管海关" {...formItemLayout}>
            <Select
              showSearch
              optionLabelProp="children"
              showArrow
              allowClear
              onSelect={this.handleSelect}
              onSearch={this.handleSearch}
              value={customsCode}
            >
              {customs.map(cus => <Option value={cus.customs_code} key={cus.customs_code}>{`${cus.customs_code}|${cus.customs_name}`}</Option>)}
            </Select>
          </FormItem>
          <FormItem label="保税监管系统" {...formItemLayout}>
            <Select
              placeholder="请选择保税监管系统"
              allowClear
              value={this.state.ftzAppId}
              onSelect={this.handleFtzAppSelect}
            >
              {whseSupervisonApps.map(wsa =>
                <Option key={wsa.uuid} value={wsa.uuid}>{wsa.name}</Option>)}
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
