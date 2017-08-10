/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon, Table } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import ExcelUpload from 'client/components/excelUploader';
import messages from '../../message.i18n';
import { showDetailModal, addTemporary, deleteTemporary } from 'common/reducers/cwmReceive';
import AddDetailModal from '../modal/addDetailModal';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    units: state.cwmSku.params.units,
    currencies: state.cwmSku.params.currencies,
  }),
  { showDetailModal, addTemporary, deleteTemporary }
)
export default class DetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    detailEnable: PropTypes.bool.isRequired,
  }
  state = {
    editRecord: {},
    edit: false,
  };
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { asnBody } = nextProps;
    if (asnBody && (nextProps.asnBody !== this.props.asnBody)) {
      this.props.addTemporary(asnBody);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  showDetailModal = () => {
    this.setState({
      edit: false,
    });
    this.props.showDetailModal();
  }
  handleDelete = (index) => {
    this.props.deleteTemporary(index);
  }
  handleEdit = (row) => {
    this.setState({
      editRecord: row,
      edit: true,
    });
    this.props.showDetailModal();
  }
  asnDetailsUploaded = (data) => {
    this.props.addTemporary(data);
  }
  render() {
    const { editable, temporaryDetails, detailEnable, form, units, currencies } = this.props;
    const poNo = form.getFieldValue('po_no');
    const ownerPartnerId = form.getFieldValue('owner_partner_id');
    const columns = [{
      title: '行号',
      dataIndex: 'seq_no',
      width: 50,
      className: 'cell-align-center',
      fixed: 'left',
      render: (col, row, index) => index + 1,
    }, {
      title: '货号',
      dataIndex: 'product_no',
      width: 200,
      fixed: 'left',
    }, {
      title: '中文品名',
      dataIndex: 'name',
      width: 250,
    }, {
      title: '订单数量',
      width: 100,
      dataIndex: 'order_qty',
      className: 'cell-align-right',
    }, {
      title: '计量单位',
      dataIndex: 'unit',
      className: 'cell-align-center',
      render: o => o && units.find(unit => unit.code === o).name,
    }, {
      title: '库别',
      dataIndex: 'virtual_whse',
      width: 150,
    }, {
      title: '采购订单号',
      dataIndex: 'po_no',
      width: 150,
    }, {
      title: '集装箱号',
      dataIndex: 'container_no',
      width: 150,
    }, {
      title: '单价',
      dataIndex: 'unit_price',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: '总价',
      dataIndex: 'amount',
      width: 100,
      className: 'cell-align-right',
    }, {
      title: '币制',
      dataIndex: 'currency',
      className: 'cell-align-center',
      render: o => o && <span>{`${o}|${currencies.find(currency => Number(currency.code) === o).name}`}</span>,
    }, {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (o, record, index) => (
        <span>
          <RowUpdater onHit={this.handleEdit} label={<Icon type="edit" />} row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={() => this.handleDelete(index)} label={<Icon type="delete" />} row={record} />
        </span>
        ),
    }];
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          {editable && <Button type="primary" icon="plus-circle-o" disabled={detailEnable ? '' : 'disabled'} onClick={this.showDetailModal}>添加</Button>}
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/asn/details/import`}
            formData={{
              data: JSON.stringify({
                tenantId: this.props.tenantId,
                loginId: this.props.loginId,
                ownerPartnerId,
              }),
            }} onUploaded={this.asnDetailsUploaded}
          >
            {editable && <Button icon="upload" disabled={detailEnable ? '' : 'disabled'}>导入</Button>}
          </ExcelUpload>
        </div>
        <Table columns={columns} dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))} rowKey="index"
          scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
        />
        <AddDetailModal poNo={poNo} product={this.state.editRecord} edit={this.state.edit} selectedOwner={this.props.selectedOwner} />
      </div>
    );
  }
}
