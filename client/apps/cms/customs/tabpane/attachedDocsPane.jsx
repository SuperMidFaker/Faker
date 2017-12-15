import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Select, Input, message } from 'antd';
import { loadDocuMarks, saveDocuMark, delDocumark } from 'common/reducers/cmsManifest';
import { CMS_DECL_DOCU, CMS_DECL_STATUS } from 'common/constants';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

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
  record: PropTypes.object.isRequired,
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
          options.map(opt => <Option value={opt.text} key={opt.value}>{opt.value} | {opt.text}</Option>)
        }
      </Select>
    );
  } else {
    const option = options.find(item => item.value === record[field]);
    return <span>{option ? option.text : ''}</span>;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
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
  { loadDocuMarks, saveDocuMark, delDocumark }
)
export default class AttachedDocsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    head: PropTypes.object,
    docuMarks: PropTypes.array,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadDocuMarks(this.props.head.entry_id);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.head !== nextProps.head ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'document')) {
      this.props.loadDocuMarks(nextProps.head.entry_id);
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
    this.props.saveDocuMark(record).then((result) => {
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
  render() {
    const { head } = this.props;
    const columns = [{
      title: this.msg('docuSpec'),
      dataIndex: 'docu_spec',
      render: (o, record) =>
        (<ColumnSelect field="docu_spec" inEdit={!record.id} record={record}
          onChange={this.handleEditChange} options={CMS_DECL_DOCU}
        />),
    }, {
      title: this.msg('docuCode'),
      dataIndex: 'docu_code',
      render: (o, record) =>
        (<ColumnInput field="docu_code" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('docuFile'),
      dataIndex: 'docu_file',
      render: (o, record, index) => o ? <a>{o}</a> : <Button type="primary" ghost onClick={() => this.handleUpload(record, index)} icon="upload" />,
    }, {
      width: 100,
      render: (o, record, index) => {
        if (head.status < CMS_DECL_STATUS.sent.value) {
          return record.id ? <Button type="danger" shape="circle" onClick={() => this.handleDelete(record, index)} icon="delete" /> :
          <span>
            <Button type="primary" shape="circle" onClick={() => this.handleSave(record)} icon="save" />
            <Button shape="circle" onClick={() => this.handleCancel(record, index)} icon="close" style={{ marginLeft: 8 }} />
          </span>;
        }
      },
    }];
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={columns} bordered scrollOffset={312}
        dataSource={this.state.datas} rowKey="id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          {head.status < CMS_DECL_STATUS.sent.value &&
          <Button type="primary" onClick={this.handleAdd} icon="plus">{this.msg('添加')}</Button>}
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
