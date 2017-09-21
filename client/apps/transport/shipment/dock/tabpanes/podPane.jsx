import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Carousel, Tag } from 'antd';
import { loadPod } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    podId: state.shipment.previewer.dispatch.pod_id,
  }), { loadPod }
)
export default class PodPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    podId: PropTypes.number.isRequired,
    loadPod: PropTypes.func.isRequired,
  }
  state = {
    pod: {},
  }
  componentDidMount() {
    this.props.loadPod(this.props.podId).then((result) => {
      this.setState({ pod: result.data });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.podId !== nextProps.podId && nextProps.podId) {
      this.props.loadPod(nextProps.podId).then((result) => {
        this.setState({ pod: result.data });
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  renderPhotos() {
    const pod = this.state.pod;
    if (pod.photos && pod.photos !== '') {
      return (
        <div style={{ margin: '-24px' }}>
          <Carousel>
            {pod.photos.split(',').map(item => (<div key={item}><img style={{ width: '100%' }} src={item} alt="照片加载中..." /></div>))}
          </Carousel>
        </div>
      );
    } else {
      return (<div>此回单没有照片</div>);
    }
  }
  render() {
    let tagColor = '';
    let signStatusDescription = '状态未知';
    const pod = this.state.pod;
    if (pod.sign_status === 1) {
      signStatusDescription = '正常签收';
      tagColor = 'green';
    } else if (pod.sign_status === 2) {
      signStatusDescription = '异常签收';
      tagColor = 'yellow';
    } else if (pod.sign_status === 3) {
      signStatusDescription = '拒绝签收';
      tagColor = 'red';
    }
    return (
      <div className="pane-content tab-pane">
        <Card noHovering>
          <div><Tag color={tagColor}>{signStatusDescription}</Tag> <span>{pod.sign_remark}</span></div>
        </Card>
        <Card title="回单照片" noHovering>
          {this.renderPhotos()}
        </Card>
      </div>
    );
  }
}
