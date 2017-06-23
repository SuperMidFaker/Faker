import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card } from 'antd';
import { } from 'common/constants';
// import InfoItem from 'client/components/InfoItem';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    order: state.crmOrders.dock.order,
  }), { }
)
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: '',
  }

  render() {
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['receiveDetails', 'putAwayDetails']}>
            <Panel header="收货明细" key="receiveDetails" />
            <Panel header="上架明细" key="putAwayDetails" />
          </Collapse>
        </Card>
      </div>
    );
  }
}
