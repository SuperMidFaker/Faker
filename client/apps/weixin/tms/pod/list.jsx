import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPodTable, loadUploadedPodTable, toUploadPod } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';

import WeUI from 'react-weui';
import '../../weui.less';

const {Cells, CellsTitle, Cell, CellBody, CellFooter, Icon} = WeUI;

function fetchData({ state, dispatch, cookie }) {
  const promises = [];
  let p = dispatch(loadPodTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify([ { name: 'type', value: 'delivered' } ]),
    pageSize: state.weixin.shipmentlist.pageSize,
    currentPage: state.weixin.shipmentlist.current,
  }));
  promises.push(p);
  p = dispatch(loadUploadedPodTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify([ { name: 'type', value: 'submitted' } ]),
    pageSize: state.weixin.uploadedShipmentlist.pageSize,
    currentPage: state.weixin.uploadedShipmentlist.current,
  }));
  promises.push(p);
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connect(
  state => ({
    profile: state.weixin.profile,
    shipmentlist: state.weixin.shipmentlist,
    uploadedShipmentlist: state.weixin.uploadedShipmentlist,
  }),
  { toUploadPod }
)
export default class List extends React.Component {
  static propTypes = {
    profile: PropTypes.object.isRequired,
    toUploadPod: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleUploadPod(item) {
    this.props.toUploadPod(item.disp_id, item.parent_id, item.shipmt_no);
    this.handleNavigationTo('/weixin/tms/pod/upload');
  }
  render() {
    const {shipmentlist, uploadedShipmentlist} = this.props;
    return (
      <div className="panel-body">
        <section>
          <CellsTitle>待上传回单</CellsTitle>
            <Cells access>
            {shipmentlist.data.map(item => {
              return (
                  <Cell className="" onClick={() => {this.handleUploadPod(item); }}>
                    <CellBody>
                      {item.shipmt_no}
                    </CellBody>
                    <CellFooter>
                      {item.deliver_act_date}
                    </CellFooter>
                  </Cell>
                );
            })}
            </Cells>
          <CellsTitle>最近已上传回单</CellsTitle>
          <Cells>
            {uploadedShipmentlist.data.map(item => {
              return (
                <Cell style={{color: '#CCCCCC'}}>
                  <CellBody>
                    {item.shipmt_no}
                  </CellBody>
                  <CellFooter>
                    <Icon value="success_no_circle" />
                  </CellFooter>
                </Cell>
                );
            })}
          </Cells>
        </section>
      </div>
    );
  }
}
