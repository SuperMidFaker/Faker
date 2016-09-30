import React, { PropTypes } from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import BillingForm from './billingForm';
import BillingFeesList from './billingFeesList';

@connectNav({
  depth: 2,
  moduleName: 'transport',
})

export default class CreateBilling extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['receivable', 'payable']),
  }
  state = {
    step: 1,
  }
  handleNextStep = () => {
    this.setState({ step: 2 });
  }
  render() {
    if (this.state.step === 1) {
      return (<BillingForm type={this.props.type} nextStep={this.handleNextStep} />);
    } else if (this.state.step === 2) {
      return (<BillingFeesList type={this.props.type} />);
    }
  }
}
