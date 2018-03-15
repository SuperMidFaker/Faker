import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { DatePicker, Icon, Popover } from 'antd';

import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { RangePicker } = DatePicker;

@injectIntl
export default class RangePickerPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
  }

  componentDidMount() {
    window.document.addEventListener('click', this.handleClick);
  }
  handleClick = () => {
    /*
    const pickupDeliverClicked = window.$(event.target).closest('.picker').length > 0;
    const antPopoverClicked = window.$(event.target).closest('.ant-popover').length > 0;
    const calenderClicked = window.$(event.target).closest('.ant-calendar-picker-container').length > 0;
    if (!pickupDeliverClicked && !calenderClicked && !antPopoverClicked && this.state.visible) {
      this.handleClose();
    }
    */
  }

  handleClose = () => {
    this.setState({ visible: false });
  }
  msg = key => formatMsg(this.props.intl, key)

  handleShowPopover = (visible) => {
    if (visible) {
      this.setState({ visible });
    }
  }

  render() {
    return (
      <Popover
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleShowPopover}
        content={<RangePicker size="small" onChange={this.props.onChange} />}
      >
        <Icon type="filter" className="picker" />
      </Popover>
    );
  }
}
