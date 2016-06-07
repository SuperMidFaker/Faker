import React from 'react';
import { connect } from 'react-redux';
import { Radio, Icon, message } from 'ant-ui';
import BaseList from '../components/BaseList';
import { setProviderType, editProviderTypes, editProviderTypesLocal, addPartner, changePartnerStatus } from 'common/reducers/partner';
import { providerShorthandTypes } from '../util/dataMapping';
import partnerModal from '../components/partnerModal';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@connect(state => ({
  partnerlist: state.partner.partnerlist.data,
  partnerTenants: state.partner.recevieablePartnerTenants,
  tenantId: state.account.tenantId,
  providerType: state.partner.providerType
}), { setProviderType, editProviderTypes, editProviderTypesLocal, addPartner, changePartnerStatus })
export default class ProviderListContainer extends BaseList {
  constructor() {
    super();
    this.type = 'ALL';
    this.partnerships = ['TRS'];
  }
  onAddBtnClick() {
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
      dataSource = partnerlist.filter(partner => partner.types.some(pType => ['TRS', 'CCB', 'WHS', 'FWD'].includes(pType.code)));
    } else {
      dataSource = partnerlist.filter(partner => partner.types.some(pType => pType.code === type));
    }
    dataSource = dataSource.map(data => ({...data, providerTypes: data.types.filter(pType => ['TRS', 'CCB', 'WHS', 'FWD'].includes(pType.code)).map(pType => providerShorthandTypes[pType.code])}));
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
  handleEditProvider = (record) => {
    const { tenantId } = this.props;
    const partnerInfo = { partnerName: record.name, partnerCode: record.partnerCode, partnerTenantId: record.partnerTenantId };
    const providerValues = record.types.map(pType => pType.code);
    partnerModal({
      mode: 'editProvider',
      providerValues,
      onOk: (providerTypes) => {
        this.props.editProviderTypes({partnerKey: record.key, tenantId, partnerInfo, providerTypes});
        this.props.editProviderTypesLocal({key: record.key, providerTypes});
        message.success('物流服务修改成功');
      }
    });
  }
}
