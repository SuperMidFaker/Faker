import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape } from 'react-intl';
import InputItem from './input-item';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@connect(
  state => ({
    distance: state.shipment.formData.distance,
  }),
  { }
)
export default class DistanceInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    distance: PropTypes.string,
    outerColSpan: PropTypes.number.isRequired,
    mode: PropTypes.string,
    vertical: PropTypes.bool,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { formhoc, distance, vertical } = this.props;

    let content = '';
    if (vertical) {
      content = (
        <div>
          <InputItem formhoc={formhoc} labelName={this.msg('distance')}
            field="distance" fieldProps={{ initialValue: distance }}
          />
        </div>
      );
    } else {
      content = null;
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}
