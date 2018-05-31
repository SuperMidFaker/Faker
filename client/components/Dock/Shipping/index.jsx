import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Col, Row, Tabs, Button, Menu, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CWM_SO_STATUS, CWM_OUTBOUND_STATUS } from 'common/constants';
import { hideDock, changeDockTab, getSo, getSoUuid, getShipmtOrderNo, cancelOutbound, closeOutbound } from 'common/reducers/cwmShippingOrder';
import { loadOrderDetail } from 'common/reducers/sofOrders';
import { createFilename } from 'client/util/dataTransform';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import MasterPane from './tabpane/masterPane';
import DetailsPane from './tabpane/detailsPane';
import FTZPane from './tabpane/ftzPane';
import PickingPane from './tabpane/pickingPane';
import PackingPane from './tabpane/packingPane';
import ShippingPane from './tabpane/shippingPane';
import { formatMsg } from './message.i18n';

const { TabPane } = Tabs;

function getStatus(status) {
  switch (status) {
    case CWM_SO_STATUS.PENDING.value: return CWM_SO_STATUS.PENDING.badge;
    case CWM_SO_STATUS.OUTBOUND.value: return CWM_SO_STATUS.OUTBOUND.badge;
    case CWM_SO_STATUS.PARTIAL.value: return CWM_SO_STATUS.PARTIAL.badge;
    case CWM_SO_STATUS.COMPLETED.value: return CWM_SO_STATUS.COMPLETED.badge;
    default: return 'default';
  }
}
function getStatusMsg(status) {
  switch (status) {
    case CWM_SO_STATUS.PENDING.value: return CWM_SO_STATUS.PENDING.text;
    case CWM_SO_STATUS.OUTBOUND.value: return CWM_SO_STATUS.OUTBOUND.text;
    case CWM_SO_STATUS.PARTIAL.value: return CWM_SO_STATUS.PARTIAL.text;
    case CWM_SO_STATUS.COMPLETED.value: return CWM_SO_STATUS.COMPLETED.text;
    default: return '';
  }
}

