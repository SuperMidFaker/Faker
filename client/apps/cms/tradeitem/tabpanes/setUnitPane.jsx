import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, Select, message } from 'antd';
import { loadDeclwayUnit, saveDeclwayUnit, delDeclwayUnit } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { DECL_I_TYPE, DECL_E_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Option = Select.Option;

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
          options.map((opt, idx) => <Option value={opt.key} key={`${opt.key}${idx}`}>{opt.value}</Option>)
        }
      </Select>
    );
  } else {
    const option = options.find(item => item.key === record[field]);
    return <span>{option ? option.value : ''}</span>;
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
    tabKey: state.cmsTradeitem.tabKey,
    repoId: state.cmsTradeitem.repoId,
    declunits: state.cmsTradeitem.declunits.map(un => ({
      key: un.unit_code,
      value: un.unit_name,
    })),
    declwayUnits: state.cmsTradeitem.declwayUnits,
  }),
  { loadDeclwayUnit, saveDeclwayUnit, delDeclwayUnit }
)
export default class SetUnitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoId: PropTypes.number,
    declunits: PropTypes.array,
    declwayUnits: PropTypes.array,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadDeclwayUnit(this.props.repoId);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.repoId !== nextProps.repoId ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'copCodes')) {
      this.props.loadDeclwayUnit(nextProps.repoId);
    }
    if (this.props.declwayUnits !== nextProps.declwayUnits) {
      this.setState({ datas: nextProps.declwayUnits });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleAdd = () => {
    const addOne = {
      repo_id: this.props.repoId,
      decl_way_code: '',
      decl_unit: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveDeclwayUnit(record).then(
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
    this.props.delDeclwayUnit(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  handleTradeSel = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  render() {
    const DECL_TYPE = DECL_I_TYPE.concat(DECL_E_TYPE);
    const columns = [{
      title: this.msg('declareWay'),
      dataIndex: 'decl_way_code',
      render: (o, record) =>
        <ColumnSelect field="decl_way_code" inEdit={!record.id} record={record}
          onChange={this.handleTradeSel} options={DECL_TYPE}
        />,
    }, {
      title: this.msg('declareUnit'),
      dataIndex: 'decl_unit',
      render: (o, record) =>
        <ColumnSelect field="decl_unit" inEdit={!record.id} record={record}
          onChange={this.handleTradeSel} options={this.props.declunits}
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
