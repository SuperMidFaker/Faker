import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Input, message, Mention, Modal, Transfer, TreeSelect, Badge } from 'antd';
import { feeUpdate, feeAdd, feeDelete, saveQuoteBatchEdit, toggleAddFeeModal } from 'common/reducers/cmsQuote';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
// import SearchBox from 'client/components/SearchBox';
import { BILLING_METHOD, FORMULA_PARAMS } from 'common/constants';
// import AddFeeModal from '../modal/addFeeModal';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const { Nav } = Mention;

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
    feeUpdate, feeAdd, feeDelete, saveQuoteBatchEdit, toggleAddFeeModal,
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
    suggestions: [],
    selectedRowKeys: [],
    targetKeys: [],
    selectedKeys: [],
    visible: false,
  };
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleFeeDelete = (row) => {
    this.props.feeDelete(row.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
        this.props.reload();
      }
    });
  }
  handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = FORMULA_PARAMS.filter(item =>
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
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleOk = () => {
    // TODO
    this.handleCancel();
  }
  toggleAddFeeModal = () => {
    // this.props.toggleAddFeeModal(true);
    this.setState({
      visible: true,
    });
  }
  render() {
    const { quoteData } = this.props;
    const {
      targetKeys, selectedKeys, visible,
    } = this.state;
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
        title: this.msg('feeGroup'),
        dataIndex: 'fee_group',
        width: 150,
      }, {
        title: this.msg('feeType'),
        dataIndex: 'fee_type',
        filters: [
          { text: '服务', value: 'SC' },
          { text: '代垫', value: 'AP' },
        ],
        width: 150,
      }, {
        title: this.msg('billingWay'),
        dataIndex: 'billing_way',
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
        width: 250,
        render: (o, record) => {
          if (record.billing_way === '$formula') {
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
        title: this.msg('invoiceEn'),
        dataIndex: 'tax_included',
        width: 100,
        render: (o) => {
          if (o) {
            return <Badge status="success" />;
          }
          return <Badge status="default" />;
        },
      }, {
        title: this.msg('taxRate'),
        dataIndex: 'tax_rate',
        width: 150,
      }, {
        width: 100,
        fixed: 'right',
        render: (o, record) =>
          <RowAction danger icon="minus-circle-o" tooltip={this.gmsg('remove')} onClick={this.handleFeeDelete} row={record} />,
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={quoteData.fees}
        rowKey="id"
        loading={quoteData.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" onClick={this.toggleAddFeeModal}>{this.gmsg('add')}</Button>
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
        {/* <AddFeeModal reload={this.props.reload} /> */}
        <Modal
          title="选择费用元素"
          width={695}
          visible={visible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        >
          <Transfer
            dataSource={this.state.dataSource}
            showSearch
            titles={['可选', '已选']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            render={item => item.invoice_no}
            rowKey={item => item.invoice_no}
            listStyle={{
              width: 300,
              height: 400,
            }}
          />
        </Modal>
      </DataPane>
    );
  }
}
