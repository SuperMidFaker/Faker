import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import { loadNewForm, loadFormParams } from 'common/reducers/transportTariff';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function fetchData({ dispatch, state }) {
  dispatch(loadNewForm());
  return dispatch(loadFormParams(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tariffId: state.transportTariff.tariffId,
  })
)
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
    tariffId: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  render() {
    const { tariffId } = this.props;
    const panes = [
      <TabPane tab={<span><Icon type="book" />协议概括</span>} key="agreement">
        <AgreementForm />
      </TabPane>,
    ];
    if (tariffId) {
      panes.push(
        <TabPane tab={<span><Icon type="file-text" />基础费率</span>} key="rates">
          <RatesForm />
        </TabPane>
      );
    }
    return (
      <div className="main-content">
        <div className="page-body">
          <div className="panel-body">
            <Tabs defaultActiveKey="agreement">
              {panes}
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
