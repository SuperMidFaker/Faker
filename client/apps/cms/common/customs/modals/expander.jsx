import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Tag, Select } from 'antd';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnSelect(props) {
  const { record, field, options, onChange, index } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(record, index, field, value);
    }
  }
  return (
    <Select showArrow optionFilterProp="search" value={record[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
      {
        options.map(opt => <Option value={opt.value} key={`${opt.value}`}>{`${opt.text}`}</Option>)
      }
    </Select>
  );
}

ColumnSelect.proptypes = {
  record: PropTypes.object.isRequired,
  index: PropTypes.number,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

@injectIntl
@connect(
  state => ({
    easilist: state.cmsDeclare.batchSendModal.easilist,
  })
)
export default class Expander extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    custkey: PropTypes.string.isRequired,
    subData: PropTypes.array.isRequired,
    declList: PropTypes.array.isRequired,
    onchange: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.subData,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.subData !== this.props.subData) {
      this.setState({ dataSource: nextProps.subData });
    }
  }
  handleEditChange = (record, index, field, value) => {
    const dataSource = this.state.dataSource;
    dataSource[index][field] = value;
    this.props.onchange({ custname: this.props.custkey, changeData: dataSource });
    this.setState({ dataSource });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { dataSource } = this.state;
    const columns = [{
      title: '统一编号',
      dataIndex: 'pre_entry_seq_no',
    }, {
      title: '类型',
      dataIndex: 'sheet_type',
      width: 100,
      render: (o, record) => {
        if (record.i_e_type === 0) {
          if (o === 'CDF') {
            return <Tag color="blue">进口报关单</Tag>;
          } else if (o === 'FTZ') {
            return <Tag color="blue">进境备案清单</Tag>;
          }
        } else if (record.i_e_type === 1) {
          if (o === 'CDF') {
            return <Tag color="cyan">出口报关单</Tag>;
          } else if (o === 'FTZ') {
            return <Tag color="cyan">出境备案清单</Tag>;
          }
        } else {
          return <span />;
        }
      },
 /*   }, {
      title: this.msg('trafMode'),
      dataIndex: 'traf_mode',
      width: 100, */
    }, {
      title: this.msg('declType'),
      width: 180,
      render: (o, record, index) =>
        (<ColumnSelect field="declType"
          onChange={this.handleEditChange} options={this.props.declList} record={record} index={index}
        />),
    }, {
      title: 'EDI',
      width: 180,
      render: (o, record, index) => {
        let easipassOpt = [];
        if (this.props.easilist[record.agent_custco]) {
          easipassOpt = this.props.easilist[record.agent_custco].map(easi => ({
            value: easi.app_uuid,
            text: easi.name,
          }));
        }
        return (
          <ColumnSelect field="easipass"
            onChange={this.handleEditChange} options={easipassOpt} record={record} index={index}
          />);
      },
    }];
    return (
      <Table columns={columns} dataSource={dataSource} pagination={false}
        size="small" scroll={{ x: 300, y: 200 }}
      />
    );
  }
}
