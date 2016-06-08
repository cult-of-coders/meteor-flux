Package.describe({
  name: 'cultofcoders:meteor-flux',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Flux implementation for Meteor',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  'event-emitter': '0.3.4'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use('underscore');

  api.mainModule('module.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('practicalmeteor:mocha');
  api.use('practicalmeteor:chai');
  api.use('cultofcoders:meteor-flux');

  api.mainModule('flux-tests.js');
});
