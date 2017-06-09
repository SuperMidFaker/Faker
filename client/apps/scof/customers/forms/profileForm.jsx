import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import SubCustomerList from '../cards/subCustomerList';
import { format } from 'client/common/i18n/helpers';
import { showCustomerModal } from 'common/reducers/crmCustomers';
import messages from '../message.i18n';
import CustomerData from '../cards/customerData';
import ServiceTeam from '../cards/serviceTeam';

const formatMsg = format(messages);


@injectIntl
@connect(
  () => ({
  }),
  { showCustomerModal }
)

export default class ProfileForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer } = this.props;
    return (
      <div>
        <CustomerData customer={customer} />
        {customer.parent_id === 0 ? (<SubCustomerList customer={customer} />) : null}
        <ServiceTeam customer={customer} />
      </div>
    );
  }
}
