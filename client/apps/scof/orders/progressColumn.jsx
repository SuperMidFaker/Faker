import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Steps } from 'antd';
import './orders.less';

const Step = Steps.Step;

@injectIntl
export default class progressColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
  }

  render() {
    const { order } = this.props;
    if (order) {
      return (
        <div className="order-progress">
          <Steps size="small" current={1}>
            <Step title="Finished" />
            <Step title="In Progress" />
            <Step title="Waiting" />
          </Steps>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
