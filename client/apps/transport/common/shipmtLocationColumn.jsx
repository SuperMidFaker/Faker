import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, Button, Icon } from 'antd';
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

export default class ShipmtLocationColumnRender extends React.Component {
  static propTypes = {
    publicKey: PropTypes.string.isRequired,
    shipment: PropTypes.object.isRequired,
    loadShipmtPoints: PropTypes.func.isRequired,
  }
  state = {
    points: [],
  }
  makeShipmtPublicUrl(shipmtNo, publicKey) {
    return `/pub/tms/tracking/detail/${shipmtNo}/${publicKey}`;
  }
  handleMouseOver = () => {
    const { shipment } = this.props;
    if (shipment.status >= SHIPMENT_TRACK_STATUS.intransit) {
      this.props.loadShipmtPoints(shipment.shipmt_no).then((result) => {
        this.setState({ points: result.data.points });
      });
    }
  }
  render() {
    const { publicKey, shipment } = this.props;
    const content = (
      <div>
        <TrackingTimeline points={this.state.points} type="small" />
        <a href={this.makeShipmtPublicUrl(shipment.shipmt_no, publicKey)}
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
          <span onMouseOver={this.handleMouseOver}>
            <Icon type="environment-o" style={{ color: 'rgb(232, 155, 48)' }} />
          </span>
        </Popover>
      );
    } else {
      return <span />;
    }
  }
}
