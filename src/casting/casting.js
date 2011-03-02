/**
 * Advanced Elements typecasting feature.
 * Basically it allows you to handle all sorts of css-rules with dom-wrappers
 *
 * USAGE:
 *
 *   Element.Wrappers.add('div#boo.hoo', new Class(Element, {
 *     // here you go
 *   }));
 *
 *   Element.Wrappers.remove('div#boo.hoo');
 *
 *
 * Copyright (C) 2010-2011 Alexey Dubinin <LemmingKing at ya dot ru>
 * Copyright (C) 2010-2011 Nikolay Nemshilov
 */

var id_matchers    = null,
    class_matchers = null,
    Wrappers       = RightJS.Element.Wrappers;

RightJS.$ext(Wrappers, {

  /**
   * Register a new wrapper for given css-rule
   *
   * @param String css-rule
   * @param RightJS.Element subclass
   * @return Element.Wrappers object
   */
  set: function(css_rule, klass) {
    var match = css_rule.match(/^[a-z]+$/i);

    if (match) { // Tag-name
      Wrappers[css_rule.toUpperCase()] = klass;
    } else if ((match = css_rule.match(/^([a-z]*)\#[a-z0-9_\-]+$/i))) {
      if (id_matchers === null) { id_matchers = {}; }
      id_matchers[css_rule] = klass;
    } else if ((match = css_rule.match(/^([a-z]*)\.[a-z0-9_\-]+$/i))) {
      if (class_matchers === null) { class_matchers = {}; }
      class_matchers[css_rule] = klass;
    }

    return klass;
  },

  /**
   * Returns a registered wrapper by a css-rule
   *
   * @param String css_rule
   * @return RightJS.Element or null
   */
  get: function(css_rule) {
    if (css_rule.toUpperCase() in Wrappers) {
      return Wrappers[css_rule.toUpperCase()];
    } else if (id_matchers !== null && css_rule in id_matchers) {
      return id_matchers[css_rule];
    } else if (class_matchers !== null && css_rule in class_matchers) {
      return class_matchers[css_rule];
    } else {
      return null;
    }
  },

  /**
   * Checks if the css-rule is registered
   *
   * @param String css_rule
   * @return Boolean check result
   */
  has: function(css_rule) {
    return Wrappers.get(css_rule) !== null;
  },

  /**
   * Removes the dom-wrapper
   *
   * @param String css-rule or RightJS.Element class
   * @return Element.Wrappers object
   */
  remove: function(css_rule) {
    RightJS([Wrappers, id_matchers || {}, class_matchers || {}]).each(function(object) {
      for (var key in object) {
        if (css_rule === key.toLowerCase() || object[key] === css_rule) {
          delete(object[key]);
        }
      }
    });

    return Wrappers;
  }
});


/**
 * Replacing the original casting method
 * with a new one that supporst all the other types of casting
 *
 * @param HTMLElement raw dom-element
 * @return Function wrapper class or undefined
 */
RightJS.Wrapper.Cast = function(element) {
  var key, tag = element.tagName;

  if (id_matchers !== null && element.id) {
    key = tag.toLowerCase() + '#'+ element.id;
    if (key in id_matchers) {
      return id_matchers[key];
    }

    key = '#'+ element.id;
    if (key in id_matchers) {
      return id_matchers[key];
    }
  }

  if (class_matchers !== null && element.className) {
    var classes = element.className.split(/\s+/), i=0,
        l_tag = tag.toLowerCase();

    for (; i < classes.length; i++) {
      key = l_tag + "." + classes[i];
      if (key in class_matchers) {
        return class_matchers[key];
      }

      key = "." + classes[i];
      if (key in class_matchers) {
        return class_matchers[key];
      }
    }
  }

  if (tag in Wrappers) {
    return Wrappers[tag];
  }

  return undefined;
};
