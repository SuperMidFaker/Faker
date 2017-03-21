import React, { Component, PropTypes } from 'react';
import { Form, Steps } from 'antd';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadFormRequires } from 'common/reducers/crmOrders';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import BasicForm from './forms/basicForm';
// import StepNodeForm from './forms/stepNodeForm';
import ClearanceForm from './forms/clearanceForm';
import TransportForm from './forms/transportForm';
import './orders.less';

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
  renderSteps = (subOrders) => {
    const { operation } = this.props;
    const steps = [];
    // steps.push(<Step key={1} status="process" description={<StepNodeForm formData={formData.subOrders[0]} index={0} operation={operation} />} />);
    for (let i = 0; i < subOrders.length; i++) {
      const order = subOrders[i];
      const node = order.node;
      if (node.kind === 'import' || node.kind === 'export') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<ClearanceForm formData={order} index={i} operation={operation} />} />);
      } else if (node.kind === 'tms') {
        steps.push(<Step key={node.node_uuid} title={node.name} status="process" description={<TransportForm formData={order} index={i} operation={operation} />} />);
      }
    }
    return steps;
  }
  render() {
    const { formData, operation } = this.props;
    const current = formData.subOrders.length || 0;
    return (
      <Form layout="horizontal" className="order-flow-form">
        <BasicForm operation={operation} />
        <Steps direction="vertical" current={current}>
          {this.renderSteps(formData.subOrders)}
        </Steps>
      </Form>
    );
  }
}
