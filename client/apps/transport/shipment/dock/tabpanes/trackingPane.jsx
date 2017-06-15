import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Timeline, Icon, Popconfirm } from 'antd';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import * as Location from 'client/util/location';
import { removeShipmtPoint, loadShipmtPoints } from 'common/reducers/shipment';
import './pane.less';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { removeShipmtPoint, loadShipmtPoints }
)
export default class TrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipmtNo: PropTypes.string,
    removeShipmtPoint: PropTypes.func.isRequired,
    loadShipmtPoints: PropTypes.func.isRequired,
    dispatch: PropTypes.object.isRequired,
  }
  state = {
    points: [],
  }
  componentDidMount() {
    this.handleLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.shipmtNo !== nextProps.shipmtNo && nextProps.shipmtNo !== '') {
      this.handleLoad(nextProps);
    }
  }
  handleLoad = (props) => {
    this.props.loadShipmtPoints(props.shipmtNo).then((result) => {
      this.setState({ points: result.data.points });
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleRemovePoint = (pointId, content) => {
    this.props.removeShipmtPoint(pointId, content, this.props.dispatch.id);
  }
  render() {
    const points = [];
    this.state.points.forEach((item) => {
      points.push({
        ...item,
        date: `${moment(item.location_time || item.created_date).format('YYYY-MM-DD')}`,
        time: `${moment(item.location_time || item.created_date).format('HH:mm')}`,
        title: `${Location.renderLocation(item) || ''} ${item.address || ''}`,
        description: '',
      });
    });
    const trackingSteps = points.map((s, i) => {
      let color = 'green';
      let dotType = (<Icon type="environment-o" style={{ fontSize: '14px', backgroundColor: '#fff' }} />);
      if (i === 0) {
        color = 'blue';
        dotType = (<Icon type="environment" style={{ fontSize: '20px', backgroundColor: '#fff' }} />);
      }
      return (
        <Timeline.Item dot={dotType} key={s.id} color={color}>
          <span style={{ marginLeft: -100 }}>{s.date}</span>
          <span style={{ marginLeft: 34 }}>
            {s.title}
            <Popconfirm title="确定删除这条位置信息？" onConfirm={() => this.handleRemovePoint(s.id, s.title)}>
              <Icon type="close" className="timeline-remove" />
            </Popconfirm>
          </span>
          <div>{s.time}</div>
        </Timeline.Item>
      );
    });

    return (
      <Card>
        {trackingSteps.length > 0 ?
          (<Timeline style={{ marginLeft: 100 }}>{trackingSteps}</Timeline>) : '暂无追踪信息'}
      </Card>
    );
  }
}
