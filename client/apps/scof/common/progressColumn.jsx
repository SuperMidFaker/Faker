import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Steps } from 'antd';
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
        <Steps size="small" current={1}>
          <Step title="Finished" />
          <Step title="In Progress" />
          <Step title="Waiting" />
        </Steps>
      );
    } else {
      return <div />;
    }
  }
}
