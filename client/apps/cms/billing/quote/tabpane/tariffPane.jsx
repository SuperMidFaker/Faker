import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Input, message, Mention, Modal, Transfer, TreeSelect } from 'antd';
import { updateFee, addFees, deleteFees, saveQuoteBatchEdit, loadQuoteFees } from 'common/reducers/cmsQuote';
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
    quoteNo: state.cmsQuote.quoteNo,
    quoteFeesLoading: state.cmsQuote.quoteFeesLoading,
    allFeeElements: state.bssFeeSettings.allFeeElements,
    allFeeGroups: state.bssFeeSettings.allFeeGroups,
  }),
  {
    updateFee,
    addFees,
    deleteFees,
    saveQuoteBatchEdit,
    loadQuoteFees,
    loadAllFeeElements,
    loadAllFeeGroups,
  }
)
export default class TariffPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
    transferData: [],
    editIndex: -1,
  };
  componentDidMount() {
    this.props.loadAllFeeGroups();
    this.props.loadAllFeeElements().then((result) => {
      this.handleElementLoad(result.data);
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleElementLoad = (allFeeElements) => {
    this.props.loadQuoteFees(this.props.quoteNo).then((result) => {
      const quoteFees = result.data;
      const existFeeCodes = quoteFees.map(fe => fe.fee_code);
      const allFeeCodes = allFeeElements.map(fe => fe.fee_code);
      const diffCodes = allFeeCodes.filter(code => !existFeeCodes.includes(code));
      const transferData = allFeeElements.filter(fee => diffCodes.includes(fee.fee_code));
      this.setState({ fees: result.data, transferData });
    });
  }
  handleFeesBatchDelete = () => {
    const feeCodes = this.state.selectedRowKeys;
    this.props.deleteFees(feeCodes, this.props.quoteNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
        this.handleDeselectRows();
        const addData = this.props.allFeeElements.filter(fe =>
          feeCodes.includes(fe.fee_code));
        const data = this.state.transferData.concat(addData);
        const fees = this.state.fees.filter(fe => !feeCodes.includes(fe.fee_code));
        this.setState({ transferData: data, fees });
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
      targetKeys: [],
    });
  }
  handleTransferOk = () => {
    const { targetKeys } = this.state;
    this.props.addFees(targetKeys, this.props.quoteNo).then((result) => {
      if (!result.error) {
        this.handleElementLoad(this.props.allFeeElements);
      }
    });
    this.handleTransferCancel();
  }
  toggleAddFeeModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleFeeEdit = (row, index) => {
    this.setState({ onEdit: true, editIndex: index, editItem: row });
  }
  handleFeeSave = () => {
    this.setState({ onEdit: false, editIndex: -1, editItem: {} });
    const item = this.state.editItem;
    this.props.updateFee({
      id: item.id,
      billing_way: item.billing_way,
      formula_factor: item.formula_factor,
    });
  }
  render() {
    const {
      quoteFeesLoading, allFeeGroups, readOnly,
    } = this.props;
    const {
      targetKeys, selectedKeys, visible, fees, onEdit, editIndex, transferData,
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
        render: (o, record, index) => {
          if (onEdit && editIndex === index) {
            return (<TreeSelect
              style={{ width: '100%' }}
              value={o}
              dropdownStyle={{ overflow: 'auto' }}
              treeData={BILLING_METHOD}
              treeDefaultExpandAll
              onChange={value => this.handleEditChange(record.id, 'billing_way', value)}
            />);
          }
          return o;
        },
      }, {
        title: this.msg('formulaFactor'),
        dataIndex: 'formula_factor',
        width: 250,
        render: (o, record, index) => {
          const formulaChildren = BILLING_METHOD.find(bl => bl.key === '$formula').children;
          if (onEdit && editIndex === index) {
            if (formulaChildren.find(fl => fl.key === record.billing_way)) {
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
          }
          return o;
        },
      },
    ];
    if (!readOnly) {
      columns.push({
        width: 80,
        render: (o, record, index) => {
          if (onEdit && editIndex === index) {
            return (<RowAction onClick={this.handleFeeSave} icon="save" row={record} index={index} />);
          }
          return (<RowAction onClick={this.handleFeeEdit} index={index} icon="edit" row={record} />);
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
        loading={quoteFeesLoading}
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
            dataSource={transferData}
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
