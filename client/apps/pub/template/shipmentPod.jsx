/* eslint no-undef: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Tag } from 'antd';
import { loadPubShipmtPod } from 'common/reducers/shipment';
import connectFetch from 'client/common/decorators/connect-fetch';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

function fetchData({ dispatch, params }) {
  return dispatch(loadPubShipmtPod(params.shipmtNo, params.podId, params.key));
}

@connectFetch()(fetchData)
@connect(
  state => ({
    shipmtDetail: state.shipment.shipmtDetail,
  }),
  { }
)
@injectIntl
export default class ShipmentPod extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { shipmt, pod } = this.props.shipmtDetail;
    const titleColor = '#FFD700';
    const contentTab = 10;

    let tagColor = '';
    let signStatusDescription = '状态未知';
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
      <div className="panel-body" style={{
 backgroundColor: '#fff', width: 800, height: 1080, padding: 50,
}}
      >
        <Row >
          <div style={{ float: 'right', fontSize: 16 }}>
            {moment(new Date()).format('YYYY-MM-DD')}
          </div>
        </Row>
        <Row>
          <div style={{ fontSize: 18 }}>
            运单-{shipmt.shipmt_no}
          </div>
        </Row>
        <hr style={{ border: 'solid 1px', marginTop: 10 }} />
        <Row style={{ marginTop: 10, fontSize: 15, color: titleColor }}>
          - 客户信息
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          客户名称: {shipmt.customer_name}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          客户单号: {shipmt.ref_external_no}
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          关联提运单号: {shipmt.ref_waybill_no}
        </Row>
        <Row style={{ marginTop: 10, fontSize: 15, color: titleColor }}>
          - 回单信息
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          <div><Tag color={tagColor}>{signStatusDescription}</Tag> <span>{pod.sign_remark}</span></div>
        </Row>
        <Row style={{ paddingLeft: contentTab, marginTop: 8 }}>
          {pod.photos ? pod.photos.split(',').map(item => (<div key={item} style={{ display: 'inline-block', marginRight: 20 }}><img style={{ width: 250, height: 'auto' }} src={item} alt="照片加载中..." /></div>)) : '此回单没有照片'}
        </Row>
      </div>
    );
  }
}
