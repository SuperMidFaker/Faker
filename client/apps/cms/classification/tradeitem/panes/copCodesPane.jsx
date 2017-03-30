import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Table, Select, message } from 'antd';
import { loadTradeCodes, loadRepoTrades, saveRepoTrade, delRepoTrade } from 'common/reducers/cmsTradeitem';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

function ColumnInput(props) {
  const { record, field } = props;
  return <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
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
          options.map((opt, idx) => <Option value={opt.name} key={`${opt.name}${idx}`}>{opt.name}</Option>)
        }
      </Select>
    );
  } else {
    return <span>{record[field]}</span>;
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
    tradeCodes: state.cmsTradeitem.tradeCodes,
    repoTrades: state.cmsTradeitem.repoTrades,
  }),
  { loadTradeCodes, loadRepoTrades, saveRepoTrade, delRepoTrade }
)
export default class CopCodesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tradeCodes: PropTypes.array,
    repoTrades: PropTypes.array,
    repoId: PropTypes.number,
    repo: PropTypes.object.isRequired,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadTradeCodes(this.props.tenantId);
    this.props.loadRepoTrades(this.props.repoId);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.repoId !== nextProps.repoId ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'copCodes')) {
      this.props.loadRepoTrades(nextProps.repoId);
    }
    if (this.props.repoTrades !== nextProps.repoTrades) {
      this.setState({ datas: nextProps.repoTrades });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleAdd = () => {
    const addOne = {
      repo_id: this.props.repoId,
      creater_login_id: this.props.loginId,
      relation_id: null,
      comp_code: '',
      customs_code: '',
      trade_name: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveRepoTrade(record).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功', 5);
          this.props.loadRepoTrades(this.props.repoId);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.delRepoTrade(record.id).then((result) => {
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
    const rels = this.props.tradeCodes.filter(tr => tr.name === value)[0];
    if (rels) {
      record.comp_code = rels.comp_code; // eslint-disable-line no-param-reassign
      record.customs_code = rels.customs_code; // eslint-disable-line no-param-reassign
      record.relation_id = rels.relation_id; // eslint-disable-line no-param-reassign
    }
    this.forceUpdate();
  }
  render() {
    const { tradeCodes, repo } = this.props;
    const columns = [{
      title: this.msg('tradeName'),
      dataIndex: 'trade_name',
      width: 160,
      render: (o, record) =>
        <ColumnSelect field="trade_name" inEdit={!record.id} record={record}
          onChange={this.handleTradeSel} options={tradeCodes}
        />,
    }, {
      title: this.msg('compCode'),
      dataIndex: 'comp_code',
      render: (o, record) =>
        <ColumnInput field="comp_code" record={record} />,
    }, {
      title: this.msg('customsCode'),
      dataIndex: 'customs_code',
      render: (o, record) =>
        <ColumnInput field="customs_code" record={record} />,
    }];
    if (repo.permission === CMS_TRADE_REPO_PERMISSION.edit) {
      columns.push({
        width: 70,
        render: (o, record, index) => (
          <div className="editable-row-operations">
            {record.id ?
              <span>
                <a onClick={() => this.handleDelete(record, index)}><Icon type="delete" /></a>
              </span>
            :
              <span>
                <a onClick={() => this.handleSave(record)}><Icon type="save" /></a>
                <span className="ant-divider" />
                <a onClick={() => this.editDone(index, 'cancel')}><Icon type="close" /></a>
              </span>
          }
          </div>),
      });
    }
    return (
      <Table size="middle" pagination={false} columns={columns} dataSource={this.state.datas}
        footer={repo.permission === CMS_TRADE_REPO_PERMISSION.edit ? () => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button> : null}
      />
    );
  }
}
