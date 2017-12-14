import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Card, Carousel } from 'antd';
import { loadPod } from 'common/reducers/trackingLandPod';
import { format } from 'client/common/i18n/helpers';
import SubmitPODForm from './form/submitPodForm';
import AuditPODForm from './form/auditPodForm';
import { SHIPMENT_POD_STATUS } from 'common/constants';
import messages from '../../message.i18n';
const formatMsg = format(messages);


@injectIntl
@connect(state => ({
  podId: state.shipment.previewer.dispatch.pod_id,
  shipmt: state.shipment.previewer.shipmt,
  disp: state.shipment.previewer.dispatch,
}), { loadPod })
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
    if (this.props.podId) {
      this.props.loadPod(this.props.podId).then((result) => {
        this.setState({ pod: result.data });
      });
    }
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
        <Carousel autoplay>
          {pod.photos.split(',').map(item => (<div key={item}><img style={{ width: '100%' }} src={item} alt="照片加载中..." /></div>))}
        </Carousel>
      );
    } else {
      return (<div>未上传回单照片</div>);
    }
  }
  render() {
    const { disp } = this.props;
    // const isOfflineSP = (disp.sp_tenant_id === -1) || (disp.sp_tenant_id === 0 && disp.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected);
    let podStatus = '';
    let podStatusDesc = '';
    switch (disp.pod_status) {
      case SHIPMENT_POD_STATUS.unsubmit:
        podStatus = '未上传';
        break;
      case SHIPMENT_POD_STATUS.pending:
        podStatus = '待审核';
        break;
      case SHIPMENT_POD_STATUS.rejectByUs:
        podStatus = '我方拒绝';
        podStatusDesc = '等待承运商重新提交';
        break;
      case SHIPMENT_POD_STATUS.acceptByUs:
        podStatus = '我方接受';
        podStatusDesc = '已向客户提交，等待审核';
        break;
      case SHIPMENT_POD_STATUS.rejectByClient:
        podStatus = '客户拒绝';
        break;
      case SHIPMENT_POD_STATUS.acceptByClient:
        podStatus = '客户接受';
        podStatusDesc = '客户已接受此回单';
        break;
      default:
        podStatus = '未知状态';
        break;
    }
    const rejectedByClient = disp.pod_status === SHIPMENT_POD_STATUS.rejectByClient;
    return (
      <div className="pane-content tab-pane">
        {(disp.pod_status === SHIPMENT_POD_STATUS.rejectByUs) &&
        <Alert
          message={podStatus}
          description={podStatusDesc}
          type="error"
          showIcon
        />
        }
        {(disp.pod_status === SHIPMENT_POD_STATUS.acceptByUs || disp.pod_status === SHIPMENT_POD_STATUS.acceptByClient) &&
        <Alert
          message={podStatus}
          description={podStatusDesc}
          type="success"
          showIcon
        />
        }
        <Card bodyStyle={{ padding: 16 }} hoverable={false}>
          {(disp.pod_status === '' || disp.pod_status === SHIPMENT_POD_STATUS.unsubmit || rejectedByClient) &&
          <SubmitPODForm rejected={rejectedByClient} />
          }
          {(disp.pod_status === SHIPMENT_POD_STATUS.pending) &&
          <AuditPODForm pod={this.state.pod} auditable />
          }
          {(disp.pod_status === SHIPMENT_POD_STATUS.rejectByUs ||
            disp.pod_status === SHIPMENT_POD_STATUS.acceptByUs ||
            disp.pod_status === SHIPMENT_POD_STATUS.acceptByClient) &&
            <AuditPODForm pod={this.state.pod} />
          }
        </Card>
      </div>
    );
  }
}
