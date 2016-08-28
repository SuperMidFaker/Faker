import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Modal, Icon } from 'antd';
import moment from 'moment';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { loadExceptions, hideExcpModal, removeException } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import '../../../index.less';
import CreateException from './create-exception';
import CreateSpecialCharge from './create-specialCharge';
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
  { loadExceptions, hideExcpModal, removeException }
)
export default class ExcpEventsModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    removeException: PropTypes.func.isRequired,
    hideExcpModal: PropTypes.func.isRequired,
    exceptions: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    createExceptionVisible: false,
    createSpecialCharge: false,
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
    title: this.msg('exceptionLevel'),
    dataIndex: 'excp_level',
    width: '8%',
    render: (o) => {
      if (o === 'INFO') {
        return (<span className="alert-tag ant-alert-info"><Icon type="info-circle" /> 提醒</span>);
      } else if (o === 'WARN') {
        return (<span className="alert-tag ant-alert-warning"><Icon type="exclamation-circle" /> 警报</span>);
      } else if (o === 'ERROR') {
        return (<span className="alert-tag ant-alert-error"><Icon type="cross-circle" /> 错误</span>);
      }
      return o;
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
    title: this.msg('exceptionType'),
    dataIndex: 'type',
    render: (o, record) => {
      const t = TRANSPORT_EXCEPTIONS.find(item => item.code === o);
      return `${t ? t.name : ''}: ${record.excp_event}`;
    },
  }, {
    title: this.msg('submitter'),
    dataIndex: 'submitter',
    width: '5%',
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
  toggleSpecialCharge = () => {
    this.setState({ createSpecialCharge: !this.state.createSpecialCharge });
  }
  render() {
    const { shipmtNo, dispId, exceptions } = this.props;
    this.dataSource.remotes = exceptions;
    const buttonStyle = { marginLeft: 20 };
    const title = (
      <div>
        <span>{`${this.msg('trackingEventsModalTitle')} ${shipmtNo}`}</span>
        <div style={{ float: 'right', marginRight: 50 }}>
          <Button type="primary" style={buttonStyle} onClick={this.toggleCreateException}>添加异常</Button>
          <Button type="primary" style={buttonStyle} onClick={this.toggleSpecialCharge}>添加特殊费用</Button>
        </div>
      </div>
    );
    const footer = (
      <div className="exceptionFooter">
        <Alert message="警报" type="warning" showIcon />
        <Alert message="错误" type="error" showIcon />
        <Alert message="提醒" type="info" showIcon />
      </div>
    );
    return (
      <Modal title={title} footer={footer} onCancel={this.handleCancel}
        visible={this.props.visible} width="80%" maskClosable={false}
      >
        <div className="panel-body table-panel">
          <Table columns={this.columns}
            dataSource={this.dataSource} rowKey="id" bordered
          />
        </div>
        <CreateException visible={this.state.createExceptionVisible} dispId={dispId} toggle={this.toggleCreateException} />
        <CreateSpecialCharge visible={this.state.createSpecialCharge} dispId={dispId} toggle={this.toggleSpecialCharge} />
      </Modal>
    );
  }
}
