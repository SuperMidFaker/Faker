import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button } from 'antd';
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
export default class ItemPermitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '进出口标识',
    dataIndex: 'ie_type',
    width: 100,
    align: 'center',
  }, {
    title: this.msg('涉证标准'),
    width: 150,
    dataIndex: 'permit_category',
  }, {
    title: this.msg('证书类型'),
    width: 180,
    dataIndex: 'permit_type',
  }, {
    title: this.msg('证书编号'),
    dataIndex: 'permit_no',
    width: 200,
  }, {
    title: this.msg('发证日期'),
    dataIndex: 'start_date',
    render: (o, record) => (record.start_date ? moment(record.start_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('到期日期'),
    dataIndex: 'stop_date',
    render: (o, record) => (record.stop_date ? moment(record.stop_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('总使用次数'),
    width: 120,
    dataIndex: 'max_usage',
  }, {
    title: this.msg('剩余使用次数'),
    width: 120,
    dataIndex: 'avail_usage',
  }]
  render() {
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={this.columns}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleEntrybodyExport}>添加</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
