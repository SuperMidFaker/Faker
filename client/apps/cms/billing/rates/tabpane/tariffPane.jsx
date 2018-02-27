import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Input, message, Mention, TreeSelect } from 'antd';
import { feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote } from 'common/reducers/cmsQuote';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
// import SearchBox from 'client/components/SearchBox';
import { BILLING_METHOD } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const { Nav } = Mention;

function getRowKey(row) {
  return row.id;
}
function ColumnInput(props) {
  const {
    inEdit, record, field, onChange,
  } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  let style = {};
  if (!record.enabled) {
    style = { color: '#CCCCCC' };
  }
  if (record.fee_style === 'advance' && field !== 'fee_name') {
    return <span />;
  }
  return inEdit ? <Input value={record[field] || ''} disabled={!record.enabled} onChange={handleChange} />
    : <span style={style}>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.shape({ id: PropTypes.number }).isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    quoteData: state.cmsQuote.quoteData,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  {
    feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote,
  }
)
export default class TariffPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.shape({ quote_no: PropTypes.string }).isRequired,
    // editable: PropTypes.bool.isRequired,
    feeDelete: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    count: 0,
    suggestions: [],
    selectedRowKeys: [],
  };
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  formulaParams = [
    { value: 'shipmt_qty', text: '货运数量' },
    { value: 'decl_qty', text: '报关单数量' },
    { value: 'decl_sheet_qty', text: '联单数量' },
    { value: 'decl_item_qty', text: '品项数量' },
    { value: 'trade_item_qty', text: '料件数量' },
    { value: 'trade_amt', text: '进出口金额' },
  ];
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }

  handleDelete = (row, index) => {
    const count = this.state.count + 1;
    const param = {};
    param.quoteId = this.props.quoteData._id;
    param.tenantId = this.props.tenantId;
    param.modifyById = this.props.loginId;
    param.modifyBy = this.props.loginName;
    param.modifyCount = this.props.quoteData.modify_count + count;
    this.setState({
      count,
    });
    this.props.feeDelete(
      param,
      row._id,
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
      }
    });
    this.props.quoteData.fees.splice(index, 1);
  }
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = this.formulaParams.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1);
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  handleonChange = (record, editorState) => {
    record.formula_factor = Mention.toString(editorState); // eslint-disable-line no-param-reassign
  }
  render() {
    const { quoteData } = this.props;
    const columns = [
      {
        title: this.gmsg('seqNo'),
        width: 50,
        align: 'center',
        className: 'table-col-seq',
        render: (o, record, index) => <span>{index + 1}</span>,
      }, {
        title: this.msg('feeCode'),
        dataIndex: 'fee_code',
        width: 120,
      }, {
        title: this.msg('feeName'),
        dataIndex: 'fee_name',
        width: 150,
      }, {
        title: this.msg('feeCategory'),
        dataIndex: 'category',
        width: 150,
      }, {
        title: this.msg('feeType'),
        dataIndex: 'fee_type',
        filters: [
          { text: '服务', value: 'service' },
          { text: '代垫', value: 'advance' },
        ],
        width: 150,
      }, {
        title: this.msg('billingMethod'),
        dataIndex: 'billing_method',
        width: 200,
        render: o =>
          (<TreeSelect
            style={{ width: '100%' }}
            value={o}
            dropdownStyle={{ overflow: 'auto' }}
            treeData={BILLING_METHOD}
            treeDefaultExpandAll
            onChange={this.handleEditChange}
          />),
      }, {
        title: this.msg('formulaFactor'),
        dataIndex: 'formula_factor',
        render: (o, record) => {
          if (record.billing_method === '$formula') {
            return (<Mention
              suggestions={this.state.suggestions}
              prefix="$"
              onSearchChange={this.handleSearch}
              defaultValue={Mention.toContentState(o)}
              placeholder="$公式"
              onChange={editorState => this.handleonChange(record, editorState)}
              multiLines
              style={{ width: '100%', height: '100%' }}
            />);
          }
          return (<ColumnInput
            field="formula_factor"
            inEdit
            record={record}
            onChange={this.handleEditChange}
          />);
        },
      }, {
        width: 60,
        fixed: 'right',
        render: (o, record, index) => <RowAction danger icon="minus-circle-o" tooltip={this.gmsg('remove')} onClick={this.handleDelete} row={record} index={index} />,
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const mockData = [{
      fee_code: '10',
      fee_name: '报关费',
      fee_type: 'SC',
      group: '清关费用',
      billing_method: '',
    }, {
      fee_code: '20',
      fee_name: '联单费',
      fee_type: 'SC',
      group: '清关费用',
      billing_method: '',
    }, {
      fee_code: '100',
      fee_name: '港杂费',
      fee_type: 'AP',
      group: '清关费用',
      billing_method: '$manual',
    }];
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={mockData}
        rowKey={getRowKey}
        loading={quoteData.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.toggleDetailModal}>{this.gmsg('add')}</Button>
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
