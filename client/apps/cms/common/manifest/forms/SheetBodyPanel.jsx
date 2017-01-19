import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Collapse, Dropdown, Menu, Table, Icon, Input, Select, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from './rowUpdater';
import { updateHeadNetWt } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import ExcelUpload from 'client/components/excelUploader';
import globalMessage from 'client/common/root.i18n';
import messages from './message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessage);
const Panel = Collapse.Panel;
const Option = Select.Option;

function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return inEdit ? <Input value={edit[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  edit: PropTypes.object,
  onChange: PropTypes.func,
};

function ColumnSelect(props) {
  const { inEdit, edit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? foundOpts[0].text : '';
    return <span>{label}</span>;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  edit: PropTypes.object,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

@injectIntl
@connect(
  state => ({
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    exemptions: state.cmsManifest.params.exemptionWays,
    loginId: state.account.loginId,
    billHead: state.cmsManifest.billHead,
  }),
  { updateHeadNetWt }
)
export default class SheetBodyPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    type: PropTypes.oneOf(['bill', 'entry']),
    readonly: PropTypes.bool,
    data: PropTypes.array.isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    billSeqNo: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    exemptions: PropTypes.array,
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    if (!props.readonly) {
      bodies.push({ id: '__ops' });
    }
    this.state = {
      editIndex: -1,
      editBody: {},
      bodies,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: true,
        onChange: this.handlePageChange,
      },
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const bodies = [...nextProps.data];
      if (!nextProps.readonly || this.props.type === 'bill') {
        bodies.push({ id: '__ops' });
      }
      this.setState({
        bodies,
        pagination: { ...this.state.pagination, total: bodies.length },
      });
    }
  }
  getColumns() {
    const { ietype, type, readonly, units, countries, currencies, exemptions } = this.props;
    const { editIndex, bodies, editBody, pagination } = this.state;
    const totalCount = bodies.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      width: 50,
      fixed: 'left',
    }];
    if (type === 'bill') {
      columns.push({
        title: this.msg('copGNo'),
        width: 120,
        render: (o, record, index) =>
          <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
            onChange={this.handleEditChange} edit={editBody}
          />,
      });
    }
    columns.push({
      title: this.msg('emGNo'),
      width: 50,
      render: (o, record, index) =>
        <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('codeT'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="code_t" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('codeS'),
      width: 60,
      render: (o, record, index) =>
        <ColumnInput field="code_s" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record, index) =>
        <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('gModel'),
      render: (o, record, index) =>
        <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('netwt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('grosswt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('element'),
      width: 380,
      render: (o, record, index) =>
        <ColumnInput field="element" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('quantity'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="g_qty" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unit'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: ietype === 'import' ? this.msg('icountry') : this.msg('ecountry'),
      width: 120,
      render: (o, record, index) =>
        <ColumnSelect field="orig_dest_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('decPrice'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('decTotal'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="trade_total" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('currency'),
      width: 60,
      render: (o, record, index) =>
        <ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody}
        />,
    }, {
      title: this.msg('exemptionWay'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="duty_mode" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={exemptions} edit={editBody}
        />,
    }, {
      title: this.msg('opColumn'),
      width: 90,
      fixed: 'right',
      render: (o, record, index) => {
        if (readonly || this.props.type === 'entry') {
          return <span />;
        } else if (index === editIndex) {
          return (
            <span>
              <RowUpdater onHit={this.handleSave} label={this.msg('save')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleCancel} label={this.msg('cancel')} />
            </span>
          );
        } else if (index + 1 + (pagination.current - 1) * pagination.pageSize === totalCount) {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('append')}
                index={index} row={{}}
              />
            </span>
          );
        } else {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('edit')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDel} label={this.msg('delete')}
                row={record} index={index}
              />
            </span>
          );
        }
      },
    });
    return columns;
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleEditChange = (field, value) => {
    this.setState({
      editBody: { ...this.state.editBody, [field]: value },
    });
    // todo onsearch 项号 ems_no
  }
  handleEdit = (row, index) => {
    if (this.props.headNo) {
      this.setState({
        editIndex: index,
        editBody: row,
      });
    } else {
      message.error(this.msg('headUncreated'));
    }
  }
  handleSave = (row, index) => {
    const { editBody, pagination: origPagi } = this.state;
    const recordIdx = index + (origPagi.current - 1) * origPagi.pageSize;
    if (!editBody.wet_wt) {
      return message.error('净重必填');
    }
    // todo validate
    if (!editBody.id) {
      let gNO = 1;
      if (this.state.bodies.length > 1) {
        gNO += this.state.bodies[this.state.bodies.length - 2].g_no;
      }
      const body = { ...editBody, g_no: gNO };
      const { billSeqNo, headNo, loginId } = this.props;
      this.props.onAdd({ billSeqNo, body, headNo, loginId }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          body.id = result.data.id;
          const bodies = [...this.state.bodies];
          bodies.splice(recordIdx, 0, body);
          const pagination = { ...origPagi, total: bodies.length };
          if (bodies.length > pagination.current * pagination.pageSize) {
            pagination.current += 1;
          }
          this.setState({
            editIndex: -1,
            editBody: {},
            bodies,
            pagination,
          });
        }
      });
    } else {
      this.props.onEdit(editBody).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          const bodies = [...this.state.bodies];
          bodies[recordIdx] = editBody;
          this.setState({
            editIndex: -1,
            editBody: {},
            bodies,
          });
        }
      });
    }
  }
  handleDel = (row, index) => {
    this.props.onDel(row.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const bodies = [...this.state.bodies];
        const recordIdx = index + (this.state.pagination.current - 1) * this.state.pagination.pageSize;
        bodies.splice(recordIdx, 1);
        const pagination = { ...this.state.pagination, total: bodies.length };
        if (pagination.current > 1 && (pagination.current - 1) * pagination.pageSize === pagination.total) {
          pagination.current -= 1;
        }
        this.setState({
          bodies,
          pagination,
        });
      }
    });
  }
  handleCancel = () => {
    this.setState({
      editIndex: -1,
      editBody: {},
    });
  }
  handleButtonClick = (ev) => {
    ev.stopPropagation();
  }
  handleExportData = (ev) => {
    ev.stopPropagation();
  }
  handleNetWetSummary = () => {
    const bodyDatas = this.state.bodies;
    let wtSum = 0;
    bodyDatas.forEach((body) => {
      if (body.wet_wt) {
        wtSum += Number(body.wet_wt);
      }
    });
    if (wtSum > 0) {
      this.props.updateHeadNetWt(this.props.billSeqNo, wtSum);
    }
  }
  handleGrossWtDivid = () => {
    const totGrossWt = this.props.billHead.gross_wt;
    const bodyDatas = this.state.bodies;
    let wtSum = 0;
    bodyDatas.forEach((body) => {
      if (body.wet_wt) {
        wtSum += Number(body.wet_wt);
      }
    });
    const datas = [];
    for (let i = 0; i < bodyDatas.length - 1; i++) {
      const body = bodyDatas[i];
      const grosswt = (totGrossWt * body.wet_wt / wtSum).toFixed(3);
      const data = { ...body, gross_wt: grosswt };
      datas.push(data);
      this.props.onEdit(data);
    }
    datas.push({});
    this.setState({ bodies: datas });
  }
  handleMenuClick = (e) => {
    if (e.key === 'division') {
      this.handleGrossWtDivid();
    } else if (e.key === 'summary') {
      this.handleNetWetSummary();
    }
  }
  render() {
    const columns = this.getColumns();
    let billBodyToolbar = null;
    if (this.props.type === 'bill') {
      const menu = (
        <Menu onClick={this.handleMenuClick}>
          {!this.props.readonly &&
          <Menu.Item key="importData">
            <ExcelUpload endpoint={`${API_ROOTS.default}v1/cms/manifest/billbody/import`}
              formData={{
                data: JSON.stringify({
                  bill_seq_no: this.billSeqNo,
                  tenant_id: this.props.tenantId,
                  creater_login_id: this.props.loginId,
                }),
              }} onUploaded={this.handleUploaded}
            >
              <Icon type="file-excel" /> {this.msg('importBody')}
            </ExcelUpload>
          </Menu.Item>
          }
          <Menu.Item key="download"><Icon type="download" /> 下载模板</Menu.Item>
          <Menu.Item key="division"><Icon type="arrows-alt" /> 毛重分摊</Menu.Item>
          <Menu.Item key="summary"><Icon type="shrink" /> 净重汇总</Menu.Item>
        </Menu>);
      billBodyToolbar = (
        <div className="toolbar-right">
          <Button type="ghost" icon="export" onClick={this.handleExportData}>导出数据</Button>
          <span />
          <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} type="primary">
            <Icon type="plus-circle-o" /> {formatGlobalMsg(this.props.intl, 'add')}
          </Dropdown.Button>
        </div>);
    }
    return (
      <Collapse defaultActiveKey={['body']}>
        <Panel header={billBodyToolbar} key="body">
          <Table rowKey="id" columns={columns} dataSource={this.state.bodies}
            size="middle" scroll={{ x: 2600, y: 415 }} pagination={this.state.pagination} bordered
          />
        </Panel>
      </Collapse>);
  }
}
