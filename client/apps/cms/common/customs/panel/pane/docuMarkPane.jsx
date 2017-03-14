import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, Select, Input, message } from 'antd';
import { loadDocuMarks, saveDocuMark, delDocumark } from 'common/reducers/cmsManifest';
import { CMS_DECL_DOCU } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnInput(props) {
  const { inEdit, record, field, onChange } = props;
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
  const { inEdit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={record[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option value={opt.text} key={`${opt.value}${idx}`}>{opt.text}</Option>)
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
export default class DocuMarkPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
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
    this.props.saveDocuMark(record).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功', 5);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.delDocumark(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }

  render() {
    const columns = [{
      title: this.msg('docuSpec'),
      dataIndex: 'docu_spec',
      render: (o, record) =>
        <ColumnSelect field="docu_spec" inEdit={!record.id} record={record}
          onChange={this.handleEditChange} options={CMS_DECL_DOCU}
        />,
    }, {
      title: this.msg('docuCode'),
      dataIndex: 'docu_code',
      render: (o, record) =>
        <ColumnInput field="docu_code" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      width: 60,
      render: (o, record, index) => {
        if (record.id) {
          return <Button type="ghost" shape="circle" onClick={() => this.handleDelete(record, index)} icon="delete" />;
        } else {
          return <Button type="primary" shape="circle" onClick={() => this.handleSave(record)} icon="save" />;
        }
      },
    }];
    return (
      <Table pagination={false} columns={columns} dataSource={this.state.datas}
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button>}
      />
    );
  }
}
