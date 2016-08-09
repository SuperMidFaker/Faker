import React, { PropTypes } from 'react';
import { Popconfirm } from 'antd';
import { PRESET_TRANSMODES, VEHICLE_TYPES, VEHICLE_LENGTH_TYPES, CONTAINER_PACKAGE_TYPE } from 'common/constants';
export function renderRegion(region) {
  const rgs = [];
  if (region.province) {
    rgs.push(region.province);
  }
  if (region.city && (region.city.indexOf('市') !== 0 && region.city.indexOf('县') !== 0)) {
    rgs.push(region.city);
  }
  if (region.district) {
    rgs.push(region.district);
  }
  if (region.street) {
    rgs.push(region.street);
  }
  return rgs.join('-');
}

export function getRowKey(row) {
  return row._id;
}

export function getEndTableVarColumns(agreement) {
  const columns = [];
  if (agreement.transModeCode === PRESET_TRANSMODES.ftl) {
    for (let i = 0; i < agreement.intervals.length; i++) {
      const vlts = VEHICLE_LENGTH_TYPES.filter(vlt => vlt.value === agreement.intervals[i]);
      const vts = VEHICLE_TYPES.filter(vt => vt.value === agreement.vehicleTypes[i]);
      const title = `${vlts[0].text}/${vts[0].text}`;
      columns.push({ title, index: i });
    }
  } else if (agreement.transModeCode === PRESET_TRANSMODES.ctn) {
    for (let i = 0; i < agreement.intervals.length; i++) {
      const ctn = agreement.intervals[i];
      const cpts = CONTAINER_PACKAGE_TYPE.filter(cpt => cpt.id === ctn);
      columns.push({ title: cpts[0].value, index: i });
    }
  } else {
    let unit;
    if (agreement.meter === 't') {
      unit = '吨';
    } else if (agreement.meter === 'm3') {
      unit = '立方米';
    } else if (agreement.meter === 't*km') {
      unit = '吨';
    } else if (agreement.meter === 'kg') {
      unit = '公斤';
    }
    columns.push({ title: `<${agreement.intervals[0]}${unit}`, index: 0 });
    for (let i = 1; i < agreement.intervals.length; i++) {
      columns.push({
        title: `${agreement.intervals[i - 1]}~${agreement.intervals[i]}${unit}`,
        index: i,
      });
    }
    columns.push({
      title: `>${agreement.intervals[agreement.intervals.length - 1]}${unit}`,
      index: agreement.intervals.length,
    });
  }
  return columns;
}

export function ConfirmDel(props) {
  const { row, text, onConfirm } = props;
  function handleConfirm() {
    onConfirm(row);
  }
  return (
    <Popconfirm title="确认删除?" onConfirm={handleConfirm}>
     <a role="button">{text}</a>
    </Popconfirm>
  );
}

ConfirmDel.propTypes = {
  row: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export function RowClick(props) {
  const { row, text, onHit } = props;
  function handleClick(ev) {
    onHit(row, ev);
  }
  return <a role="button" onClick={handleClick}>{text}</a>;
}

RowClick.propTypes = {
  row: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  onHit: PropTypes.func.isRequired,
};
