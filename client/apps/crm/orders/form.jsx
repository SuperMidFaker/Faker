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

  render() {
    const { operation, formData } = this.props;
    let current = 2;
    if (formData.shipmt_order_mode === 0) {
      current = 1;
    } else if (formData.shipmt_order_mode === 1) {
      current = 1;
    }
    if (formData.shipmt_order_mode === 0) {
      return (
        <Form horizontal>
          <Steps direction="vertical" current={current}>
            <Step title="基础信息" description={<BasicForm operation={operation} />} />
            <Step title="清关" description={<ClearanceForm operation={operation} />} />
          </Steps>
        </Form>
      );
    } else if (formData.shipmt_order_mode === 1) {
      return (
        <Form horizontal>
          <Steps direction="vertical" current={current}>
            <Step title="基础信息" description={<BasicForm operation={operation} />} />
            <Step title="运输" description={<TransportForm operation={operation} />} />
          </Steps>
        </Form>
      );
    } else if (formData.shipmt_order_mode === 2) {
      return (
        <Form horizontal>
          <Steps direction="vertical" current={current}>
            <Step title="基础信息" description={<BasicForm operation={operation} />} />
            <Step title="清关" description={<ClearanceForm operation={operation} />} />
            <Step title="运输" description={<TransportForm operation={operation} />} />
          </Steps>
        </Form>
      );
    }
    return null;
  }
}
