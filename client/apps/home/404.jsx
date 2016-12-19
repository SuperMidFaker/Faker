import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import AmNavBar from 'client/components/am-navbar';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
  }),
  { setNavTitle }
)
export default class Home extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    setNavTitle: PropTypes.func.isRequired,
  };
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1,
    });
  }
  render() {
    const { intl } = this.props;
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          404 {formatMsg(intl, 'notFound')}
        </div>
      </div>);
  }
}
