import React from 'react';
import { connect } from 'react-redux';
import { Radio } from 'ant-ui';
import BaseList from '../components/BaseList';
import { inviteOnlPartner, setProviderType } from 'common/reducers/partner';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId,
  providerKey: state.partner.providerKey
}), { inviteOnlPartner, setProviderType })
export default class CustomerListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'ALL';
    this.partnerships = ['TRS'];
  }
  updateColumns(columns) {
    const retColumns = [...columns];
    const providerSeviceColumn = {
      title: '物流服务',
      dataIndex: 'provider_mode',
      key: 'provider_mode'
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
    if (type === 'ALL') {
      return partnerlist.filter(partner => partner.types.some(pType => ['TRS', 'CCB', 'WHS', 'FWD'].includes(pType.code)));
    } else {
      return partnerlist.filter(partner => partner.types.some(pType => pType.code === type));
    }
  }
  setHeader() {
    const { providerType = 'ALL' } = this.props;
    return (
      <RadioGroup onChange={this.handleRadioChange} size="large" defaultValue={providerType}>
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
}
