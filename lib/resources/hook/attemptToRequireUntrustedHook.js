var config = require('../../../config');

var fs = require("fs");

module['exports'] = function attemptToRequireUntrustedHook (opts, callback) {

  var username = opts.username || opts.req.hook.owner,
      userHome = __dirname + '/../../../temp/' +  username + "/" + opts.req.hook.name + "/",
      script = opts.script;

  var untrustedHook;
  var isStreamingHook;
  var untrustedTemplate;
  var err = null;
  // At this stage, the hook source code is untrusted ( and should be validated )
  try {
    var _script = require.resolve(userHome + script + '.js');
    delete require.cache[_script];
    untrustedHook = require(_script);
    opts.req.hook = opts.req.hook || {};
    untrustedHook.schema = untrustedHook.schema || {};
    if (opts.req.hook.themeOverride === true) {
      untrustedHook.theme = opts.req.hook.theme || opts.req.hook.view || config.defaultTheme;
      untrustedHook.presenter =  opts.req.hook.presenter || config.defaultPresenter;
    } else {
      untrustedHook.theme = untrustedHook.theme || untrustedHook.view || opts.req.hook.theme || config.defaultTheme;
      untrustedHook.presenter =  untrustedHook.presenter || opts.req.hook.presenter || config.defaultPresenter;
    }
  } catch (e) {
    err = e;
  }

  if (err) {
    return fs.readFile(userHome + script + '.js', function (_err, _source){
      if (_err) {
        return callback(_err);
      }
      // unable to require Hook as commonjs module,
      // the Hook is invalid
      return callback(err, _source);
    });
  }
  return callback(null, untrustedHook)
};
