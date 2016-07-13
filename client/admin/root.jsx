import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import '../apps/root/root.less';

@connect(
  state => ({
    locale: state.intl.locale,
    messages: state.intl.messages,
    isAuthed: state.auth.isAuthed,
  })
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    isAuthed: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      const query = __DEV__ ? { subdomain: this.props.location.query.subdomain } : {};
      this.context.router.replace({ pathname: redirectUrl, query });
    }
  }

  render() {
    const { locale, messages } = this.props;
    return (
      <IntlProvider key={locale}
        locale={locale}
        messages={messages}
      >
        {this.props.children}
        </IntlProvider>
      );
  }
}
