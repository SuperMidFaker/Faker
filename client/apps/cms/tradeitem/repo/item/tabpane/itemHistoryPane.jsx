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
export default class ItemHistoryPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('HS编码'),
    width: 150,
    dataIndex: 'hscode',
  }, {
    title: this.msg('品名'),
    width: 200,
    dataIndex: 'gname',
  }, {
    title: this.msg('规范申报要素'),
    width: 300,
    dataIndex: 'gmodel',
  }, {
    title: this.msg('变更原因'),
    width: 200,
    dataIndex: 'reason',
  }, {
    title: this.msg('变更时间'),
    width: 150,
    dataIndex: 'revised_date',
  }, {
    title: this.msg('归类人员'),
    width: 150,
    dataIndex: 'classified_by',
  }, {
    title: this.msg('审核人员'),
    width: 150,
    dataIndex: 'reviewed_by',
  }]
  render() {
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={this.columns}
        rowKey="id"
      />
    );
  }
}
