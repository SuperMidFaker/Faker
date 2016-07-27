import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';

@injectIntl
@connect(
  state => ({
    previewer: state.cmsDelegation.previewer,
  })
)
export default class ClearanceTrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  render() {
    const { previewer } = this.props;
    const { clearanceTracking } = previewer;
    const columns = [{
      title: '报关单号',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '40%',
    }, {
      title: '处理环节',
      dataIndex: 'process_name',
      key: 'process_name',
      width: '30%',
    }, {
      title: '处理时间',
      dataIndex: 'process_date',
      key: 'process_date',
      width: '30%',
    }];

    const dataSource = [];
    for (let i = 0; i < clearanceTracking.length; i++) {
      if (dataSource.length === 0) {
        dataSource.push({ ...clearanceTracking[i] });
        dataSource[0].children = [{ ...clearanceTracking[i] }];
      } else {
        let flag = false;
        for (let j = 0; j < dataSource.length; j++) {
          if (dataSource[j].entry_id === clearanceTracking[i].entry_id) {
            dataSource[j].children.push({ ...clearanceTracking[i] });
            flag = true;
            break;
          }
        }
        if (flag === false) {
          dataSource.push({ ...clearanceTracking[i] });
          dataSource[dataSource.length - 1].children = [{ ...clearanceTracking[i] }];
        }
      }
    }
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 16 }}>
          <Table columns={columns} dataSource={dataSource} rowKey="id" bordered pagination="false" />
        </Card>
      </div>
    );
  }
}
