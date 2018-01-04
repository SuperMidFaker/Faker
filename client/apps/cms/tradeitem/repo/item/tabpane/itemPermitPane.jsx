import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import { Logixon } from 'client/components/FontIcon';
import { loadCertParams, loadPermitsByTradeItem } from 'common/reducers/cmsPermit';
import { CIQ_LICENCE_TYPE } from 'common/constants';
import messages from '../../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    certParams: state.cmsPermit.certParams,
  }),
  {
    loadPermitsByTradeItem, loadCertParams,
  }
)
export default class ItemPermitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    itemId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    permits: [],
    loading: true,
  }
  componentDidMount() {
    this.props.loadCertParams();
    this.props.loadPermitsByTradeItem(this.props.itemId).then((result) => {
      if (!result.error) {
        this.setState({
          permits: result.data,
          loading: false,
        });
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    key: 'sno',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (o, record, index) => index + 1,
  }, {
    title: '进出口标识',
    dataIndex: 'ie_type',
    width: 100,
    align: 'center',
  }, {
    title: this.msg('涉证标准'),
    width: 100,
    dataIndex: 'permit_category',
    align: 'center',
    render: o => <Logixon type={o} />,
  }, {
    title: this.msg('证书类型'),
    width: 250,
    dataIndex: 'permit_code',
    render: (o, record) => (record.permit_category === 'customs' ?
      this.props.certParams.find(cert => cert.cert_code === o) &&
    this.props.certParams.find(cert => cert.cert_code === o).cert_spec :
      CIQ_LICENCE_TYPE.find(type => type.value === o) &&
    CIQ_LICENCE_TYPE.find(type => type.value === o).text),
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
    const { permits, loading } = this.state;
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={this.columns}
        rowKey="id"
        dataSource={permits}
        loading={loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.handleEntrybodyExport}>添加</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
