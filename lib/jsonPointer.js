/**
 * @author Alexey Kuzmin <alex.s.kuzmin@gmail.com>
 * @fileoverview JavaScript implementation of JSON Pointer.
 * @see http://tools.ietf.org/html/rfc6901
 */



;(function() {
  'use strict';

  /**
   * List of special characters and their escape sequences.
   * Special characters will be unescaped in order they are listed.
   * Section 3 of spec.
   * @type {Array.<Array.<string>>}
   * @const
   */
  var SPECIAL_CHARACTERS = [
    ['/', '~1'],
    ['~', '~0']
  ];


  /**
   * Tokens' separator in JSON pointer string.
   * Section 3 of spec.
   * @type {string}
   * @const
   */
  var TOKENS_SEPARATOR = '/';


  /**
   * Returns |target| object's value pointed by |pointer|.
   * If |pointer| is not provided returns curried function bound to |target|.
   * @param {!string} target JSON document.
   * @param {string=} pointer JSON Pointer string. Optional.
   * @return {(*|Function)} Some value or function.
   */
  function getPointedValue(target, pointer) {
    target = JSON.parse(target);

    var tokenIsValid = isValidJSONPointer(pointer);
    if (!tokenIsValid) {
      throw new Error('JSON Pointer is not valid.');
    }

    var tokensList = parsePointer(pointer);
    var token;
    var value = target;

    while ( 'undefined' !== typeof (token = tokensList.pop()) ) {
      value = getValue(value, token);
    }

    return value;
  }


  /**
   * Returns true if given |pointer| is valid, returns false otherwise.
   * @param {string} pointer
   * @returns {boolean} Whether pointer is valid.
   */
  function isValidJSONPointer(pointer) {
    // TODO (alexeykuzmin): Check |pointer|.
    return true;
  }


  /**
   * Returns tokens list for given |pointer|. List is reversed, e.g.
   *     '/simple/path' -> ['path', 'simple']
   * @param {!string} pointer JSON pointer string.
   * @returns {Array} List of tokens.
   */
  function parsePointer(pointer) {
    var tokens = pointer.split(TOKENS_SEPARATOR).reverse();
    tokens.pop();  // Last item is always an empty string in any valid pointer.
    return tokens;
  }


  /**
   * Decodes all escape sequences in given |rawReferenceToken|.
   * @param {!string} rawReferenceToken
   * @returns {string} Unescaped reference token.
   */
  function unescapeReferenceToken(rawReferenceToken) {
    var referenceToken = rawReferenceToken;
    var character;
    var escapeSequence;
    var replaceRegExp;

    SPECIAL_CHARACTERS.forEach(function(pair) {
      character = pair[0];
      escapeSequence = pair[1];
      replaceRegExp = new RegExp(escapeSequence, 'g');
      referenceToken = referenceToken.replace(replaceRegExp, character);
    });

    return referenceToken;
  }


  /**
   * Returns value pointed by |token| in evaluation |context|.
   * Throws an exception if any error occurs.
   * @param {*} context Current evaluation context.
   * @param {!string} token Unescaped reference token.
   * @returns {*} Some value.
   */
  function getValue(context, token) {
    // Section 4 of spec.

    token = unescapeReferenceToken(token);

    if (isArray(context)) {
      if ('-' === token) {
        throw new Error('Implementation does not support "-" token.');
      }
      if (!isNumber(token)) {
        throw new Error('Non-number tokens cannot be used in array context.');
      }
      return context[token];
    }

    if (isObject(context)) {
      return context[token];
    }

    throw new Error(
        'Unexpected context for evaluation: ' + JSON.stringify(context) + '.');
  }


  function isObject(o) {
    return 'object' === typeof o && null !== o;
  }


  function isArray(a) {
    return Array.isArray(a);
  }


  function isNumber(n) {
    return !isNaN(Number(n));
  }


  // Expose API

  var jsonPointer = {
    get: getPointedValue
  };

  if ('object' === typeof exports) {
    // Node.js
    module.exports = jsonPointer;
  } else if ('function' === typeof define && define.amd) {
    // AMD
    define(function() {
      return jsonPointer;
    });
  } else {
    // Browser
    this.jsonPointer = jsonPointer;
  }

}).call((function() {
  'use strict';
  return this || (typeof window !== 'undefined' ? window : global);
})());