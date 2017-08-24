import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, message } from 'antd';
import TransitForm from './transitAttribForm';
import { hideTransitionDock, splitTransit, moveTransit } from 'common/reducers/cwmTransition';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    detail: state.cwmTransition.transitionDock.detail,
  }),
  { hideTransitionDock, splitTransit, moveTransit }
)
@Form.create()
export default class TransitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  formValue = {
    target_location: null,
    movement_no: null,
  }
  handleValueChange = (keyValue) => {
    this.formValue[keyValue.key] = keyValue.value;
  }
  handleTransit = () => {
    const transitValues = this.props.form.getFieldsValue();
    const transit = {};
    let valueChanged = false;
    Object.keys(transitValues).forEach((transitKey) => {
      if (transitValues[transitKey] !== this.props.detail[transitKey]) {
        valueChanged = true;
        transit[transitKey] = transitValues[transitKey];
      }
    });
    const { loginName, tenantId } = this.props;
    let transitOp;
    if (this.formValue.target_location) {
      if (this.formValue.movement_no) {
        transitOp = this.props.moveTransit([this.props.detail.trace_id], transit, this.formValue.target_location,
          this.formValue.movement_no, loginName, tenantId);
      } else {
        message.error('移库单未选');
      }
    } else if (valueChanged) {
      transitOp = this.props.splitTransit([this.props.detail.trace_id], transit, loginName, tenantId);
    }
    if (transitOp) {
      transitOp.then((result) => {
        if (!result.error) {
          this.props.hideTransitionDock({ needReload: true });
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const { detail, form } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Button type="primary" onClick={this.handleTransit}>执行转移</Button>
        <Form>
          <TransitForm batched={false} detail={detail} form={form} onChange={this.handleValueChange} />
        </Form>
      </div>
    );
  }
}
