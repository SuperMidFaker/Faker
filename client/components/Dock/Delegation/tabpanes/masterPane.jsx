import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Card, Collapse } from 'antd';
import { loadBasicInfo, loadCustPanel, loadDeclCiqPanel, updateCertParam, exchangeBlNo } from 'common/reducers/cmsDelegationDock';
import { loadDeclHead, setInspect } from 'common/reducers/cmsCustomsDeclare';
import { GOODSTYPES, TRANS_MODE } from 'common/constants';
import { loadPaneExp } from 'common/reducers/cmsExpense';
import DescriptionList from 'client/components/DescriptionList';
import { formatMsg } from '../message.i18n';

const { Panel } = Collapse;
const { Description } = DescriptionList;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  previewer: state.cmsDelegationDock.previewer,
  tabKey: state.cmsDelegationDock.tabKey,
  declHeadsPane: state.cmsCustomsDeclare.decl_heads,
}), {
  exchangeBlNo,
  loadDeclHead,
  setInspect,
  loadCustPanel,
  loadBasicInfo,
  updateCertParam,
  loadDeclCiqPanel,
  loadPaneExp,
})
export default class DelegationMasterPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onShipmentClick: PropTypes.func,
  }

  msg = formatMsg(this.props.intl)
  handleTabChange = (tabKey) => {
    const delgNo = this.props.previewer.delegation.delg_no;
    if (tabKey === 'inspect') {
      this.props.loadDeclHead(delgNo);
    }
  }
  handleCancel = () => {
    this.props.form.resetFields();
  }

  render() {
    const { delegation } = this.props.previewer;
    const goods = GOODSTYPES.filter(gt => gt.value === Number(delegation.goods_type))[0];
    const transMode = TRANS_MODE.filter(tm => tm.value === delegation.trans_mode)[0];
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['orderInfo', 'basicInfo']}>
            <Panel header={this.msg('orderInfo')} key="orderInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('shipmentNo')}><a onClick={this.props.onShipmentClick}>{delegation.delg_no}</a></Description>
                <Description term={this.msg('orderRefNo')}>{delegation.order_ref_no}</Description>
              </DescriptionList>
            </Panel>
            <Panel header={this.msg('basicInfo')} key="basicInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('transMode')}>{transMode && transMode.text}</Description>
                <Description term={this.msg('blWbNo')}>{delegation.bl_wb_no}</Description>
                <Description term={this.msg('trafName')}>{delegation.traf_name}</Description>
                <Description term={this.msg('goodsType')}>{goods && goods.text}</Description>
                <Description term={this.msg('pieces')}>{delegation.pieces}</Description>
                <Description term={this.msg('weight')}>{delegation.weight}</Description>
              </DescriptionList>
            </Panel>
            <Panel header={this.msg('sysInfo')} key="sysInfo">
              <DescriptionList col={2}>
                <Description term={this.msg('createdBy')}>{delegation.created_by}</Description>
                <Description term={this.msg('lastUpdatedBy')}>{delegation.last_updated_by}</Description>
                <Description term={this.msg('createdDate')}>{delegation.created_date && moment(delegation.created_date).format('YYYY.MM.DD HH:mm')}</Description>
                <Description term={this.msg('lastUpdatedDate')}>{delegation.last_updated_date && moment(delegation.last_updated_date).format('YYYY.MM.DD HH:mm')}</Description>
              </DescriptionList>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
