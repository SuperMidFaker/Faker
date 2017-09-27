import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Alert } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import { loadExceptions, showDealExcpModal } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import messages from '../..//message.i18n';
import ResolveExceptionModal from '../../../tracking/land/modals/resolveExceptionModal';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    dispId: state.shipment.previewer.dispatch.id,
    exceptions: state.trackingLandException.exceptions,
    previewer: state.shipment.previewer,
  }),
  { loadExceptions, showDealExcpModal }
)
export default class ExceptionPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipmtNo: PropTypes.string,
    dispId: PropTypes.number,
    exceptions: PropTypes.object.isRequired,
    showDealExcpModal: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
  }
  componentDidMount() {
    if (this.props.shipmtNo) {
      this.props.loadExceptions({
        shipmtNo: this.props.shipmtNo,
        pageSize: this.props.exceptions.pageSize,
        currentPage: this.props.exceptions.current,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.shipmtNo !== nextProps.shipmtNo && nextProps.shipmtNo !== '' || nextProps.previewer.visible && !nextProps.previewer.loaded) {
      this.props.loadExceptions({
        shipmtNo: nextProps.shipmtNo,
        pageSize: nextProps.exceptions.pageSize,
        currentPage: nextProps.exceptions.current,
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadExceptions(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        shipmtNo: this.props.shipmtNo,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
      };
      return params;
    },
    remotes: this.props.exceptions,
  })
  columns = [{
    dataIndex: 'excp_level',
    render: (o, record) => {
      const excpType = TRANSPORT_EXCEPTIONS.find(item => item.code === record.type);
      const excpMsg = (<div>{excpType ? excpType.name : ''}
        <span className="pull-right"><Button type="primary" size="small" ghost onClick={() => this.handleShowDealExcpModal(record)}>处理</Button></span>
      </div>);
      const excpDesc = (<div>
        {record.excp_event}
        <span className="pull-right text-normal">{moment(record.submit_date).format('YYYY.MM.DD HH:mm')}</span>
      </div>);
      if (o === 'INFO') {
        return (<Alert showIcon type="info" message={excpMsg} description={excpDesc} />);
      } else if (o === 'WARN') {
        return (<Alert showIcon type="warning" message={excpMsg} description={excpDesc} />);
      } else if (o === 'ERROR') {
        return (<Alert showIcon type="error" message={excpMsg} description={excpDesc} />);
      }
      return o;
    },
  }]
  /*
  columns = [{
    dataIndex: 'excp_level',
    width: 30,
    render: (o) => {
      if (o === 'INFO') {
        return (<Icon type="info-circle" className="sign-info" />);
      } else if (o === 'WARN') {
        return (<Icon type="exclamation-circle" className="sign-warning" />);
      } else if (o === 'ERROR') {
        return (<Icon type="cross-circle" className="sign-error" />);
      }
      return o;
    },
  }, {
    title: this.msg('exceptionType'),
    dataIndex: 'type',
    width: 80,
    render: (o) => {
      const t = TRANSPORT_EXCEPTIONS.find(item => item.code === o);
      return t ? t.name : '';
    },
  }, {
    title: this.msg('exceptionDescription'),
    dataIndex: 'excp_event',
  }, {
    title: this.msg('exceptionResolved'),
    dataIndex: 'resolved',
    width: 80,
    render: (o) => {
      if (o === 1) {
        return (<Tag color="green">已解决</Tag>);
      } else if (o === 0) {
        return <Tag>未解决</Tag>;
      }
      return o;
    },
  }, {
    title: this.msg('submitDate'),
    dataIndex: 'submit_date',
    width: 120,
    render: o => moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: this.msg('submitter'),
    dataIndex: 'submitter',
    width: 60,
  }, {
    title: this.msg('operation'),
    dataIndex: 'OPS_COL',
    width: 50,
    render: (o, record) => (<a onClick={() => this.handleShowDealExcpModal(record)}>处理</a>),
  }]
  */
  handleShowDealExcpModal = (exception) => {
    const { shipmtNo } = this.props;
    this.props.showDealExcpModal({ visible: true, shipmtNo, exception });
  }
  render() {
    const { exceptions } = this.props;
    this.dataSource.remotes = exceptions;

    return (
      <div className="pane-content tab-pane table-list">
        <Card bodyStyle={{ padding: 16 }} noHovering>
          <Table size="middle" showHeader={false} columns={this.columns} dataSource={this.dataSource} rowKey="id" pagination={false} />
          <ResolveExceptionModal />
        </Card>
      </div>
    );
  }
}
