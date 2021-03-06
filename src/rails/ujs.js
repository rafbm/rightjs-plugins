/**
 * Rails 3 UJS support module
 *
 * Copyright (C) 2010-2011 Nikolay Nemshilov
 */
// tries to cancel the event via confirmation
function user_cancels(event, element) {
  var message = element.get('data-confirm');
  if (message && !confirm(message)) {
    event.stop();
    return true;
  }
}

// adds XHR events to the element
function add_xhr_events(element, options) {
  return Object.merge({
    onCreate:   function() { element.fire('ajax:loading',  {xhr: this}); },
    onComplete: function() { element.fire('ajax:complete', {xhr: this}); },
    onSuccess:  function() { element.fire('ajax:success',  {xhr: this}); },
    onFailure:  function() { element.fire('ajax:failure',  {xhr: this}); }
  }, options);
}

// processes link clicks
function try_link_submit(event, link) {
  var url    = link.get('href'),
      method = link.get('data-method'),
      remote = link.get('data-remote');

  if (user_cancels(event, link)) { return; }
  if (method || remote) { event.stop(); }

  if (remote) {
    Xhr.load(url, add_xhr_events(link, {
      method:     method || 'get',
      spinner:    link.get('data-spinner')
    }));

  } else if (method) {
    var param = $$('meta[name=csrf-param]')[0],
        token = $$('meta[name=csrf-token]')[0],
        form  = $E('form', {action: url, method: 'post'});

    param = param && param.get('content');
    token = token && token.get('content');

    if (param && token) {
      form.insert('<input type="hidden" name="'+param+'" value="'+token+'" />');
    }

    form.insert('<input type="hidden" name="_method" value="'+method+'"/>')
      .insertTo(document.body).submit();
  }
}

// global events listeners
$(document).on({
  click: function(event) {
    var link = event.find('a');
    if (link) {
      try_link_submit(event, link);
    }
  },

  submit: function(event) {
    var form = event.target;
    if (form.has('data-remote') && !user_cancels(event, form)) {
      event.stop();
      form.send(add_xhr_events(form, {
        spinner:  form.get('data-spinner') || form.first('.spinner')
      }));
    }
  }
});