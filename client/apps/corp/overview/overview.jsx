import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 1,
  moduleName: 'corp',
})
export default class CorpOverview extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <div className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Order">
                  hello
                </Card>
                <Card title="Shipment">
                  hello
                </Card>
                <Card title="Payment">
                  hello
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Alerts" style={{ height: '100%' }}>
                  hello
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Statistics">
                    hello
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
