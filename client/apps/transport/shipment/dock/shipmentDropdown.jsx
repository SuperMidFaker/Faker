import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Menu, Dropdown } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import ExportPDF from '../../tracking/land/modals/export-pdf';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar || '',
    loginName: state.account.username,
    previewer: state.shipment.previewer,
  }),
  { hidePreviewer }
)
export default class ShipmentActions extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    avatar: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    previewer: PropTypes.object.isRequired,
    onShowShareShipmentModal: PropTypes.func.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    sourceType: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    exportPDFvisible: false,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleMenuClick = (e) => {
    if (e.key === 'exportShipment') {
      this.setState({ exportPDFvisible: true });
      setTimeout(() => {
        this.setState({ exportPDFvisible: false });
      }, 200);
    } else if (e.key === 'shareShipment') {
      this.props.onShowShareShipmentModal();
    }
  }
  handleShowExportShipment = () => {
  }
  handleDownloadPod = () => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const domain = window.location.host;
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentPodPDF/${createFilename('pod')}.pdf?shipmtNo=${shipmt.shipmt_no}&podId=${dispatch.pod_id}&publickKey=${shipmt.public_key}&domain=${domain}`);
  }
  render() {
    const { sourceType, previewer: { shipmt, dispatch } } = this.props;
    let menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
        <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
      </Menu>
    );
    if (sourceType === 'sp') {
      menu = (
        <Menu onClick={this.handleMenuClick}>
          <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
          <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
        </Menu>
      );
    } else if (sourceType === 'sr') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (dispatch.sp_tenant_id === -1) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
            </Menu>
          );
        } else if (dispatch.sp_tenant_id === 0) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
            </Menu>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.delivered) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="shareShipment">共享运单</MenuItem>
          </Menu>
        );
      }
    }
    return (
      <PrivilegeCover module="transport" feature="shipment" action="create">
        <Dropdown overlay={menu}>
          <Button><Icon type="setting" /> <Icon type="down" /></Button>
        </Dropdown>
        <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={shipmt.shipmt_no} publickKey={shipmt.public_key} />
      </PrivilegeCover>
    );
  }
}
