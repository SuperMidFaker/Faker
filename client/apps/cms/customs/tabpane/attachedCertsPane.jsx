import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Select, Input, message } from 'antd';
import { loadCertMarks, saveCertMark, delbillCertmark } from 'common/reducers/cmsManifest';
import DataPane from 'client/components/DataPane';
import { CMS_DECL_STATUS } from 'common/constants';
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
          options.map(opt => <Option value={opt.value} key={opt.key}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    const existOpt = options.filter(opt => opt.key === record[field])[0];
    return <span>{existOpt ? existOpt.text : ''}</span>;
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
        (<ColumnSelect field="cert_code" inEdit={!record.id} record={record}
          onChange={this.handleEditChange} options={option}
        />),
    }, {
      title: this.msg('certNum'),
      dataIndex: 'cert_num',
      render: (o, record) =>
        (<ColumnInput field="cert_num" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      width: 100,
      render: (o, record, index) => {
        if (record.id) {
          return <Button type="danger" shape="circle" onClick={() => this.handleDelete(record, index)} icon="delete" />;
        } else {
          return (<span>
            <Button type="primary" shape="circle" onClick={() => this.handleSave(record)} icon="save" />
            <Button shape="circle" onClick={() => this.handleCancel(record, index)} icon="close" style={{ marginLeft: 8 }} />
          </span>);
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
          <Button type="primary" onClick={this.handleAdd} icon="plus" >{this.msg('添加')}</Button>}
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
