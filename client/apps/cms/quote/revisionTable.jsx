import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape } from 'react-router';
import { Table } from 'antd';
import moment from 'moment';
import { loadQuoteRevisions, restoreQuote } from 'common/reducers/cmsQuote';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  quoteNo: state.cmsQuote.quoteData.quote_no,
  revisions: state.cmsQuote.quoteRevisions,
}),
  { loadQuoteRevisions, restoreQuote })
export default class RevisionTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    revisions: PropTypes.arrayOf(PropTypes.shape({
      version: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['current', 'archived']),
    })),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  componentDidMount() {
    this.props.loadQuoteRevisions(this.props.quoteNo);
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('publishVersion'),
    width: 100,
    dataIndex: 'version',
    render: (o, row) => row.status === 'current' ? `v${o}(${this.msg('version')})` : `v${o}`,
  }, {
    title: this.msg('publishRemark'),
    width: 140,
    dataIndex: 'publish_commit',
  }, {
    title: this.msg('publishDate'),
    width: 100,
    dataIndex: 'publish_date',
    render: o => o && moment(o).format('YYYY-MM-DD HH:mm'),
  }, {
    title: this.msg('basementDate'),
    dataIndex: 'basement_timestamp',
    width: 100,
    render: o => o && moment(o).format('YYYY-MM-DD HH:mm'),
  }, {
    title: this.msg('basementDateType'),
    width: 80,
    dataIndex: 'basement_datetype',
    render: (o) => {
      if (o === 'accept') {
        return '接单时间';
      } else if (o === 'clean') {
        return '海关放行时间';
      }
    },
  }, {
    title: this.msg('publisher'),
    width: 80,
    dataIndex: 'modify_name',
  }, {
    title: '操作',
    width: 80,
    render: (o, row) => {
      if (row.status !== 'current') {
        return <a onClick={() => this.handleRestore(row)}>恢复此版本</a>;
      }
    },
  }]
  handleRestore = (row) => {
    this.props.restoreQuote(row._id, row.quote_no, `恢复自v${row.version}版本`).then((result) => {
      if (!result.error) {
        this.context.router.push('/clearance/billing/quote');
      }
    });
  }
  render() {
    const { revisions } = this.props;
    return (
      <Table columns={this.columns} dataSource={revisions} pagination={false} rowKey="version" />
    );
  }
}
