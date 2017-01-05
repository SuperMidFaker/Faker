import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import HeaderNavBar from 'client/components/headerNavBar';
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
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1,
    });
  }
  render() {
    const { intl } = this.props;
    return (
      <div className="layout-wrapper layout-nosider-left">
        <HeaderNavBar />
        <div className="layout-content">
          <div className="centered-card">
            <Card bodyStyle={{ padding: 32 }}>
              <Alert
                message={formatMsg(intl, 'notFound')}
                description={formatMsg(intl, 'notFoundDesc')}
                type="warning"
              />
              <Button type="ghost" size="large" style={{ width: '100%' }}>返回</Button>
            </Card>
          </div>
        </div>
      </div>);
  }
}
