import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadTariff, loadFormParams } from 'common/reducers/transportTariff';
import Main from './Main';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

function fetchData({ state, params, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadFormParams(state.account.tenantId)));
  proms.push(dispatch(loadTariff({
    tariffId: params.uid,
    tenantId: state.account.tenantId,
  })));
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    name: state.transportTariff.agreement.name,
  })
)
@connectNav({
  depth: 3,
  text: props => props.name,
  moduleName: 'transport',
  lifecycle: 'componentWillReceiveProps',
  until: props => props.name,
})
@withPrivilege({ module: 'transport', feature: 'tariff', action: 'edit' })
export default class TariffEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    name: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    return (
      <Main type="edit" />
    );
  }
}
