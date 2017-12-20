import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Card, Table } from 'antd';
import moment from 'moment';
import { loadciqSups, setDispStatus } from 'common/reducers/cmsDelegation';
import { loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import { format } from 'client/common/i18n/helpers';
import RowAction from 'client/components/RowAction';
import CiqDispModal from '../ciqDispModal';
import messages from '../message.i18n';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    ciqPanel: state.cmsDelgInfoHub.ciqPanel,
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelgInfoHub.tabKey,
    ciqSpinning: state.cmsDelgInfoHub.ciqPanelLoading,
    delegation: state.cmsDelgInfoHub.previewer.delegation,
  }),
  { loadDeclCiqPanel, loadciqSups, setDispStatus }
)
export default class FilesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    ciqPanel: PropTypes.shape({
      ciq_name: PropTypes.string,
      acpt_time: PropTypes.date,
      source: PropTypes.number,
      status: PropTypes.number,
      recv_tenant_id: PropTypes.number,
      ciqlist: PropTypes.arrayOf(PropTypes.shape({
        pre_entry_seq_no: PropTypes.string,
      })),
    }),
  }
  componentDidMount() {
    this.props.loadDeclCiqPanel(this.props.delegation.delg_no, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'ciqDecl' && nextProps.delegation.delg_no !== this.props.delegation.delg_no) {
      this.props.loadDeclCiqPanel(nextProps.delegation.delg_no, this.props.tenantId);
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleCiqAssign = () => {
    this.props.loadciqSups(this.props.tenantId, 'CIB');
    this.props.setDispStatus({ ciqDispShow: true });
  }
  render() {
    const {
      ciqPanel, ciqSpinning,
    } = this.props;
    const columns = [{
      title: '文件名称',
      dataIndex: 'file_name',
    }, {
      title: '类别',
      dataIndex: 'file_doc_code',
      width: 150,
    }, {
      title: '编号',
      dataIndex: 'file_doc_no',
      width: 200,
    }, {
      title: '上传人',
      dataIndex: 'uploaded_by',
      width: 100,
    }, {
      title: '上传时间',
      dataIndex: 'uploaded_date',
      width: 150,
      render: date => (date ? moment(date).format('YYYY.MM.DD HH:mm') : '-'),
    }, {
      dataIndex: 'OPS_COL',
      width: 100,
      render: (_, row) => (<span>
        <RowAction shape="circle" onClick={this.handlePreview} icon="eye-o" tooltip={this.msg('preview')} row={row} />
        <RowAction shape="circle" onClick={this.handleDownload} icon="download" tooltip={this.msg('download')} row={row} />
      </span>),
    }];
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={ciqSpinning}>
          <Card bodyStyle={{ padding: 0 }} hoverable={false}>
            <Table size="middle" columns={columns} pagination={false} dataSource={ciqPanel.ciqlist} />
          </Card>
        </Spin>
        <CiqDispModal />
      </div>
    );
  }
}
