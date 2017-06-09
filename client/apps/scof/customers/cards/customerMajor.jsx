import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Tabs } from 'antd';
import FlowRulesPane from '../flowRulesPane';
import ConsignInfoPane from '../consignInfoPane';
import TariffPane from '../tariffPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  () => ({}),
  {},
)

export default class CustomerMajor extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { customer } = this.props;
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <Tabs defaultActiveKey="flowRules">
          <TabPane tab={<span><i className="icon icon-fontello-flow-tree" />流程规则</span>} key="flowRules" >
            <FlowRulesPane customer={customer} />
          </TabPane>
          <TabPane tab={<span><i className="icon icon-fontello-book" />价格协议</span>} key="tariff">
            <TariffPane customer={customer} />
          </TabPane>
          <TabPane tab={<span><i className="icon icon-fontello-doc-text" />收发货信息</span>} key="consignInfo">
            <ConsignInfoPane customer={customer} />
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}
