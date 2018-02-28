import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Table, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadTransportTariffs, loadCmsQuotes } from 'common/reducers/sofCustomers';
import { TARIFF_METER_METHODS, GOODS_TYPES, DECL_I_TYPE, DECL_E_TYPE, TRANS_MODE } from 'common/constants';
import { loadFormRequires } from 'common/reducers/sofOrders';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
function fetchData({ state, dispatch }) {
  return dispatch(loadFormRequires({ tenantId: state.account.tenantId }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  transitModes: state.sofOrders.formRequires.transitModes,
}), { loadTransportTariffs, loadCmsQuotes })

export default class TariffPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    vendor: PropTypes.object.isRequired,
    transitModes: PropTypes.array.isRequired,
    loadTransportTariffs: PropTypes.func.isRequired,
    loadCmsQuotes: PropTypes.func.isRequired,
  }
  state = {
    data: [],
    filters: { module: ['运输', '清关'] },
  }
  componentDidMount() {
    this.props.loadTransportTariffs(this.props.tenantId).then((result) => {
      const d = result.data.map(item => ({
        quoteNo: item.quoteNo,
        module: '运输',
        recvTenantId: item.recvTenantId,
        sendTenantId: item.sendTenantId,
        recvPartnerId: item.recvPartnerId,
        sendPartnerId: item.sendPartnerId,
        valid: item.valid,
        transModeCode: item.transModeCode,
        condition: this.renderTmsTariffCondition(item),
      }));
      this.setState({ data: [...this.state.data, ...d] });
    });
    this.props.loadCmsQuotes(this.props.tenantId).then((result) => {
      const d = result.data.map(item => ({
        quoteNo: item.quote_no,
        module: '清关',
        recvTenantId: item.recv_tenant_id,
        sendTenantId: item.send_tenant_id,
        recvPartnerId: item.recv_partner_id,
        sendPartnerId: item.send_partner_id,
        valid: item.valid,
        condition: this.renderCmsTariffCondition(item),
      }));
      this.setState({ data: [...this.state.data, ...d] });
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  renderTmsTariffCondition = (row) => {
    let text = '';
    const tms = this.props.transitModes.find(tm => tm.id === Number(row.transModeCode));
    const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
    const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
    if (tms) text = tms.mode_name;
    if (meter) text = `${text}/${meter.text}`;
    if (goodType) text = `${text}/${goodType.text}`;
    return text;
  }
  renderCmsTariffCondition = (row) => {
    const declTags = [];
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    if (row.decl_way_code) {
      row.decl_way_code.forEach((d) => {
        const decl = DECL_TYPE.filter(dl => dl.key === d)[0];
        if (decl) declTags.push(decl.value);
      });
    }
    const transTags = [];
    if (row.trans_mode) {
      row.trans_mode.forEach((d) => {
        const trans = TRANS_MODE.filter(dl => dl.value === d)[0];
        if (trans) transTags.push(trans.text);
      });
    }
    return <div><div>{declTags.join(' ')}</div><div>{transTags.join(' ')}</div></div>;
  }
  render() {
    const { data, filters } = this.state;
    const columns = [{
      title: '报价编号',
      dataIndex: 'quoteNo',
      key: 'quoteNo',
    }, {
      title: '报价类型',
      dataIndex: 'module',
      key: 'module',
      filters: [{ text: '运输', value: '运输' }, { text: '清关', value: '清关' }],
      filteredValue: filters.module,
    }, {
      title: '报价条件',
      dataIndex: 'condition',
      key: 'condition',
    }, {
      title: '状态',
      dataIndex: 'valid',
      key: 'valid',
      render: (col) => {
        if (col === 0) return <Tag >无效</Tag>;
        return <Tag color="#87d068">有效</Tag>;
      },
    }];
    const pId = this.props.vendor.id;
    const toData = data.filter(item => pId !== -1 && (item.recvPartnerId === pId || item.sendPartnerId === pId)
     && filters.module.indexOf(String(item.module)) >= 0);
    return (
      <Table size="middle" columns={columns} dataSource={toData} onChange={(pagination, flts) => this.setState({ filters: flts })} rowKey="id" />
    );
  }
}
