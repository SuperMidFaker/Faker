import React from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import { connect } from 'react-redux';
// import { Card, DatePicker, Form, Input, Select, Switch, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  {
  }
)
export default class ItemDocuPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
    className: 'cell-align-center',
  }, {
    title: '货品',
    dataIndex: 'product_sku',
    width: 220,
  }]
  render() {
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowKey="id"
      />
    );
  }
}
