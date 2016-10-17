import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Carousel, Tag } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    pod: state.shipment.previewer.pod,
  })
)
export default class PodPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    pod: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  renderPhotos() {
    const pod = this.props.pod;
    if (pod.photos && pod.photos !== '') {
      return (
        <div style={{ margin: '-24px' }}>
          <Carousel>
            {pod.photos.split(',').map((item, index) => (<div key={index}><img style={{ width: '100%' }} src={item} alt="照片加载中..." /></div>))}
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
    const pod = this.props.pod;
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
        <Card style={{ width: '100%' }}>
          <div><Tag color={tagColor}>{signStatusDescription}</Tag> <span>{pod.sign_remark}</span></div>
        </Card>
        <Card title="回单照片" style={{ width: '100%' }}>
          {this.renderPhotos()}
        </Card>
      </div>
    );
  }
}
