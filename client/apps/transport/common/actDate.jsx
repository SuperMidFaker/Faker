import React, { PropTypes } from 'react';
import moment from 'moment';

export default class ActDate extends React.Component {
  static propTypes = {
    actDate: PropTypes.object.isRequired,
    estDate: PropTypes.object.isRequired,
  }

  render() {
    const { actDate, estDate } = this.props;
    if (actDate) {
      const act = new Date(actDate);
      act.setHours(0, 0, 0, 0);
      const est = new Date(estDate);
      est.setHours(0, 0, 0, 0);
      if (act.getTime() > est.getTime()) {
        return (
          <span className="mdc-text-red">
            {moment(actDate).format('YYYY.MM.DD')}
          </span>);
      } else {
        return (
          <span className="mdc-text-green">
            {moment(actDate).format('YYYY.MM.DD')}
          </span>);
      }
    } else {
      return <span />;
    }
  }
}
