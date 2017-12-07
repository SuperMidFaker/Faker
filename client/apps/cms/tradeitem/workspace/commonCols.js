import React from 'react';
import { Tooltip, Tag } from 'antd';
import { Fontello } from 'client/components/FontIcon';

export default function makeColumns({ msg, units, tradeCountries, currencies, withRepo, withRepoItem }) {
  const columns = [{
    title: msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 200,
    render: (o, record) => {
      if (record.feedback === 'repeat') {
        return (
          <Tooltip title="与原归类相同">
            <Tag color="orange">{o}</Tag>
          </Tooltip>);
      } else if (record.duplicate === 1) {
        return (
          <Tooltip title="导入货号重复造成冲突">
            <Tag color="red">{o}</Tag>
          </Tooltip>);
      } else if (record.feedback === 'newSrc') {
        return (
          <Tooltip title="原归类信息由主库同步过来">
            <Tag color="green">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: msg('srcProductNo'),
    dataIndex: 'src_product_no',
    width: 200,
  }, {
    title: msg('filterUnclassified'),
    dataIndex: 'classified',
    width: 80,
    render: classified => !classified ? <Fontello type="circle" color="red" /> : '',
  }].concat(withRepo ? [{
    title: msg('repoOwner'),
    dataIndex: 'owner_name',
    width: 300,
  }, {
    title: msg('repoCreator'),
    dataIndex: 'creator_name',
    width: 200,
  }] : []).concat(withRepoItem ? [{
    title: msg('preHscode'),
    dataIndex: 'item_hscode',
    width: 180,
    render: itemhscode => <span>{itemhscode}</span>,
  }, {
    title: msg('preGModel'),
    dataIndex: 'item_g_model',
    width: 300,
    render: pregmodel => <span>{pregmodel}</span>,
  }] : []).concat([{
    title: msg('hscode'),
    dataIndex: 'hscode',
    width: 150,
    render: (hscode) => {
      if (!hscode) {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{hscode}</Tag>
          </Tooltip>
        );
      } else {
        return <span>{hscode}</span>;
      }
    },
  }, {
    title: msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: msg('enName'),
    dataIndex: 'en_name',
    width: 200,
  }, {
    title: msg('gModel'),
    dataIndex: 'g_model',
    width: 400,
  }, {
    title: msg('gUnit1'),
    dataIndex: 'g_unit_1',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('unit1'),
    dataIndex: 'unit_1',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('unit2'),
    dataIndex: 'unit_2',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
    render: (o) => {
      const country = tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }, {
    title: msg('unitNetWt'),
    dataIndex: 'unit_net_wt',
    width: 120,
  }, {
    title: msg('unitPrice'),
    dataIndex: 'unit_price',
    width: 120,
  }, {
    title: msg('currency'),
    dataIndex: 'currency',
    width: 120,
    render: (o) => {
      const currency = currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  /*
  }, {
    title: msg('customsControl'),
    dataIndex: 'customs_control',
    width: 140,
  }, {
    title: msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 140,
  }, {
    title: msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  */
  }, {
    title: msg('remark'),
    dataIndex: 'remark',
    width: 180,
  }]);
  return columns;
}

