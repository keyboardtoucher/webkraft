document.addEventListener("DOMContentLoaded", function () {
  // Check for smoothscroll=1 in the page URL hash
  var hash = window.location.hash; // example: #about?smoothscroll=1
  if (hash) {
    var parts = hash.substring(1).split("?");
    var anchor = parts[0];
    var params = new URLSearchParams(parts[1]);
    if (params.get("smoothscroll") === "1") {
      var target = document.getElementById(anchor);
      if (target) {
        // Remove the smoothscroll param from the URL to prevent jump on load
        history.replaceState(null, null, window.location.pathname + "#" + anchor);
        setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth" });
        }, 50); // delay for proper animation
      }
    }
  }
});
