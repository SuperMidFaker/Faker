import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Upload, message } from 'antd';
import moment from 'moment';
import { uploadAttachment, loadOrderAttachments } from 'common/reducers/sofOrders';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import { formatMsg } from '../../message.i18n';


@injectIntl
@connect(
  state => ({
    order: state.sofOrders.dock.order,
    userMembers: state.account.userMembers,
  }),
  { uploadAttachment, loadOrderAttachments }
)
export default class AttachmentPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    records: [],
  }
  componentWillMount() {
    this.props.loadOrderAttachments(this.props.order.shipmt_order_no).then((result) => {
      if (!result.error) {
        this.setState({
          records: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.order.shipmt_order_no !== this.props.order.shipmt_order_no) {
      this.props.loadOrderAttachments(nextProps.order.shipmt_order_no).then((result) => {
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
  handleUploaded = (name, url) => {
    const { order } = this.props;
    this.props.uploadAttachment(url, name, order.shipmt_order_no);
  }
  render() {
    const { records } = this.state;
    const columns = [{
      title: '名称',
      dataIndex: 'doc_name',
    }, {
      title: '创建人',
      dataIndex: 'created_by',
      width: 100,
      render: o => this.props.userMembers.find(user => user.login_id === o) &&
       this.props.userMembers.find(user => user.login_id === o).name,
    }, {
      title: '创建时间',
      dataIndex: 'created_date',
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
    const me = this;
    const props = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      multiple: false,
      showUploadList: false,
      withCredentials: true,
      onChange(info) {
        if (info.file.response && info.file.response.status === 200) {
          me.handleUploaded(info.file.name, info.file.response.data);
          message.success('上传成功');
        }
      },
    };
    const toolbarActions = (
      <Upload {...props}>
        <Button type="primary" icon="upload">上传</Button>
      </Upload>
    );
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" toolbarActions={toolbarActions} columns={columns} dataSource={records} noSetting />
      </div>
    );
  }
}
