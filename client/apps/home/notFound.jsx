import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import HeaderNavBar from 'client/components/HeaderNavBar';
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
export default class NotFound extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    setNavTitle: PropTypes.func.isRequired,
  };
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1,
    });
  }
  handleBackClick = () => {
    this.context.router.goBack();
  }
  render() {
    const { intl } = this.props;
    return (
      <div className="welo-layout-wrapper">
        <HeaderNavBar />
        <div className="layout-content">
          <div className="centered-card">
            <Card bodyStyle={{ padding: 32 }}>
              <Alert
                message={formatMsg(intl, 'notFound')}
                description={formatMsg(intl, 'notFoundDesc')}
                type="warning"
              />
              <Button type="ghost" style={{ width: '100%' }} onClick={this.handleBackClick}>返回</Button>
            </Card>
          </div>
        </div>
      </div>);
  }
}
