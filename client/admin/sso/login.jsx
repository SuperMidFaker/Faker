import React, { PropTypes } from 'react';
import { Alert, Card, Form, Icon, Input, Button, Spin } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { submit, setValue, systemLoading } from '../../../common/reducers/auth';
import { getFormatMsg } from 'client/util/react-ant';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    code: state.corpDomain.code,
    auth: state.auth,
    loading: state.auth.loading,
  }),
  { submit, setValue, systemLoading }
)
export default class Login extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    auth: PropTypes.object,
    code: PropTypes.string.isRequired,
    setValue: PropTypes.func,
    submit: PropTypes.func,
    loading: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.props.systemLoading(false);
  }
  handleTextChange(ev, field) {
    this.props.setValue(field, ev.target.value);
  }
  handleCheckboxChange(ev, field) {
    this.props.setValue(field, ev.target.checked);
  }
  handleSubmit(ev) {
    this.props.systemLoading(true);
    ev.preventDefault();
    if (this.props.auth.nonTenant) {
      return;
    }
    const { code, auth: { username, password } } = this.props;
    // todo xss
    const form = {
      code,
      username,
      password,
    };
    this.props.submit(form).then(() => {
      this.props.systemLoading(false);
    });
  }

  render() {
    const { auth: { error, username }, intl } = this.props;
    return (
      <Card bodyStyle={{ padding: 64 }}>
        <Spin spinning={this.props.loading}>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div className="icon-logo" />
          </div>
          {error ? <div>{
            <Alert type="warning" showIcon message={`C${error.code}:
              ${getFormatMsg(error.message, (key, values) => formatMsg(intl, key, values))}`}
            />}</div> : null}
          <Form onSubmit={::this.handleSubmit} className="login-form">
            <FormItem>
              {(
                <Input addonBefore={<Icon type="user" />} placeholder={formatMsg(intl, 'userPlaceholder')} value={username}
                  onChange={ev => this.handleTextChange(ev, 'username')}
                />
              )}
            </FormItem>
            <FormItem>
              {(
                <Input addonBefore={<Icon type="lock" />} type="Password" placeholder={formatMsg(intl, 'pwdPlaceholder')}
                  onChange={ev => this.handleTextChange(ev, 'password')}
                />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit">
                {formatMsg(intl, 'login')}
              </Button>
            </FormItem>
          </Form>
        </Spin >
      </Card>
    );
  }
}
