import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function getTitle(quoteData, tenantId) {
  const title = {};
  if (quoteData) {
    title.quoteno = quoteData.quote_no;
    if (!quoteData.send_tenant_id) {
      title.tariff_kind = '销售基准价';
    } else if (!quoteData.recv_tenant_id) {
      title.tariff_kind = '成本基准价';
    } else if (quoteData.send_tenant_id === tenantId) {
      title.tariff_kind = '成本价';
      title.partner = quoteData.recv_tenant_name;
    } else if (quoteData.recv_tenant_id === tenantId) {
      title.tariff_kind = '销售价';
      title.partner = quoteData.send_tenant_name;
    }
  }
  return title;
}

@connect(state => ({
  title: getTitle(state.cmsQuote.quoteData, state.account.tenantId),
}), )
export default class QuoteFormHeader extends Component {
  static propTypes = {
    title: PropTypes.shape({
      quoteno: PropTypes.string.isRequired,
      tariff_kind: PropTypes.string.isRequired,
    }).isRequired,
  }
  render() {
    const { title } = this.props;
    let titleText = '';
    if (title.partner) {
      titleText = `${title.quoteno}-${title.partner}-${title.tariff_kind}`;
    } else {
      titleText = `${title.quoteno}-${title.tariff_kind}`;
    }
    return (
      <span>{titleText}</span>
    );
  }
}