@injectIntl
@connect(
  state => ({
    loginName: state.account.username,
    dock: state.cwmShippingOrder.dock,
    visible: state.cwmShippingOrder.dock.visible,
    tabKey: state.cwmShippingOrder.dock.tabKey,
    order: state.cwmShippingOrder.dock.order,
    defaultWhse: state.cwmContext.defaultWhse,
    uuid: state.cwmShippingOrder.dock.order.uuid,
    loading: state.cwmShippingOrder.dockLoading,
  }),
  {
    hideDock,
    changeDockTab,
    getSo,
    getSoUuid,
    getShipmtOrderNo,
    loadOrderDetail,
    cancelOutbound,
    closeOutbound,
  }
)
export default class ShippingDock extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    hideDock: PropTypes.func.isRequired,
    changeDockTab: PropTypes.func.isRequired,
    cancelOutbound: PropTypes.func.isRequired,
    closeOutbound: PropTypes.func.isRequired,
  }
  state = {
    soHead: {},
    soBody: [],
    outbounds: [],
    closeModalVisible: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.order.so_no && !this.props.visible && nextProps.visible) {
      this.props.getSoUuid(nextProps.order.so_no);
      this.props.getSo(nextProps.order.so_no).then((result) => {
        if (!result.error) {
          this.setState({
            soHead: result.data.soHead ? result.data.soHead : {},
            soBody: result.data.soBody,
            outbounds: result.data.outbounds,
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.props.hideDock();
  }
  msg = formatMsg(this.props.intl)
  handleTabChange = (tabKey) => {
    this.props.changeDockTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  cancelOutbound = (soNo) => {
    this.props.cancelOutbound({
      so_no: soNo,
      login_id: this.props.loginId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  closeOutbound = (pickedDealtype) => {
    const { loginName } = this.props;
    const { soHead } = this.state;
    this.props.closeOutbound({
      so_no: soHead.so_no, loginName, pickedDealtype,
    }).then((result) => {
      this.setState({ closeModalVisible: true });
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleMenuClick = (e) => {
    const { soHead } = this.state;
    if (e.key === 'cancel') {
      Modal.confirm({
        title: '确认取订单?',
        content: '确认后此订单的相关信息将会被删除',
        onOk: () => {
          this.cancelOutbound(soHead.so_no);
        },
        onCancel() {},
      });
    } else if (e.key === 'close') {
      this.setState({ closeModalVisible: true });
    }
  }
  goHomeDock = () => {
    const { uuid } = this.props;
    this.props.getShipmtOrderNo(uuid).then((result) => {
      this.props.loadOrderDetail(result.data.order_no);
      this.props.hideDock();
    });
  }
  handleExportExcel = () => {
    window.open(`${API_ROOTS.default}v1/cwm/shipping/exportSoExcel/${createFilename('so')}.xlsx?soNo=${this.props.order.so_no}&outboundNo=${this.props.order.outboundNo}`);
  }
  reload = (soNo) => {
    this.props.getSo(soNo).then((result) => {
      if (!result.error) {
        this.setState({
          soHead: result.data.soHead ? result.data.soHead : {},
          soBody: result.data.soBody,
          outbounds: result.data.outbounds,
        });
      }
    });
  }

  renderTabs() {
    const { soHead, soBody } = this.state;
    const { order } = this.props;
    const tabs = [];
    tabs.push(<TabPane tab={this.msg('masterInfo')} key="masterInfo">
      <MasterPane soHead={soHead} onShipmentClick={this.goHomeDock} />
    </TabPane>);
    tabs.push(<TabPane tab={this.msg('tabSODetails')} key="details">
      <DetailsPane soBody={soBody} />
    </TabPane>);
    if (soHead.bonded) {
      tabs.push(<TabPane tab={this.msg('tabFTZ')} key="ftz">
        <FTZPane soNo={order.so_no} />
      </TabPane>);
    }
    if (soHead.status > CWM_SO_STATUS.PENDING.value) {
      tabs.push(<TabPane tab={this.msg('tabPicking')} key="picking">
        <PickingPane outboundNo={order.outboundNo} />
      </TabPane>);
      tabs.push(<TabPane tab={this.msg('tabPacking')} key="packing">
        <PackingPane outboundNo={order.outboundNo} />
      </TabPane>);
      tabs.push(<TabPane tab={this.msg('tabShipping')} key="shipping">
        <ShippingPane outboundNo={order.outboundNo} />
      </TabPane>);
    }
    return (
      <Tabs defaultActiveKey="order" onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }

  renderExtra() {
    const { defaultWhse } = this.props;
    const { soHead } = this.state;
    return (
      <Row>
        <Col span="8">
          <InfoItem label="仓库" field={defaultWhse.name} />
        </Col>
        <Col span="8">
          <InfoItem label="货主" field={soHead.owner_name} />
        </Col>
        <Col span="4">
          <InfoItem label="货物属性" field={soHead.bonded ? '保税' : '非保税'} />
        </Col>
        <Col span="4">
          <InfoItem label="创建时间" addonBefore={<Icon type="calendar" />} field={moment(soHead.created_date).format('YYYY/MM/DD HH:mm')} />
        </Col>
      </Row>);
  }
  renderMenu() {
    const { outbounds } = this.state;
    const showClose = outbounds.some(item =>
      item.status >= CWM_OUTBOUND_STATUS.PARTIAL_PICKED.value
      && item.status < CWM_OUTBOUND_STATUS.COMPLETED.value);
    const showCancel = outbounds.length === 0 || outbounds.some(item =>
      item.status >= CWM_OUTBOUND_STATUS.CREATED.value
      && item.status <= CWM_OUTBOUND_STATUS.ALL_ALLOC.value);
    const menuItems = [];
    if (showClose) {
      menuItems.push(<Menu.Item key="close"><Icon type="close-square" />关闭订单</Menu.Item>);
    }
    if (showCancel) {
      menuItems.push(<Menu.Item key="cancel"><Icon type="delete" />取消订单</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="export"><Icon type="export" /><span onClick={this.handleExportExcel}>导出订单</span></Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
  }
  render() {
    const { visible, order, loading } = this.props;
    const { soHead } = this.state;
    return (
      <DockPanel
        size="large"
        visible={visible}
        onClose={this.props.hideDock}
        label={this.msg('shippingOrder')}
        title={order.so_no}
        loading={loading}
        status={getStatus(soHead.status)}
        statusText={getStatusMsg(soHead.status)}
        overlay={this.renderMenu()}
        extra={this.renderExtra()}
      >
        {this.renderTabs()}
        <Modal
          maskClosable={false}
          visible={this.state.closeModalVisible}
          onCancel={() => this.setState({ closeModalVisible: false })}
          title="请选择"
          footer={[
            <Button key="back" onClick={() => this.closeOutbound('move')}>移库</Button>,
            <Button key="submit" type="primary" onClick={() => this.closeOutbound('return')}>放回</Button>,
          ]}
        >
          <p>对已捡货物如何处理，移库：则会生成移库单，放回：则按原路退回至未分配状态</p>
          <p>对未捡货物则默认原路退回至未分配状态</p>
        </Modal>
      </DockPanel>
    );
  }
}
