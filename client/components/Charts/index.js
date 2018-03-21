import numeral from 'numeral';
import Bar from './Bar';
import Pie from './Pie';
import MiniArea from './MiniArea';
import MiniBar from './MiniBar';
import MiniProgress from './MiniProgress';
import Field from './Field';

const yuan = val => `&yen; ${numeral(val).format('0,0')}`;
const usd = val => `$ ${numeral(val).format('0,0')}`;

export default {
  yuan,
  usd,
  Bar,
  Pie,
  MiniBar,
  MiniArea,
  MiniProgress,
  Field,
};
