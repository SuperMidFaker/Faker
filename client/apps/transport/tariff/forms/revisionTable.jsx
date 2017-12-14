import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { routerShape } from 'react-router';
import { Table } from 'antd';
import { restoreTariff } from 'common/reducers/transportTariff';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    revisions: state.transportTariff.agreement.revisions,
    loginName: state.account.username,
    agreement: state.transportTariff.agreement,
  }),
  { restoreTariff }
)
export default class RevisionTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    loginName: PropTypes.string.isRequired,
    revisions: PropTypes.array.isRequired,
    restoreTariff: PropTypes.func.isRequired,
    agreement: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: '版本',
    width: 100,
    dataIndex: 'version',
    render: (o, row) => row.status === 'current' ? `v${o}(当前版本)` : `v${o}`,
  }, {
    title: '修订说明',
    width: 140,
    dataIndex: 'publishCommit',
  }, {
    title: '发布时间',
    width: 100,
    dataIndex: 'publishDate',
    render: o => o && moment(o).format('YYYY-MM-DD HH:mm'),
  }, {
    title: '生效时间',
    dataIndex: 'effectiveDate',
    width: 100,
    render: o => o && moment(o).format('YYYY-MM-DD HH:mm'),
  }, {
    title: '范围方式',
    width: 80,
    dataIndex: 'effectiveType',
    render: o => this.msg(o),
  }, {
    title: '发布人',
    width: 80,
    dataIndex: 'publisher',
  }]
  handleRestore = (row) => {
    this.props.restoreTariff({
      draftId: this.props.agreement.id,
      archivedId: row._id,
      loginName: this.props.loginName,
      publishCommit: `恢复自v${row.version}版本`,
    }).then((result) => {
      if (!result.error) {
        this.context.router.push('/transport/billing/tariff?kind=all&status=current');
      }
    });
  }
  render() {
    const { revisions, type } = this.props;
    const columns = [...this.columns];
    if (type === 'edit') {
      columns.push({
        title: '操作',
        width: 80,
        render: (o, row) => {
          if (row.status !== 'current') {
            return <a onClick={() => this.handleRestore(row)}>恢复此版本</a>;
          }
        },
      });
    }
    return (
      <div className="panel-body table-panel table-fixed-layout">
        <Table columns={columns} dataSource={revisions} pagination={false} rowKey="version" />
      </div>
    );
  }
}
