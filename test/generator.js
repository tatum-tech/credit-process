'use strict';
const Promisie = require('promisie');

const ML = {
  mlGenerator: function (options) { return Promisie.resolve(function () { }) },
};

const DI = {
  diGenerator: function (options) { return Promisie.resolve(function () { }) },
};

module.exports = {
  DI,
  ML,
};