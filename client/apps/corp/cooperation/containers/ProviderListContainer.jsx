import React from 'react';
import { connect } from 'react-redux';
import { Radio, Icon, message } from 'ant-ui';
import BaseList from '../components/BaseList';
import { setProviderType, editProviderTypes, addPartner, editPartner, changePartnerStatus, deletePartner, invitePartner } from 'common/reducers/partner';
import { inviteOfflinePartner } from 'common/reducers/invitation';
import { providerShorthandTypes } from '../util/dataMapping';
import partnerModal from '../components/partnerModal';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  partnerlist: state.partner.partnerlist,
  tenantId: state.account.tenantId,
  providerType: state.partner.providerType
}), {
  setProviderType, editProviderTypes,
  addPartner, editPartner, changePartnerStatus, deletePartner,
  inviteOfflinePartner, invitePartner
})
export default class ProviderListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'ALL';
    this.partnerships = ['TRS'];
  }
  handleAddBtnClick() {
    const { tenantId, providerType } = this.props;
    partnerModal({
      isProvider: true,
      partnerships: this.type === 'ALL' ? [] : [providerType],
      onOk: (partnerInfo) => {
        this.props.addPartner({tenantId, partnerInfo, partnerships: partnerInfo.partnerships});
        message.success('合作伙伴已添加');
      }
    });
  }
  updateColumns(columns) {
    const retColumns = [...columns];
    const providerSeviceColumn = {
      title: '物流服务',
      dataIndex: 'providerTypes',
      key: 'providerTypes',
      render: (_, record) => {
        return (
          <span>
            {record.providerTypes.join(',')}<a onClick={() => this.handleEditProvider(record)}><Icon type="edit"/></a>
          </span>
        );
      }
    };
    retColumns[0].title = '提供商名称';
    retColumns[1].title = '提供商代码';
    return [
      ...retColumns.slice(0, 2),
      providerSeviceColumn,
      ...retColumns.slice(2)
    ];
  }
  dataSourceFromPartnerlist(partnerlist) {
    const { type } = this;
    let dataSource = [];
    if (type === 'ALL') {
      dataSource = partnerlist.filter(partner => partner.partnerships.some(ps => ['TRS', 'CCB', 'WHS', 'FWD'].includes(ps)));
    } else {
      dataSource = partnerlist.filter(partner => partner.partnerships.some(ps => ps === type));
    }
    dataSource = dataSource.map(data => ({...data, providerTypes: data.partnerships.filter(ps => ['TRS', 'CCB', 'WHS', 'FWD'].includes(ps)).map(ps => providerShorthandTypes[ps])}));
    return dataSource;
  }
  setHeader() {
    const { providerType = 'ALL' } = this.props;
    return (
      <RadioGroup onChange={this.handleRadioChange} defaultValue={providerType} size="large">
        <RadioButton value="ALL">所有</RadioButton>
        <RadioButton value="FWD">货代</RadioButton>
        <RadioButton value="CCB">报关</RadioButton>
        <RadioButton value="TRS">运输</RadioButton>
        <RadioButton value="WHS">仓储</RadioButton>
      </RadioGroup>
    );
  }
  handleRadioChange = (e) => {
    const providerType = e.target.value;
    this.props.setProviderType(providerType);
    this.type = providerType;
    this.setState({});  // TODO: avoid use setState() method
  }
  handleEditProvider = (record) => {
    const { tenantId } = this.props;
    const providerValues = record.partnerships;
    partnerModal({
      mode: 'editProvider',
      providerValues,
      onOk: (partnerships) => {
        this.props.editProviderTypes({id: record.id, tenantId, partnerships});
        message.success('物流服务修改成功');
      }
    });
  }
}
