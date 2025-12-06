;(function () {
  const ua =
    navigator.userAgentData && navigator.userAgentData.platform
      ? navigator.userAgentData.platform
      : navigator.userAgent

  document.documentElement.className = /mac(intosh| ?OS)?|iOS|iP(hone|od|ad)/i.test(ua) ? 'mac' : 'windows';

  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData
      .getHighEntropyValues([
        "architecture",
      ])
      .then((ua) => {
        document.documentElement.classList.add(ua.architecture);
      });
  } 

  document.addEventListener('click', function (event) {
    if (
      !event.defaultPrevented &&
      event.target.getAttribute &&
      event.target.getAttribute('data-action') === 'switch-os'
    ) {
      event.preventDefault()
      document.documentElement.className = event.target.getAttribute('data-os')
    }
  })
})()
