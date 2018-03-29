import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Input, Select, message } from 'antd';
import { loadContainers, saveContainer, delContainer } from 'common/reducers/cmsManifest';
import { CMS_CNTNR_SPEC_CUS, CMS_CNTNR_SPEC_CIQ } from 'common/constants';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import ToolbarAction from 'client/components/ToolbarAction';
import { formatMsg } from '../../message.i18n';

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
  record: PropTypes.shape({ id: PropTypes.number }).isRequired,
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
  const option = options.find(item => item.value === record[field]);
  return <span>{option ? option.text : ''}</span>;
}
ColumnSelect.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({ id: PropTypes.number }).isRequired,
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
    billHead: state.cmsManifest.billHead,
    containers: state.cmsManifest.containers,
  }),
  { loadContainers, saveContainer, delContainer }
)
export default class ContainersPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadContainers(this.props.billHead.delg_no);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.billHead !== nextProps.billHead ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'container')) {
      this.props.loadContainers(nextProps.billHead.delg_no);
    }
    if (this.props.containers !== nextProps.containers) {
      this.setState({ datas: nextProps.containers });
    }
  }
  msg = formatMsg(this.props.intl)
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const { billHead } = this.props;
    const addOne = {
      delg_no: billHead.delg_no,
      bill_seq_no: billHead.bill_seq_no,
      creater_login_id: this.props.loginId,
      container_id: '',
      container_wt: 2.2,
      container_spec: '1',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveContainer(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
      }
    });
  }
  handleDelete = (record, index) => {
    this.props.delContainer(record.id).then((result) => {
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
    const columns = [{
      title: this.msg('seqNo'),
      dataIndex: 'seq_no',
      width: 60,
    }, {
      title: this.msg('containerId'),
      dataIndex: 'container_id',
      render: (o, record) =>
        (<ColumnInput
          field="container_id"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      title: this.msg('containerSpec'),
      dataIndex: 'container_spec',
      render: (o, record) =>
        (<ColumnSelect
          field="container_spec"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
          options={CMS_CNTNR_SPEC_CUS}
        />),
    }, {
      title: this.msg('containerSpecCiq'),
      dataIndex: 'container_spec_ciq',
      render: (o, record) =>
        (<ColumnSelect
          field="container_spec_ciq"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
          options={CMS_CNTNR_SPEC_CIQ}
        />),
    }, {
      title: this.msg('containerWt'),
      dataIndex: 'container_wt',
      render: (o, record) =>
        (<ColumnInput
          field="container_wt"
          inEdit={!record.id}
          record={record}
          onChange={this.handleEditChange}
        />),
    }, {
      width: 100,
      render: (o, record, index) => {
        if (record.id) {
          return (<span>
            <RowAction shape="circle" danger confirm="确定删除?" onConfirm={() => this.handleDelete(record, index)} icon="delete" row={record} />
          </span>);
        }
        return (<span>
          <RowAction shape="circle" primary onClick={this.handleSave} icon="save" tooltip="保存" row={record} />
          <RowAction shape="circle" onClick={() => this.handleCancel(record, index)} icon="close" tooltip="取消" row={record} />
        </span>);
      },
    }];
    return (
      <DataPane

        columns={columns}
        bordered
        scrollOffset={312}
        dataSource={this.state.datas}
        rowKey="id"
      >
        <DataPane.Toolbar>
          <ToolbarAction primary onClick={this.handleAdd} icon="plus" label={this.msg('add')} />
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
