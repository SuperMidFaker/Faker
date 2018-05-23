import React from 'react';
import { connect } from 'react-redux';
// import { intlShape, injectIntl } from 'react-intl';
import { Button, message } from 'antd';
import FormPane from 'client/components/FormPane';
import { splitTransit, moveTransit } from 'common/reducers/cwmTransition';
import TransitForm from './transitAttribForm';

// @injectIntl
@connect(
  state => ({
    loginName: state.account.username,
    detail: state.cwmTransition.transitionModal.detail,
  }),
  { splitTransit, moveTransit }
)
export default class TransitPane extends React.Component {
  static propTypes = {
    // intl: intlShape.isRequired,
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
        transit[transitKey] = transitValues[transitKey] || null;
      }
    });
    const { loginName } = this.props;
    let transitOp;
    if (this.formValue.target_location) {
      if (this.formValue.movement_no) {
        transitOp = this.props.moveTransit(
          [this.props.detail.trace_id], transit, this.formValue.target_location,
          this.formValue.movement_no, loginName
        );
      } else {
        message.error('库存移动单未选');
      }
    } else if (valueChanged) {
      transitOp = this.props.splitTransit([this.props.detail.trace_id], transit, loginName);
    }
    if (transitOp) {
      transitOp.then((result) => {
        if (!result.error) {
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
      <FormPane descendant>
        <TransitForm
          batched={false}
          detail={detail}
          form={form}
          onChange={this.handleValueChange}
        />
        <Button type="primary" onClick={this.handleTransit}>执行转移</Button>
      </FormPane>
    );
  }
}
