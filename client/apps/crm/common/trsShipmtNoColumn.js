import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Popover } from 'antd';

@injectIntl
export default class TrsShipmtNoColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    trsShipmtNos: PropTypes.string,
  }

  render() {
    const { trsShipmtNos } = this.props;
    if (trsShipmtNos) {
      const nos = trsShipmtNos.split(',');
      const content = (
        <div>
          {nos.map((item, index) => <p key={index}>{item}</p>)}
        </div>
      );
      return (
        <Popover content={content} title="运输单号">
          <div>{`${nos[0]}${nos.length > 1 ? '...' : ''}`}</div>
        </Popover>
      );
    } else {
      return <div />;
    }
  }
}
