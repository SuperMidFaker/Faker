import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, Select, Input, message } from 'antd';
import { loadCertMarks, saveCertMarks, delbillCertmark } from 'common/reducers/cmsManifest';

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
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? foundOpts[0].text : '';
    return <span>{label}</span>;
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
    tabKey: state.cmsManifest.tabKey,
    billMeta: state.cmsManifest.billMeta,
    certMarks: state.cmsManifest.certMarks,
    certParams: state.cmsManifest.certParams,
  }),
  { loadCertMarks, saveCertMarks, delbillCertmark }
)
export default class CertMarkPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    certMarks: PropTypes.array,
    certParams: PropTypes.array,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
      entries: PropTypes.arrayOf(PropTypes.shape({ pre_entry_seq_no: PropTypes.string })),
    }),
  }
  state = {
    datas: [],
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.billMeta !== nextProps.billMeta) {
      this.props.loadCertMarks(nextProps.billMeta.bill_seq_no);
    }
    if (this.props.certMarks !== nextProps.certMarks) {
      this.setState({ datas: nextProps.certMarks });
    }
  }
  handleEditChange = (record, field, value) => {
    if (field === 'cert_spec') {
      const cert = this.props.certParams.filter(param => param.cert_spec === value)[0];
      record.cert_code = cert.cert_code; // eslint-disable-line no-param-reassign
    }
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const addOne = {
      bill_seq_no: this.props.billMeta.bill_seq_no,
      cert_code: '',
      cert_spec: '',
      cert_mark_code: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = () => {
    this.props.saveCertMarks(this.state.datas).then(
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
  handleFooterButton = () => (
    <div>
      <Button type="primary" onClick={this.handleAdd} style={{ marginRight: 8 }}>添加</Button>
      <Button type="primary" onClick={this.handleSave}>保存</Button>
    </div>
  )

  render() {
    const { certParams } = this.props;
    const option = certParams.map(cert => ({
      value: cert.cert_code,
      text: cert.cert_spec,
    }));
    const columns = [{
      title: '单证类型',
      dataIndex: 'cert_spec',
      width: 200,
      render: (o, record) =>
        <ColumnSelect field="cert_spec" inEdit record={record}
          onChange={this.handleEditChange} options={option}
        />,
    }, {
      title: '单证编码',
      dataIndex: 'cert_mark_code',
      width: 200,
      render: (o, record) =>
        <ColumnInput field="cert_mark_code" inEdit record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      width: 80,
      render: (o, record, index) =>
        <Button type="ghost" shape="circle" onClick={() => this.handleDelete(record, index)} icon="delete" />,
    }];
    return (
      <Table pagination={false} columns={columns} dataSource={this.state.datas}
        footer={this.handleFooterButton}
      />
    );
  }
}
