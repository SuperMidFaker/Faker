import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import TrimSpan from 'client/components/trimSpan';
import { Popover, Button } from 'antd';
import { loadShipmtPoints } from 'common/reducers/shipment';
import TrackingTimeline from './trackingTimeline';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';

@connect(
  () => ({
  }),
  {
    loadShipmtPoints,
  }
)

export default class ShipmtNoColumnRender extends React.Component {
  static propTypes = {
    publicKey: PropTypes.string.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    shipment: PropTypes.object.isRequired,
    loadShipmtPoints: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  }
  state = {
    tracking: {
      points: [],
    },
  }
  makeShipmtPublicUrl(shipmtNo, publicKey) {
    return `/pub/tms/tracking/detail/${shipmtNo}/${publicKey}`;
  }
  handleClick = (ev) => {
    ev.stopPropagation();
    this.props.onClick(this.props.shipment);
    return false;
  }
  handleMouseOver = () => {
    const { shipmtNo, shipment } = this.props;
    if (shipment.status >= SHIPMENT_TRACK_STATUS.intransit) {
      this.props.loadShipmtPoints(shipmtNo).then(result => {
        this.setState({ tracking: result.data });
      });
    }
  }
  render() {
    const { publicKey, shipmtNo, shipment, ...extra } = this.props;
    const content = (
      <div>
        <TrackingTimeline tracking={this.state.tracking} />
          <a href={this.makeShipmtPublicUrl(shipmtNo, publicKey)}
            target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: '60%' }}
          >
            <Button type="primary" size="small" >查看详情</Button>
          </a>
      </div>
    );
    if (shipment.status >= SHIPMENT_TRACK_STATUS.intransit) {
      return (
        <Popover placement="rightTop" title="位置追踪" content={content} trigger="hover">
          <a onClick={this.handleClick} onMouseOver={this.handleMouseOver}>
            <TrimSpan text={shipmtNo} maxLen={16} />
          </a>
        </Popover>
      );
    } else {
      return (
        <a {...extra} onClick={this.handleClick}>
          <TrimSpan text={shipmtNo} maxLen={16} />
        </a>
      );
    }
  }
}
