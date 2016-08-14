/* eslint no-param-reassign: 0, require-yield: 0 */
import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import * as path from 'path';
import Result from '../../util/responseResult';

// assets/lang目录限制,故只能放在这个工程下面
function* getIntlMessages() {
  const locale = this.request.query.locale;
  const translations = globSync('./public/assets/langs/*.json')
    .map(filename => [
      path.basename(filename, '.json'),
      readFileSync(filename, 'utf8'),
    ])
    .map(([loc, file]) => [loc, JSON.parse(file)])
    .reduce((collection, [loc, messages]) => {
      collection[loc] = messages;
      return collection;
    }, {});
  const messages = translations[locale];
  return messages ? Result.ok(this, messages) : Result.notFound(this);
}

export default [
   ['get', '/public/v1/intl/messages', getIntlMessages],
];
