import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Popover } from 'antd';

@injectIntl
export default class CcbDelgNoColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    nos: PropTypes.string,
  }

  render() {
    const { nos } = this.props;
    if (nos && nos !== '') {
      const noArray = nos.split(',');
      const content = (
        <div>
          {noArray.map(item => <p key={item}>{item}</p>)}
        </div>
      );
      return (
        <Popover content={content} title="清关编号">
          <div>{`${noArray[0]}${noArray.length > 1 ? '...' : ''}`}</div>
        </Popover>
      );
    } else {
      return <div />;
    }
  }
}
