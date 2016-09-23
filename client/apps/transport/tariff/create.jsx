import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadNewForm, loadFormParams } from 'common/reducers/transportTariff';
import Main from './Main';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

function fetchData({ dispatch, state }) {
  dispatch(loadNewForm());
  return dispatch(loadFormParams(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'tariffCreate'),
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'tariff', action: 'create' })
export default class TariffCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    return (
      <Main type="create" />
    );
  }
}
