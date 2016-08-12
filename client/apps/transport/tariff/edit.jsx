import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import SurchargeForm from './forms/surcharge';
import { loadTariff } from 'common/reducers/transportTariff';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function fetchData({ params, dispatch }) {
  return dispatch(loadTariff(params.uid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    name: state.transportTariff.agreement.name, // todo: 连续两次进入,标题不会变
  })
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: props.name,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
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
      <div className="main-content">
        <div className="page-body">
          <div className="panel-body">
            <Tabs defaultActiveKey="agreement">
              <TabPane tab={<span>协议概况</span>} key="agreement">
                <AgreementForm readonly />
              </TabPane>
              <TabPane tab={<span>基础费率</span>} key="rates">
                <RatesForm />
              </TabPane>
              <TabPane tab={<span>附加费税</span>} key="surcharges">
                <SurchargeForm />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
