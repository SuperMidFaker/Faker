/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { Steps, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;

@injectIntl
export default class ClearanceStatus extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    status: PropTypes.number.isRequired,
    subStatus: PropTypes.number,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { status, subStatus } = this.props;
    let declaredDelegation = this.msg('declaredDelegation');
    let releasedDelegation = this.msg('releasedDelegation');
    if (subStatus === 1) {
      declaredDelegation = this.msg('declaredPartDelegation');
      releasedDelegation = this.msg('releasedPartDelegation');
    }
    let statusDes = [];
    let statusPos = 0;
    if (status === 0) {
      statusDes = [{
        status: 'finish',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'wait',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'wait',
        title: this.msg('processedDelegation'),
      }, {
        status: 'wait',
        title: declaredDelegation,
      }, {
        status: 'wait',
        title: releasedDelegation,
      }];
      statusPos = 0;
    } else if (status === 1) {
      statusDes = [{
        status: 'finish',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'wait',
        title: this.msg('processedDelegation'),
      }, {
        status: 'wait',
        title: declaredDelegation,
      }, {
        status: 'wait',
        title: releasedDelegation,
      }];
      statusPos = 1;
    } else if (status === 2) {
      statusDes = [{
        status: 'finish',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('processedDelegation'),
      }, {
        status: 'wait',
        title: declaredDelegation,
      }, {
        status: 'wait',
        title: releasedDelegation,
      }];
      statusPos = 2;
    } else if (status === 3) {
      statusDes = [{
        status: 'finish',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('processedDelegation'),
      }, {
        status: 'finish',
        title: declaredDelegation,
      }, {
        status: 'wait',
        title: releasedDelegation,
      }];
      statusPos = 3;
    } else if (status === 4) {
      statusDes = [{
        status: 'finish',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'finish',
        title: this.msg('processedDelegation'),
      }, {
        status: 'finish',
        title: declaredDelegation,
      }, {
        status: 'finish',
        title: releasedDelegation,
      }];
      statusPos = 4;
    } else {
      statusDes = [{
        status: 'wait',
        title: this.msg('unacceptedDelegation'),
      }, {
        status: 'wait',
        title: this.msg('acceptedDelegation'),
      }, {
        status: 'wait',
        title: this.msg('processedDelegation'),
      }, {
        status: 'wait',
        title: declaredDelegation,
      }, {
        status: 'wait',
        title: releasedDelegation,
      }];
      statusPos = -1;
    }
    const steps = statusDes.map((s, i) => <Step key={i} status={s.status} title={s.title} />);
    return (
      <Card>
        <Steps current={statusPos}>{steps}</Steps>
      </Card>
    );
  }
}
