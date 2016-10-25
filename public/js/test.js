(function() {

  onmessage = function(event) {
    postMessage({
      input: event.data,
      result: event.data
    });
  };

})();