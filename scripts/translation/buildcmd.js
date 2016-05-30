'use strict';
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const babel = require.resolve('babel/bin/babel');
const babelNode = require.resolve('babel/bin/babel-node');

const babelRunner = spawn(babel, [ 
  '--babelrc', '.i18n.babelrc', 'client', 'common', '-d', 'public/dist/messages'
]);
let gBabelErr = false;
babelRunner.stderr.on(
  'data', err => {
    console.log(String(err));
    gBabelErr = true;
  }
);

babelRunner.on(
  'error', err => {
    if (err !== null) {
      gBabelErr = true;
      console.log(err);
    }
  }
);

babelRunner.on(
  'exit', () => {
    if (gBabelErr) {
      return;
    }
    const babelNodeRunner = spawn(babelNode, [ 'scripts/translation/extract' ]);

    babelNodeRunner.stderr.on(
      'data', err => console.log(String(err))
    );
    babelNodeRunner.on(
      'error', err => {
        if (err !== null) {
          console.log(err);
        }
      }
    );
    babelNodeRunner.on(
      'exit', (code) => {
        if (code === 0) {
          console.log('build i18n finished');
        }
      });
  });
