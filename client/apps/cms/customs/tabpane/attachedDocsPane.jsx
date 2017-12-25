import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Select, Input, message, Upload, Tooltip } from 'antd';
import { loadDocuMarks, saveDocuMark, delDocumark, addCmsDeclDocu } from 'common/reducers/cmsManifest';
import { CMS_DECL_DOCU, CMS_DECL_STATUS } from 'common/constants';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
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
    docu_spec: PropTypes.string,
    docu_code: PropTypes.string,
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
          options.map(opt =>
            <Option value={opt.text} key={opt.value}>{opt.value} | {opt.text}</Option>)
        }
      </Select>
    );
  }
  const option = options.find(item => item.text === record[field]);
  return <span>{option ? option.text : ''}</span>;
}

ColumnSelect.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({
    docu_spec: PropTypes.string,
    docu_code: PropTypes.string,
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
    docuMarks: state.cmsManifest.docuMarks,
  }),
  {
    loadDocuMarks, saveDocuMark, delDocumark, addCmsDeclDocu,
  }
)
export default class AttachedDocsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    head: PropTypes.shape({
      bill_seq_no: PropTypes.string,
      ccd_file: PropTypes.string,
      delg_no: PropTypes.string,
      id: PropTypes.number,
    }),
    docuMarks: PropTypes.arrayOf(PropTypes.shape({
      pre_entry_seq_no: PropTypes.string,
      id: PropTypes.number,
      docu_spec: PropTypes.string,
      docu_file: PropTypes.string,
      docu_code: PropTypes.string,
      delg_no: PropTypes.string,
    })),
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadDocuMarks(this.props.head.pre_entry_seq_no);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.head !== nextProps.head ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'document')) {
      this.props.loadDocuMarks(nextProps.head.pre_entry_seq_no);
    }
    if (this.props.docuMarks !== nextProps.docuMarks) {
      this.setState({ datas: nextProps.docuMarks });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const { head } = this.props;
    const addOne = {
      delg_no: head.delg_no,
      entry_id: head.entry_id,
      creater_login_id: this.props.loginId,
      docu_code: '',
      docu_spec: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    if (!record.docu_spec) {
      message.info('随附单据文件类别为必填项');
      return;
    }
    if (!record.docu_code) {
      message.info('随附单据编号为必填项');
      return;
    }
    this.props.saveDocuMark({
      ...record,
      preEntrySeqNo: this.props.head.pre_entry_seq_no,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.delDocumark(record.id).then((result) => {
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
  handleUploaded = (data, id) => {
    this.props.addCmsDeclDocu(data, id).then((result) => {
      if (!result.error) {
        this.props.loadDocuMarks(this.props.head.pre_entry_seq_no);
      }
    });
  }
  handleView = (row) => {
    window.open(row.docu_file);
  }
  render() {
    const { head } = this.props;
    const columns = [{
      title: this.msg('docuSpec'),
      dataIndex: 'docu_spec',
      render: (o, record) =>
        (<ColumnSelect
          field="docu_spec"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
          options={CMS_DECL_DOCU}
        />),
    }, {
      title: this.msg('docuCode'),
      dataIndex: 'docu_code',
      render: (o, record) =>
        (<ColumnInput
          field="docu_code"
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
                doc_code: 'CUS_DOCU',
                doc_no: record.docu_code,
                doc_name: info.file.name,
                url: info.file.response.data,
                doc_type: info.file.type,
              }, record.id);
              message.success('上传成功');
            }
          },
        };
        const fileAction = record.docu_file ?
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
          <Button type="primary" onClick={this.handleAdd} icon="plus">{this.msg('添加')}</Button>}
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
