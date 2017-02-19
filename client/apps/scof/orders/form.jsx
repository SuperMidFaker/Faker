import React, { Component, PropTypes } from 'react';
import { Form, Steps } from 'antd';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadFormRequires } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import BasicForm from './forms/basicForm';
import ClearanceForm from './forms/clearanceForm';
import TransportForm from './forms/transportForm';
const formatMsg = format(messages);
const Step = Steps.Step;

function fetchData({ state, dispatch }) {
  return dispatch(loadFormRequires({
    tenantId: state.account.tenantId,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    formData: state.crmOrders.formData,
  }),
  { }
)
export default class OrderForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formData: PropTypes.object.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
  }

  msg = key => formatMsg(this.props.intl, key)
  renderSteps = (shipmtOrderMode) => {
    const { operation, formData } = this.props;
    const steps = [];
    for (let i = 0; i < shipmtOrderMode.length; i++) {
      const mode = shipmtOrderMode[i];
      if (mode === 'clearance') {
        steps.push(<Step key={i + 1} title="清关" status="process" description={<ClearanceForm formData={formData.subOrders[i]} index={i} operation={operation} />} />);
      } else if (mode === 'transport') {
        steps.push(<Step key={i + 1} title="运输" status="process" description={<TransportForm formData={formData.subOrders[i]} index={i} operation={operation} />} />);
      }
    }
    return steps;
  }
  render() {
    const { formData, operation } = this.props;
    const shipmtOrderMode = formData.shipmt_order_mode === '' ? [] : formData.shipmt_order_mode.split(',');
    const current = shipmtOrderMode.length > 0 ? shipmtOrderMode.length : 0;
    return (
      <Form horizontal>
        <BasicForm operation={operation} />
        <Steps direction="vertical" current={current}>
          {this.renderSteps(shipmtOrderMode)}
        </Steps>
      </Form>
    );
  }
}
