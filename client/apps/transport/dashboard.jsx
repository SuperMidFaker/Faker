import React, { PropTypes } from 'react';
import { Card, DatePicker } from 'ant-ui';
const RangePicker = DatePicker.RangePicker;
export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object
  }
  onChange = (e) => {
		console.log(e);
  }
  render() {
		const datePicker = (
			<div>
				<RangePicker style={{ width: 200 }} onChange={this.onChange} />
				</div>);
    return (
			<div className="main-content">
				<div className="tenant-form page-body" style={{padding: '10px'}}>
					<Card title="进度看板" extra={datePicker} style={{ width: '100%' }}>
						<p>Card content</p>
					</Card>
				</div>
			</div>
		);
  }
}
