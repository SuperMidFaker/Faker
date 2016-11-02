import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({

  }),
)

export default class Profile extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    customer: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { customer } = this.props;
    return (
      <div>
        {customer.name}
      </div>
    );
  }
}
