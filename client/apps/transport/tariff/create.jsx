import React, { PropTypes } from 'react';
import { Tabs, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import { loadFormParams } from 'common/reducers/transportTariff';
import AgreementForm from './forms/agreement';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function fetchData({ dispatch, state }) {
  return dispatch(loadFormParams(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: formatMsg(props.intl, 'tariffCreate'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
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
      <div className="main-content">
        <div className="page-body">
          <div className="panel-body">
            <Tabs onChange={this.handleTabChange}>
              <TabPane tab={<span><Icon type="book" />协议概括</span>} key="agreement">
                <AgreementForm />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
