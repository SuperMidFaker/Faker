import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, Select, Input, message } from 'antd';
import { loadCertMarks, saveCertMark, delbillCertmark } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

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
          options.map((opt, idx) => <Option value={opt.key} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    return <span>{`${record.cert_code} | ${record[field]}` || ''}</span>;
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
    certMarks: state.cmsManifest.certMarks,
    certParams: state.cmsManifest.certParams,
  }),
  { loadCertMarks, saveCertMark, delbillCertmark }
)
export default class CertMarkPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    certMarks: PropTypes.array,
    certParams: PropTypes.array,
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
    if (field === 'cert_spec') {
      const cert = this.props.certParams.filter(param => param.cert_spec === value)[0];
      record.cert_code = cert.cert_code; // eslint-disable-line no-param-reassign
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
    this.props.saveCertMark(record).then(
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
    this.props.delbillCertmark(record.id).then((result) => {
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
    const { certParams } = this.props;
    const option = certParams.map(cert => ({
      value: cert.cert_code,
      text: `${cert.cert_code}|${cert.cert_spec}`,
      key: cert.cert_spec,
    }));
    const columns = [{
      title: this.msg('certSpec'),
      dataIndex: 'cert_spec',
      width: 200,
      render: (o, record) =>
        <ColumnSelect field="cert_spec" inEdit={!record.id} record={record}
          onChange={this.handleEditChange} options={option}
        />,
    }, {
      title: this.msg('certNum'),
      dataIndex: 'cert_num',
      width: 200,
      render: (o, record) =>
        <ColumnInput field="cert_num" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      width: 80,
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
