import React from 'react';
import { connect } from 'react-redux';
import { Radio, Icon } from 'ant-ui';
import BaseList from '../components/BaseList';
import { inviteOnlPartner, setProviderType } from 'common/reducers/partner';
import { providerShorthandTypes } from '../util/dataMapping';
import partnerModal from '../components/partnerModal';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId,
  providerKey: state.partner.providerKey
}), { inviteOnlPartner, setProviderType })
export default class ProviderListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'ALL';
    this.partnerships = ['TRS'];
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
            {record.providerTypes.join(',')}<a onClick={() => this.handleEditProvider(record.types.map(pType => pType.code))}><Icon type="edit"/></a>
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
      dataSource = partnerlist.filter(partner => partner.types.some(pType => ['TRS', 'CCB', 'WHS', 'FWD'].includes(pType.code)));
    } else {
      dataSource = partnerlist.filter(partner => partner.types.some(pType => pType.code === type));
    }
    dataSource = dataSource.map(data => ({...data, providerTypes: data.types.map(pType => providerShorthandTypes[pType.code])}));
    return dataSource;
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
  handleEditProvider = (providerTypes) => {
    partnerModal({
      mode: 'editProvider',
      providerValues: providerTypes,
      onOk(checkedValues) {
        console.log(checkedValues);
      }
    });
  }
}
