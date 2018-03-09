import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Input, message, Mention, Modal, Transfer, TreeSelect } from 'antd';
import { updateFee, addFees, deleteFees, saveQuoteBatchEdit, loadQuoteElements } from 'common/reducers/cmsQuote';
import { loadAllFeeGroups, loadAllFeeElements } from 'common/reducers/bssFeeSettings';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import ToolbarAction from 'client/components/ToolbarAction';
import { FEE_TYPE, BILLING_METHOD, FORMULA_PARAMS } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const { Nav } = Mention;

@injectIntl
@connect(
  state => ({
    quoteData: state.cmsQuote.quoteData,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    allFeeElements: state.bssFeeSettings.allFeeElements,
    allFeeGroups: state.bssFeeSettings.allFeeGroups,
  }),
  {
    updateFee,
    addFees,
    deleteFees,
    saveQuoteBatchEdit,
    loadQuoteElements,
    loadAllFeeElements,
    loadAllFeeGroups,
  }
)
export default class TariffPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.shape({ quote_no: PropTypes.string }).isRequired,
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
    fees: [],
    editItem: {},
    onEdit: false,
  };
  componentDidMount() {
    this.props.loadAllFeeGroups();
    this.props.loadAllFeeElements();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.quoteData &&
        nextProps.quoteData.fees !== this.props.quoteData.fees) {
      this.setState({ fees: nextProps.quoteData.fees });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleElementLoad = () => {
    this.props.loadQuoteElements({ quoteNo: this.props.quoteData.quote_no });
  }
  handleFeesBatchDelete = () => {
    const feeCodes = this.state.selectedRowKeys;
    this.props.deleteFees(feeCodes, this.props.quoteData.quote_no).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
        this.handleDeselectRows();
        this.handleElementLoad();
      }
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleFormulaSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = FORMULA_PARAMS.filter(item =>
      item.value.toLowerCase().indexOf(searchValue) !== -1);
    const suggestions = filtered.map(suggestion =>
      (<Nav value={suggestion.value} data={suggestion}>
        <span>{suggestion.text} - {suggestion.value} </span>
      </Nav>));
    this.setState({ suggestions });
  }
  handleEditChange = (id, field, value) => {
    const item = this.state.editItem;
    item[field] = value;
    this.setState({ editItem: item });
  }
  handleFormulaChange = (id, editorState) => {
    const formula = Mention.toString(editorState);
    this.handleEditChange(id, 'formula_factor', formula);
  }
  handleTransferChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }
  handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
  }
  handleTransferCancel = () => {
    this.setState({
      visible: false,
    });
  }
  handleTransferOk = () => {
    const { targetKeys } = this.state;
    this.props.addFees(targetKeys, this.props.quoteData.quote_no).then((result) => {
      if (!result.error) {
        this.handleElementLoad();
      }
    });
    this.handleTransferCancel();
  }
  toggleAddFeeModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleFeeEdit = (row) => {
    this.setState({ onEdit: true, editItem: row });
  }
  handleFeeSave = () => {
    this.setState({ onEdit: false });
    const item = this.state.editItem;
    this.props.updateFee({
      id: item.id,
      billing_way: item.billing_way,
      formula_factor: item.formula_factor,
    });
  }
  render() {
    const { quoteData, allFeeGroups, readOnly } = this.props;
    const {
      targetKeys, selectedKeys, visible, fees, onEdit,
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
        render: o =>
          allFeeGroups.find(fg => fg.fee_group_code === o) &&
          allFeeGroups.find(fg => fg.fee_group_code === o).fee_group_name,
      }, {
        title: this.msg('feeType'),
        dataIndex: 'fee_type',
        filters: [
          { text: '服务', value: 'SC' },
          { text: '代垫', value: 'AP' },
        ],
        width: 150,
        render: o =>
          FEE_TYPE.find(ft => ft.key === o) &&
          FEE_TYPE.find(ft => ft.key === o).text,
      }, {
        title: this.msg('billingWay'),
        dataIndex: 'billing_way',
        width: 200,
        render: (o, record) => {
          if (!onEdit) {
            return o;
          }
          return (<TreeSelect
            style={{ width: '100%' }}
            value={o}
            dropdownStyle={{ overflow: 'auto' }}
            treeData={BILLING_METHOD}
            treeDefaultExpandAll
            onChange={value => this.handleEditChange(record.id, 'billing_way', value)}
          />);
        },
      }, {
        title: this.msg('formulaFactor'),
        dataIndex: 'formula_factor',
        width: 250,
        render: (o, record) => {
          const formulaChildren = BILLING_METHOD.find(bl => bl.key === '$formula').children;
          if (!onEdit) {
            return o;
          } else if (formulaChildren.find(fl => fl.key === record.billing_way)) {
            return (<Mention
              suggestions={this.state.suggestions}
              prefix="$"
              onSearchChange={this.handleFormulaSearch}
              defaultValue={o ? Mention.toContentState(o) : null}
              placeholder="$公式"
              onChange={editorState => this.handleFormulaChange(record.id, editorState)}
              multiLines
              style={{ width: '100%', height: '100%' }}
            />);
          }
          return (
            <Input value={o} onChange={e => this.handleEditChange(record.id, 'formula_factor', e.target.value)} style={{ width: '100%' }} />
          );
        },
      },
    ];
    if (!readOnly) {
      columns.push({
        width: 100,
        render: (o, record) => {
          if (!onEdit) {
            return (<RowAction onClick={this.handleFeeEdit} icon="edit" row={record} />);
          }
          return (<RowAction onClick={this.handleFeeSave} icon="save" row={record} />);
        },
      });
    }
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
        dataSource={fees}
        rowKey="fee_code"
        loading={quoteData.loading}
      >
        <DataPane.Toolbar>
          {!readOnly && <Button type="primary" icon="plus-circle-o" onClick={this.toggleAddFeeModal}>{this.gmsg('add')}</Button>}
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            {!readOnly &&
              <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleFeesBatchDelete} />
            }
          </DataPane.BulkActions>
        </DataPane.Toolbar>
        <Modal
          title="选择费用元素"
          width={695}
          visible={visible}
          onCancel={this.handleTransferCancel}
          onOk={this.handleTransferOk}
        >
          <Transfer
            dataSource={this.props.allFeeElements}
            showSearch
            titles={['可选', '已选']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleTransferChange}
            onSelectChange={this.handleTransferSelectChange}
            render={item => `${item.fee_code}-${item.fee_name}`}
            rowKey={item => item.fee_code}
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
