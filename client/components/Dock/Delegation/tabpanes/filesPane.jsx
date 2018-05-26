import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Spin, Card, Table } from 'antd';
import moment from 'moment';
import { loadCmsFiles } from 'common/reducers/cmsManifest';

import RowAction from 'client/components/RowAction';
import { CMS_DOC_TYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tabKey: state.cmsDelegationDock.tabKey,
    ciqSpinning: state.cmsDelegationDock.ciqPanelLoading,
    delegation: state.cmsDelegationDock.previewer.delegation,
    userMembers: state.account.userMembers,
  }),
  { loadCmsFiles }
)
export default class FilesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    records: [],
  }
  componentDidMount() {
    this.props.loadCmsFiles(this.props.delegation.delg_no).then((result) => {
      if (!result.error) {
        this.setState({
          records: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey === 'ciqDecl' && nextProps.delegation.delg_no !== this.props.delegation.delg_no) {
      this.props.loadCmsFiles(nextProps.delegation.delg_no).then((result) => {
        if (!result.error) {
          this.setState({
            records: result.data,
          });
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handlePreview = (row) => {
    window.open(row.url);
  }
  handleDownload = (row) => {
    const a = document.createElement('a');
    a.href = row.url;
    a.download = row.doc_name;
    a.click();
  }
  render() {
    const { ciqSpinning } = this.props;
    const { records } = this.state;
    const columns = [{
      title: '文件名称',
      dataIndex: 'doc_name',
    }, {
      title: '类别',
      dataIndex: 'doc_code',
      width: 150,
      render: o => CMS_DOC_TYPE.find(type => type.value === o) &&
       CMS_DOC_TYPE.find(type => type.value === o).text,
    }, {
      title: '编号',
      dataIndex: 'doc_no',
      width: 200,
    }, {
      title: '上传人',
      dataIndex: 'creater_login_id',
      width: 100,
      render: o => this.props.userMembers.find(user => user.login_id === o) &&
       this.props.userMembers.find(user => user.login_id === o).name,
    }, {
      title: '上传时间',
      dataIndex: 'created_date',
      width: 150,
      render: date => (date ? moment(date).format('YYYY.MM.DD HH:mm') : '-'),
    }, {
      dataIndex: 'OPS_COL',
      className: 'table-col-ops',
      width: 100,
      render: (_, row) => (<span>
        <RowAction shape="circle" onClick={this.handlePreview} icon="eye-o" tooltip={this.msg('preview')} row={row} />
        <RowAction shape="circle" onClick={this.handleDownload} icon="download" tooltip={this.msg('download')} row={row} />
      </span>),
    }];
    return (
      <div className="pane-content tab-pane">
        <Spin spinning={ciqSpinning}>
          <Card bodyStyle={{ padding: 0 }} >
            <Table size="middle" columns={columns} pagination={false} dataSource={records} />
          </Card>
        </Spin>
      </div>
    );
  }
}
