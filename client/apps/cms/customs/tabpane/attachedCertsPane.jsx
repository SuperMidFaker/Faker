import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Select, Input, message, Tooltip, Upload } from 'antd';
import { loadCertMarks, saveCertMark, delbillCertmark, addCmsDeclCert } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { CMS_DECL_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Option } = Select;

function ColumnInput(props) {
  const {
    inEdit, record, field, onChange,
  } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  return inEdit ? <Input value={record[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({
    cert_code: PropTypes.string,
    cert_num: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

function ColumnSelect(props) {
  const {
    inEdit, record, field, options, onChange,
  } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={record[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map(opt => <Option value={opt.value} key={opt.key}>{opt.text}</Option>)
        }
      </Select>
    );
  }
  const existOpt = options.filter(opt => opt.key === record[field])[0];
  return <span>{existOpt ? existOpt.text : ''}</span>;
}

ColumnSelect.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({
    cert_code: PropTypes.string,
    cert_num: PropTypes.string,
  }).isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
    key: PropTypes.string,
  })).isRequired,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    tabKey: state.cmsManifest.tabKey,
    head: state.cmsManifest.entryHead,
    certMarks: state.cmsManifest.certMarks,
    certParams: state.cmsManifest.certParams,
  }),
  {
    loadCertMarks, saveCertMark, delbillCertmark, addCmsDeclCert,
  }
)
export default class CertMarkPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    certMarks: PropTypes.arrayOf(PropTypes.shape({
      cert_code: PropTypes.string,
      cert_num: PropTypes.string,
    })),
    certParams: PropTypes.arrayOf(PropTypes.shape({
      cert_code: PropTypes.string,
      cert_spec: PropTypes.string,
    })),
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadCertMarks(this.props.head.pre_entry_seq_no);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.head !== nextProps.head ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'document')) {
      this.props.loadCertMarks(nextProps.head.pre_entry_seq_no);
    }
    if (this.props.certMarks !== nextProps.certMarks) {
      this.setState({ datas: nextProps.certMarks });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (record, field, value) => {
    if (field === 'cert_code') {
      const cert = this.props.certParams.filter(param => param.cert_code === value)[0];
      record.cert_spec = cert.cert_spec; // eslint-disable-line no-param-reassign
    }
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const { head } = this.props;
    const addOne = {
      delg_no: head.delg_no,
      entry_id: head.entry_id,
      pre_entry_seq_no: head.pre_entry_seq_no,
      creater_login_id: this.props.loginId,
      cert_code: '',
      cert_spec: '',
      cert_num: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    if (!record.cert_code) {
      message.info('单证代码及名称为必填项');
      return;
    }
    if (!record.cert_num) {
      message.info('单证编号为必填项');
      return;
    }
    this.props.saveCertMark(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.delbillCertmark(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  handleCancel = (record, index) => {
    const datas = [...this.state.datas];
    datas.splice(index, 1);
    this.setState({ datas });
  }
  handleUploaded = (data) => {
    this.props.addCmsDeclCert(data).then((result) => {
      if (!result.error) {
        this.props.loadCertMarks(this.props.head.pre_entry_seq_no);
      }
    });
  }
  handleView = (row) => {
    window.open(row.cert_file);
  }
  render() {
    const { certParams, head } = this.props;
    const option = certParams.map(cert => ({
      value: cert.cert_code,
      text: `${cert.cert_code}|${cert.cert_spec}`,
      key: cert.cert_code,
    }));
    const columns = [{
      title: this.msg('certSpec'),
      dataIndex: 'cert_code',
      render: (o, record) =>
        (<ColumnSelect
          field="cert_code"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
          options={option}
        />),
    }, {
      title: this.msg('certNum'),
      dataIndex: 'cert_num',
      render: (o, record) =>
        (<ColumnInput
          field="cert_num"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      width: 100,
      render: (o, record, index) => {
        const me = this;
        const props = {
          action: `${API_ROOTS.default}v1/upload/img/`,
          multiple: false,
          showUploadList: false,
          withCredentials: true,
          onChange(info) {
            if (info.file.response && info.file.response.status === 200) {
              me.handleUploaded({
                delg_no: head.delg_no,
                pre_entry_seq_no: head.pre_entry_seq_no,
                doc_code: record.cert_code,
                doc_no: record.cert_num,
                doc_name: info.file.name,
                url: info.file.response.data,
                doc_type: info.file.type,
              });
              message.success('上传成功');
            }
          },
        };
        const fileAction = record.cert_file ?
          <RowAction shape="circle" onClick={this.handleView} icon="eye-o" tooltip="查看文件" row={record} /> :
          (<Upload {...props}>
            <Tooltip title="上传文件">
              <Button shape="circle" icon="upload" size="small" style={{ marginRight: 8 }} />
            </Tooltip>
          </Upload>);
        if (head.status < CMS_DECL_STATUS.sent.value) {
          if (record.id) {
            return (<span>
              {fileAction}
              <RowAction shape="circle" danger confirm="确定删除?" onConfirm={() => this.handleDelete(record, index)} icon="delete" row={record} />
            </span>);
          }
          return (<span>
            <RowAction shape="circle" primary onClick={this.handleSave} icon="save" tooltip="保存" row={record} />
            <RowAction shape="circle" onClick={() => this.handleCancel(record, index)} icon="close" tooltip="取消" row={record} />
          </span>);
        }
        return fileAction;
      },
    }];
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        bordered
        scrollOffset={312}
        dataSource={this.state.datas}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          {head.status < CMS_DECL_STATUS.sent.value &&
          <Button type="primary" onClick={this.handleAdd} icon="plus" >{this.msg('添加')}</Button>}
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
