import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class ActualDate extends React.Component {
  static propTypes = {
    actDate: PropTypes.string.isRequired,
    estDate: PropTypes.string.isRequired,
    textBefore: PropTypes.string,
    textAfter: PropTypes.string,
  }

  render() {
    const {
      actDate, estDate, textBefore, textAfter,
    } = this.props;
    if (actDate) {
      const act = new Date(actDate);
      act.setHours(0, 0, 0, 0);
      const est = new Date(estDate);
      est.setHours(0, 0, 0, 0);
      if (act.getTime() > est.getTime()) {
        return (
          <span className="mdc-text-red">
            {textBefore} {moment(actDate).format('YYYY.MM.DD')} {textAfter}
          </span>);
      } else {
        return (
          <span className="mdc-text-green">
            {textBefore} {moment(actDate).format('YYYY.MM.DD')} {textAfter}
          </span>);
      }
    } else {
      return <span />;
    }
  }
}
