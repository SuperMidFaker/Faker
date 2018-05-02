import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Input, message, Mention, Modal, Tag, Transfer, TreeSelect, Switch } from 'antd';
import { updateFee, addFees, deleteFees, saveQuoteBatchEdit, loadQuoteFees } from 'common/reducers/cmsQuote';
import { loadAllFeeGroups, loadParentFeeElements } from 'common/reducers/bssFeeSettings';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import ToolbarAction from 'client/components/ToolbarAction';
import { FEE_TYPE, BILLING_METHOD, FORMULA_PARAMS } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const { Nav } = Mention;
let BILLING_METHODS = [];
BILLING_METHOD.forEach((blm) => {
  BILLING_METHODS.push({ key: blm.key, value: blm.value, label: blm.label });
  if (blm.children) {
    BILLING_METHODS = BILLING_METHODS.concat(blm.children);
  }
});

@injectIntl
@connect(
  state => ({
    quoteNo: state.cmsQuote.quoteNo,
    quoteFeesLoading: state.cmsQuote.quoteFeesLoading,
    parentFeeElements: state.bssFeeSettings.parentFeeElements,
    allFeeGroups: state.bssFeeSettings.allFeeGroups,
  }),
  {
    updateFee,
    addFees,
    deleteFees,
    saveQuoteBatchEdit,
    loadQuoteFees,
    loadParentFeeElements,
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
  };
  componentDidMount() {
    this.props.loadAllFeeGroups();
    this.props.loadParentFeeElements().then((result) => {
      this.handleElementLoad(result.data);
    });
  }
  compontentWillReceiveProps(nextProps) {
    if (nextProps.quoteFeesReload) {
      this.handleElementLoad(nextProps.parentFeeElements);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleElementLoad = (parentFeeElements) => {
    this.props.loadQuoteFees(this.props.quoteNo).then((result) => {
      const quoteFees = result.data;
      const existFeeCodes = quoteFees.map(fe => fe.fee_code);
      const allFeeCodes = parentFeeElements.map(fe => fe.fee_code);
      const diffCodes = allFeeCodes.filter(code => !existFeeCodes.includes(code));
      const transferData = parentFeeElements.filter(fee => diffCodes.includes(fee.fee_code));
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
        const addData = this.props.parentFeeElements.filter(fe =>
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
  handleEditChange = (field, value) => {
    if (field === 'billing_way' && value === '$manual') {
      this.setState({
        editItem: { ...this.state.editItem, [field]: value, formula_factor: '' },
      });
    } else {
      this.setState({
        editItem: { ...this.state.editItem, [field]: value },
      });
    }
  }
  handleFormulaChange = (editorState) => {
    const formula = Mention.toString(editorState);
    this.handleEditChange('formula_factor', formula);
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
        this.handleElementLoad(this.props.parentFeeElements);
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
    this.setState({ onEdit: true, editItem: { ...row } });
  }
  handleFeeEditCancel = () => {
    this.setState({ onEdit: false, editItem: {} });
  }
  handleFeeSave = () => {
    const item = this.state.editItem;
    this.props.updateFee({
      id: item.id,
      billing_way: item.billing_way,
      formula_factor: item.formula_factor,
      need_settle: item.need_settle,
    });
    const fees = [...this.state.fees];
    const feeIndex = fees.findIndex(fe => fe.id === item.id);
    fees[feeIndex] = item;
    this.setState({
      onEdit: false, editItem: {}, fees,
    });
  }
  render() {
    const {
      quoteFeesLoading, allFeeGroups, readOnly,
    } = this.props;
    const {
      targetKeys, selectedKeys, visible, fees, onEdit, transferData, editItem,
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
        render: (o) => {
          const type = FEE_TYPE.filter(fe => fe.key === o)[0];
          return type ? <Tag color={type.tag}>{type.text}</Tag> : <span />;
        },
      }, {
        title: this.msg('billingWay'),
        dataIndex: 'billing_way',
        width: 180,
        render: (o, record) => {
          if (onEdit && editItem.id === record.id) {
            return (<TreeSelect
              size="small"
              style={{ width: '100%' }}
              defaultValue={o}
              dropdownStyle={{ overflow: 'auto' }}
              treeData={BILLING_METHOD}
              treeDefaultExpandAll
              onChange={value => this.handleEditChange('billing_way', value)}
            />);
          }
          const method = BILLING_METHODS.filter(bl => bl.key === o)[0];
          return method ? method.label : '';
        },
      }, {
        title: this.msg('settle'),
        dataIndex: 'need_settle',
        width: 120,
        render: (o, record) => {
          if (onEdit && editItem.id === record.id) {
            return <Switch checked={!!editItem.need_settle} onChange={checked => this.handleEditChange('need_settle', checked)} />;
          }
          return <Switch checked={!!o} disabled />;
        },
      }, {
        title: this.msg('formulaFactor'),
        dataIndex: 'formula_factor',
        render: (o, record) => {
          if (onEdit && editItem.id === record.id) {
            if (editItem.billing_way === '$formula') {
              return (<Mention
                size="small"
                suggestions={this.state.suggestions}
                prefix="$"
                onSearchChange={this.handleFormulaSearch}
                defaultValue={o ? Mention.toContentState(o) : null}
                placeholder="$公式"
                onChange={editorState => this.handleFormulaChange(editorState)}
                multiLines
                style={{ width: '100%' }}
              />);
            }
            if (editItem.billing_way === '$input') {
              return (
                <Mention
                  size="small"
                  prefix="$"
                  style={{ width: '100%' }}
                  defaultValue={o ? Mention.toContentState(o) : null}
                  suggestions={['input']}
                  onChange={editorState => this.handleFormulaChange(editorState)}
                />
              );
            }
            if (editItem.billing_way === '$manual') {
              return (
                <Input
                  size="small"
                  value={editItem.formula_factor}
                  disabled
                  placeholder="单价/金额"
                  onChange={e => this.handleEditChange('formula_factor', e.target.value)}
                  style={{ width: '100%' }}
                />
              );
            }
            return (
              <Input
                size="small"
                defaultValue={o}
                placeholder="单价/金额"
                onChange={e => this.handleEditChange('formula_factor', e.target.value)}
                style={{ width: '100%' }}
              />
            );
          }
          return o;
        },
      },
    ];
    if (!readOnly) {
      columns.push({
        width: 90,
        render: (o, record) => {
          if (onEdit && editItem.id === record.id) {
            return (<span>
              <RowAction onClick={this.handleFeeSave} icon="save" row={record} />
              <RowAction onClick={this.handleFeeEditCancel} icon="close" tooltip="取消" />
            </span>
            );
          }
          return (<RowAction onClick={this.handleFeeEdit} icon="edit" row={record} />);
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
        columns={columns}
        rowSelection={rowSelection}
        dataSource={fees}
        rowKey="fee_code"
        loading={quoteFeesLoading}
        scrollOffset={312}
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
