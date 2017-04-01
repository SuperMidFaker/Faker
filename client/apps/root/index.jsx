import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import { loadCorpByDomain } from 'common/reducers/corp-domain';
import { loadTranslation } from 'common/reducers/intl';
import { isLoaded } from 'client/common/redux-actions';
import connectFetch from 'client/common/decorators/connect-fetch';
import './root.less';

const MomentLocaleMap = {
  zh: 'zh-cn',
  en: 'en',
};

const AntdLocaleMap = {
  zh: null,
  en: enUS,
};

function fetchData({ state, dispatch, cookie, location }) {
  const promises = [];
  if (!isLoaded(state, 'corpDomain')) {
    const query = location.query;
    const prom = dispatch(loadCorpByDomain(cookie, query.subdomain));
    promises.push(prom);
  }
  if (!isLoaded(state, 'intl')) {
    // set initial locale on server render FIXME
    const prom = dispatch(loadTranslation(state.intl.locale));
    promises.push(prom);
  }
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    locale: state.intl.locale,
    messages: state.intl.messages,
    isAuthed: state.auth.isAuthed,
  }),
)
export default class Root extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    locale: PropTypes.oneOf(['zh', 'en']),
    messages: PropTypes.object.isRequired,
    isAuthed: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { locale } = this.props;
    moment.locale(MomentLocaleMap[locale]);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.isAuthed && nextProps.isAuthed) {
      const redirectUrl = this.props.location.query.next || '/';
      const query = __DEV__ ? { subdomain: this.props.location.query.subdomain } : {};
      this.context.router.replace({ pathname: redirectUrl, query });
    }
    if (nextProps.locale !== this.props.locale) {
      moment.locale(MomentLocaleMap[nextProps.locale]);
    }
  }
  render() {
    const { locale, messages } = this.props;
    return (
      <LocaleProvider locale={AntdLocaleMap[locale]}>
        <IntlProvider locale={locale} messages={messages}>
          {this.props.children}
        </IntlProvider>
      </LocaleProvider>);
  }
}
