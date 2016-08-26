import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Modal } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { loadExceptions, hideExcpModal, addException, removeException } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import '../../../index.less';
import CreateException from './create-exception';
import { TRANSPORT_EXCEPTIONS } from '../../../eventTypes';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.trackingLandException.excpModal.visible,
    dispId: state.trackingLandException.excpModal.dispId,
    shipmtNo: state.trackingLandException.excpModal.shipmtNo,
    exceptions: state.trackingLandException.exceptions,
  }),
  { loadExceptions, hideExcpModal, addException, removeException }
)
export default class ExcpEventsModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    addException: PropTypes.func.isRequired,
    removeException: PropTypes.func.isRequired,
    hideExcpModal: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    createExceptionVisible: false,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.dispId !== nextProps.dispId && nextProps.dispId !== -1) {
      this.props.loadExceptions({
        dispId: nextProps.dispId,
        pageSize: nextProps.exceptions.pageSize,
        currentPage: nextProps.exceptions.current,
      });
    }
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadExceptions(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        dispId: this.props.dispId,
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
    width: '40',
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
    render: (o, record) => {
      const t = TRANSPORT_EXCEPTIONS.find(item => item.code === o);
      return `${t ? t.name : ''}: ${record.excp_event}`;
    },
  }, {
    title: this.msg('exceptionResolved'),
    dataIndex: 'resolved',
    width: '8%',
    render: (o) => {
      if (o === 1) {
        return '已解决';
      } else if (o === 0) {
        return '未解决';
      }
      return o;
    },
  }, {
    title: this.msg('submitter'),
    dataIndex: 'submitter',
    width: '10%',
  }, {
    title: this.msg('submitDate'),
    dataIndex: 'submit_date',
    width: '15%',
    render: (o) => {
      return moment(o).format('YYYY-MM-DD HH:mm:ss');
    },
  }, {
    title: this.msg('operation'),
    dataIndex: 'id',
    width: '6%',
    render: (o) => {
      return (<a>处理{o}</a>);
    },
  }]
  handleCancel = () => {
    this.props.hideExcpModal();
  }
  toggleCreateException = () => {
    this.setState({ createExceptionVisible: !this.state.createExceptionVisible });
  }
  render() {
    const { shipmtNo, dispId, exceptions } = this.props;
    this.dataSource.remotes = exceptions;
    const buttonStyle = { marginLeft: 8 };
    const title = (
        <span>{`${this.msg('trackingEventsModalTitle')} ${shipmtNo}`}</span>
    );
    const footer = (
        <Button type="ghost" size="large" onClick={this.handleCancel}>取消</Button>
    );
    return (
      <Modal title={title} footer={footer} onCancel={this.handleCancel}
        visible={this.props.visible} width="75%" maskClosable={false}
      >
        <div className="modal-top-actions">
          <Button type="ghost" size="large">添加特殊费用</Button>
          <Button type="primary" size="large" style={buttonStyle} onClick={this.toggleCreateException}>添加异常</Button>
        </div>
        <Table columns={this.columns}
          dataSource={this.dataSource} rowKey="id" size="middle" pagination={false}
        />
        <CreateException visible={this.state.createExceptionVisible} dispId={dispId} toggle={this.toggleCreateException} />
      </Modal>
    );
  }
}
