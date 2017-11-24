import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Table, Row, Col } from 'antd';
import EditableCell from 'client/components/EditableCell';
import { hideAdaptorDetailModal, updateColumnField, updateStartLine } from 'common/reducers/saasLineFileAdaptor';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  adaptor: state.saasLineFileAdaptor.adaptor,
  visible: state.saasLineFileAdaptor.adaptorDetailModal.visible,
}), { hideAdaptorDetailModal, updateColumnField, updateStartLine })

export default class AdaptorDetailModal extends Component {
  state = {
    lineColumns: [],
    lineData: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.adaptor.columns !== nextProps.adaptor.columns) {
      const lineColumns = [{
        dataIndex: 'keyall',
        width: 100,
        fixed: 'left',
      }];
      const lineData = [{
        keyall: '示例1',
      }, {
        keyall: '示例2',
      }, {
        keyall: '导入字段',
      }];
      let scrollX = 100;
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineColumns.push({
          title: `列${index}`,
          dataIndex,
          width: 200,
          render: (value, row) => {
            if (row.editable) {
              return (
                <EditableCell value={value} cellTrigger type="select"
                  options={LINE_FILE_ADAPTOR_MODELS[nextProps.adaptor.biz_model].columns.map(acol => ({ key: acol.field, text: acol.label }))}
                  onSave={field => this.handleFieldMap(col.id, field)}
                />);
            } else {
              return value;
            }
          },
        });
        lineData[0][dataIndex] = col.desc1;
        lineData[1][dataIndex] = col.desc2;
        lineData[2][dataIndex] = col.field;
        lineData[2].editable = true;
        scrollX += 200;
      });
      this.setState({ lineColumns, lineData, scrollX });
    }
  }
  handleEditCancel = () => {
    this.props.hideAdaptorDetailModal();
  }
  handleFieldMap = (columnId, field) => {
    this.props.updateColumnField(columnId, field);
  }
  render() {
    const { visible, adaptor } = this.props;
    const { lineColumns, lineData, scrollX } = this.state;
    return (
      <Modal maskClosable={false} title={adaptor.name} width="100%" wrapClassName="fullscreen-modal"
        footer={null} onCancel={this.handleEditCancel} visible={visible}
      >
        <Row>
          <Col span={5}>
            <FormItem label="起始行" {...formItemLayout}>
              <EditableCell value={adaptor.start_line} style={{ width: 160 }} cellTrigger onSave={value => this.props.updateStartLine(adaptor.code, value)} />
            </FormItem>
          </Col>
        </Row>
        <Table dataSource={lineData} columns={lineColumns}
          scroll={{ x: scrollX, y: 600 }} pagination={false}
        />
      </Modal>
    );
  }
}
