import React from 'react';
import PropTypes from 'prop-types';
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
    quoteNo: params.quoteNo,
    version: params.version,
    tenantId: state.account.tenantId,
    status: 'draft',
  })));
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 3,
  moduleName: 'transport',
  lifecycle: 'componentWillReceiveProps',
})
@withPrivilege({ module: 'transport', feature: 'tariff', action: 'edit' })
export default class TariffEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
