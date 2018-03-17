import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Select, message } from 'antd';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse }
)
export default class WhseSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    bonded: PropTypes.bool,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);

    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
    message.info(this.msg('whseChanged'));
  }
  render() {
    const {
      whses, defaultWhse, bonded, disabled,
    } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded);
    const whseList = bonded ? bondedWhses : whses;
    return (
      <Select
        value={defaultWhse.code}
        placeholder={this.msg('selectWhse')}
        onSelect={this.handleWhseChange}
        disabled={disabled}
      >
        {whseList.map(warehouse =>
          (<Option key={warehouse.code} value={warehouse.code}>{warehouse.name}</Option>))
        }
      </Select>
    );
  }
}
