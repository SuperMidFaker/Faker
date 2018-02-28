import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon } from 'antd';
import DataPane from 'client/components/DataPane';

import { Logixon } from 'client/components/FontIcon';
import { loadCertParams, loadPermitsByTradeItem } from 'common/reducers/cmsPermit';
import { CIQ_LICENCE_TYPE } from 'common/constants';
import { formatMsg } from '../../../message.i18n';


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
  msg = formatMsg(this.props.intl)
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
    width: 120,
    render: (o, record) => (record.start_date ? moment(record.start_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('到期日期'),
    dataIndex: 'stop_date',
    width: 120,
    render: (o, record) => (record.stop_date ? moment(record.stop_date).format('YYYY.MM.DD') : '-'),
  }, {
    title: this.msg('总使用次数'),
    width: 120,
    align: 'right',
    dataIndex: 'max_usage',
  }, {
    title: this.msg('剩余使用次数'),
    width: 120,
    align: 'right',
    dataIndex: 'ava_usage',
  }, {
    title: this.msg('permitFile'),
    dataIndex: 'permit_file',
    align: 'center',
    render: (o) => {
      if (o && o !== '') {
        return <a href={o} target="_blank"><Icon type="file-pdf" /></a>;
      }
      return <span />;
    },
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
      />
    );
  }
}
