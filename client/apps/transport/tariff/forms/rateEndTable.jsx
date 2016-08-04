import React, { PropTypes } from 'react';
import update from 'react/lib/update';
import { connect } from 'react-redux';
import { Form, Modal, Input, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import RegionCascader from 'client/components/region-cascade';
import { getEndTableVarColumns, renderRegion, RowClick } from './commodity';
import { submitRateEnd, updateRateEnd, delRateEnd, loadRateEnds } from 'common/reducers/transportTariff';
import { PRESET_TRANSMODES } from 'common/constants';

const FormItem = Form.Item;
@connect(
  state => ({
    rateId: state.transportTariff.rateId,
    loading: state.transportTariff.ratesEndLoading,
    ratesEndList: state.transportTariff.ratesEndList,
    agreementRef: state.transportTariff.ratesRefAgreement,
  }),
  { submitRateEnd, updateRateEnd, delRateEnd, loadRateEnds }
)
@Form.create()
export default class RateEndTable extends React.Component {
  static propTypes = {
    visibleModal: PropTypes.bool.isRequired,
    rateId: PropTypes.string.isRequired,
    ratesEndList: PropTypes.object.isRequired,
    agreementRef: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    onChangeVisible: PropTypes.func.isRequired,
    submitRateEnd: PropTypes.func.isRequired,
    updateRateEnd: PropTypes.func.isRequired,
    delRateEnd: PropTypes.func.isRequired,
    loadRateEnds: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    editEnd: { _id: null, gradients: [] },
    editRegionCode: '',
    editRegion: [],
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadRateEnds(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        rateId: this.props.rateId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        filters: this.props.filters,
      };
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.tarifflist,
  })
  columns = [{
    title: '目的地',
    dataIndex: 'end',
    width: 200,
    render: (o, record) => renderRegion(record.end),
  }, {
    title: '运输时间',
    dataIndex: 'time',
    width: 100,
  }]
  loadEnds = (current) => {
    return this.props.loadRateEnds({
      rateId: this.props.rateId,
      pageSize: this.props.ratesEndList.pageSize,
      current: current || this.props.ratesEndList.current,
      filters: this.props.filters,
    });
  }
  handleRegionChange = (region) => {
    const [code, province, city, district, street] = region;
    this.setState({
      editRegionCode: code,
      editRegion: [province, city, district, street],
    });
  }
  handleGradientChange = (idx, value) => {
    const state = update(this.state, { editEnd: {
      gradients: { [idx]: { $set: value } } },
    });
    this.setState(state);
  }
  handleSave = () => {
    if (this.state.editRegionCode) {
      this.props.form.validateFields(errors => {
        if (errors) {
          message.error('表单错误');
        } else {
          let prom;
          const formValues = this.props.form.getFieldsValue();
          if (this.state.editEnd._id) {
            prom = this.props.updateRateEnd({
              id: this.state.editEnd._id,
              regionCode: this.state.editRegionCode,
              region: this.state.editRegion,
              km: formValues.km,
              time: formValues.time,
              flare: formValues.flare,
              gradients: this.state.editEnd.gradients,
            });
          } else {
            prom = this.props.submitRateEnd({
              rateId: this.props.rateId,
              regionCode: this.state.editRegionCode,
              region: this.state.editRegion,
              km: formValues.km,
              time: formValues.time,
              flare: formValues.flare,
              gradients: this.state.editEnd.gradients,
            });
          }
          prom.then(result => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              message.success('保存成功');
              this.loadEnds().then(leres => {
                if (leres.error) {
                  message.error(result.error.message);
                }
              });
            }
          });
        }
      });
    } else {
      message.error('目的地未选择');
    }
  }
  handleCancel = () => {
    this.props.onChangeVisible('end', false);
    this.setState({
      editEnd: { gradients: [] },
      editRegionCode: '',
      editRegion: [],
    });
  }
  render() {
    const { ratesEndList, loading, visibleModal, form,
      form: { getFieldProps }, agreementRef } = this.props;
    const { editEnd, editRegion } = this.state;
    this.dataSource.remotes = ratesEndList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [...this.columns];
    let totalWidth = 430;
    if (agreementRef.transModeCode === PRESET_TRANSMODES.ltl) {
      if (agreementRef.meter === 't*km') {
        columns.push({
          title: '公里数',
          dataIndex: 'km',
          width: 80,
        });
        totalWidth += 80;
      }
      columns.push({
        title: '起步价',
        dataIndex: 'flare',
        width: 100,
      });
      totalWidth += 100;
    }
    const varColumns = getEndTableVarColumns(agreementRef);
    varColumns.forEach(vc => {
      columns.push({
        title: vc.title,
        width: 100,
        render: (o, record) => record.gradients[vc.index],
      });
      totalWidth += 100;
    });
    columns.push({
      title: '操作',
      width: 130,
      render: (o, record) => {
        return (
          <span>
            <RowClick text="编辑" onHit={this.handleEdit} row={record} />
            <span className="ant-divider" />
            <RowClick text="删除" onHit={this.handleDel} row={record} />
          </span>);
      },
    });
    return (
      <div>
        <Table rowSelection={rowSelection} columns={columns} loading={loading}
          dataSource={this.dataSource} scroll={{ x: totalWidth + 100 }}
        />
        <Modal visible={visibleModal} onOk={this.handleSave} onCancel={this.handleCancel}>
          <Form horizontal form={form}>
            <FormItem label="目的地" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              <RegionCascader region={editRegion} onChange={this.handleRegionChange} />
            </FormItem>
            <FormItem label="运输时间" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
              <Input {...getFieldProps('time', {
                initialValue: editEnd.time,
                rules: [{ required: true, type: 'number',
                  message: '运输时间必填', transform: v => Number(v) }],
              })
              } />
            </FormItem>
            {
              agreementRef.meter === 't*km' &&
              <FormItem label="公里数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                <Input {...getFieldProps('km', {
                  initialValue: editEnd.km,
                  rules: [{ required: true, type: 'number',
                    message: '公里数必填', transform: v => Number(v) }],
                })
                } />
              </FormItem>
            }
            {
              agreementRef.transModeCode === PRESET_TRANSMODES.ltl &&
              <FormItem label="起步价" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                <Input {...getFieldProps('flare', {
                  initialValue: editEnd.flare,
                  rules: [{ required: true, type: 'number',
                    message: '起步价必填', transform: v => Number(v) }],
                })
                } />
              </FormItem>
            }
            {
              varColumns.map((vc, idx) => (
                <FormItem key={vc.title} label={vc.title} labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                <Input {...getFieldProps(`gradient${idx}`, {
                  initialValue: editEnd.gradients[vc.index],
                  onChange: (ev) => this.handleGradientChange(idx, ev.target.value),
                  rules: [{ required: true, message: '梯度费率必填',
                    type: 'number', transform: v => Number(v) }],
                })} />
                </FormItem>
              ))
            }
          </Form>
        </Modal>
      </div>
    );
  }
}
