import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Switch, Row, Col } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { showCustomerModal } from 'common/reducers/crmCustomers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({}),
  { showCustomerModal }
)
export default class ServiceCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col span={16} />
            <Col span={8}><Switch defaultChecked={false} onChange={this.onChange} /></Col>
          </Row>
        </Card>
      </div>
    );
  }
}
