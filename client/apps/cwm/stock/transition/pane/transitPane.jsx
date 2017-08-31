import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, message } from 'antd';
import TransitForm from './transitAttribForm';
import { closeTransitionModal, splitTransit, moveTransit } from 'common/reducers/cwmTransition';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    detail: state.cwmTransition.transitionModal.detail,
  }),
  { closeTransitionModal, splitTransit, moveTransit }
)

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
        message.error('库存移动单未选');
      }
    } else if (valueChanged) {
      transitOp = this.props.splitTransit([this.props.detail.trace_id], transit, loginName, tenantId);
    }
    if (transitOp) {
      transitOp.then((result) => {
        if (!result.error) {
          // this.props.closeTransitionModal({ needReload: true });
          message.success('库存转移成功');
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const { detail, form } = this.props;
    return (
      <div>
        <TransitForm batched={false} detail={detail} form={form} onChange={this.handleValueChange} />
        <Button type="primary" onClick={this.handleTransit}>执行转移</Button>
      </div>
    );
  }
}
