(function (window) {
  'use strict';
  var App = window.App || {};
  var $ = window.jQuery;
  var orderMap = [];

  function RemoteDataStore(url) {
    if (!url) {
      throw new Error('No remote URL supplied.');
    }
    this.serverUrl = url;
  }

  RemoteDataStore.prototype.add = function (key, val) {
    // If there is already an order from this email address, delete it, before we add another.
    var myId = $.grep(orderMap, function(obj) {return obj.emailAddress === key;});
    if (myId.length > 0) {
      console.log('Replacing customer order id:' + myId[0].id + ' with new order.');
      // Remove the entry from our backend..
      $.ajax(this.serverUrl + '/' + myId[0].id, {
        type: 'DELETE'
      });
      // Remove the entry from orderMap..
      orderMap = $.grep(orderMap, function(obj) {return obj.emailAddress != key;});
    }

    // Post the new order to our backend, push the response to our orderMap
    $.post(this.serverUrl, val, function (serverResponse) {
      console.log('add().$post id: ' + serverResponse.id); // remove later
      console.log('add().$post email: ' + serverResponse.emailAddress); // remove later
      console.log(serverResponse);
      orderMap.push(serverResponse);
    });
  };

  RemoteDataStore.prototype.getAll = function(cb) {
    $.get(this.serverUrl, function (serverResponse) {
      console.log(serverResponse);
      cb(serverResponse);
    });
  };

  RemoteDataStore.prototype.get = function (key, cb) {
    // We can't use the 'key' (an email address) to query our backend, we need an id.
    var myId = $.grep(orderMap, function(obj) {return obj.emailAddress === key;})[0].id;
    $.get(this.serverUrl + '/' + myId, function (serverResponse) {
      console.log(serverResponse);
      cb(serverResponse);
    });
  };

  RemoteDataStore.prototype.remove = function (key) {
    var myId = $.grep(orderMap, function(obj) {return obj.emailAddress === key;})[0].id;
    // Remove the order from our orderMap.
    orderMap = $.grep(orderMap, function(obj) {return obj.emailAddress != key;});
    console.log(orderMap);
    // Remove the order from our backend.
    $.ajax(this.serverUrl + '/' + myId, {
      type: 'DELETE'
    });
  };

  App.RemoteDataStore = RemoteDataStore;
  window.App = App;
})(window);
