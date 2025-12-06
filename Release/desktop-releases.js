;(function () {
  function onContentLoaded(cb) {
    if (document.readyState === 'interactive') {
      cb()
    } else {
      window.addEventListener('DOMContentLoaded', cb)
    }
  }

  function replaceChildren(el, children) {
    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
    children.forEach(child => el.appendChild(child))
  }

  const formatter =
    Intl && Intl.DateTimeFormat
      ? new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

  function createRelease(r) {
    const header = document.createElement('header')
    header.className = 'timeline-decorator d-flex flex-items-center mb-3'

  
    const versionBadgeScreenReaderDescription = document.createElement('span');
    versionBadgeScreenReaderDescription.className = 'sr-only';
    versionBadgeScreenReaderDescription.innerText = 'Version';

    const badge = document.createElement('span')
    badge.className =
      'version-badge d-inline-block bg-purple p-1 rounded-1 mr-2 text-bold'
    badge.innerText = r.version

    const date = document.createElement('span')
    date.className = 'f3-light css-truncate css-truncate-target'
    if (r.pub_date) {
      date.innerText = formatter
        ? formatter.format(new Date(r.pub_date))
        : d.toLocaleDateString()
    }

    const h2 = document.createElement('h2')
    h2.className = 'd-flex'
    h2.appendChild(versionBadgeScreenReaderDescription)
    h2.appendChild(badge)
    h2.appendChild(date)

    header.appendChild(h2)

    const changelog = document.createElement('ul')
    changelog.className = 'list-style-none change-log'

    r.notes
      .filter(isRegularNote)
      .map(createChange)
      .forEach(changeText => changelog.appendChild(changeText))

    const section = document.createElement('section')
    section.className =
      'release-note position-relative container-new py-6 px-3 text-left'

    section.appendChild(header)
    section.appendChild(changelog)

    return section
  }

  function isRegularNote(changeText) {
    return !/^\s*\[\]\s/i.test(changeText)
  }

  function createChange(changeText) {
    var typeMatches = changeText.match(
      /^\[(new|fixed|improved|removed|added|pretext)\]\s((.|\n)*)/i
    )
    const li = document.createElement('li')
    li.className = 'd-flex flex-items-start mb-2'

    if (typeMatches) {
      const [, changeType, changeDescription] = typeMatches

      const changeDescriptionContainer = document.createElement('div')
      changeDescriptionContainer.className = 'change-description'

      if (changeType !== 'Pretext') {
        const badge = document.createElement('div')
        badge.className = `change-badge change-badge-${changeType.toLowerCase()}`
        badge.innerText = changeType

        li.appendChild(badge)
        const baseIssueUrl = 'https://github.com/desktop/desktop/issues/'

        changeDescription
          .split(/(#\d+)/i)
          .map(x => {
            if (x.match(/#\d+/i)) {
              const link = document.createElement('a')
              link.innerText = x
              link.href = `${baseIssueUrl}${x.substring(1)}`
              return link
            } else if (x.match(/^@[a-z0-9][a-z0-9-]+$/i)) {
              const link = document.createElement('a')
              link.innerText = x
              link.href = `${baseUserUrl}${x.substring(1)}`
              return link
            } else {
              return document.createTextNode(x)
            }
          })
          .forEach(x => changeDescriptionContainer.appendChild(x))
      } else {
        changeDescriptionContainer.classList.add('pretext')
        changeDescriptionContainer.innerHTML = marked.parse(changeDescription, {
          // https://marked.js.org/using_advanced  If true, use approved GitHub
          // Flavored Markdown (GFM) specification.
          gfm: true,
          // https://marked.js.org/using_advanced, If true, add <br> on a single
          // line break (copies GitHub behavior on comments, but not on rendered
          // markdown files). Requires gfm be true.
          breaks: true,
        })
      }

      li.appendChild(changeDescriptionContainer)
    } else {
      li.innerText = changeText
    }

    return li
  }

  const locationUrl = new URL(document.location)
  const env = locationUrl.searchParams.get('env')
  const callbackName = '__desktopReleasesCallback'
  const changelogUrl = new URL(
    'https://central.github.com/deployments/desktop/desktop/changelog.json'
  )
  changelogUrl.searchParams.set('callback', callbackName)

  window[callbackName] = function (data) {
    onContentLoaded(function () {
      replaceChildren(
        document.getElementById('release-notes'),
        data.map(createRelease)
      )
    })
  }

  if (['beta', 'test'].includes(env)) {
    changelogUrl.searchParams.set('env', env)
  }

  const changelogScript = document.createElement('script')
  changelogScript.setAttribute('type', 'text/javascript')
  changelogScript.addEventListener('error', function () {
    onContentLoaded(function () {
      const el = document.getElementById('release-notes')
      const h2 = document.createElement('h2')
      h2.innerText = 'An error occurred while fetching release notes.'
      replaceChildren(el, [h2])
    })
  })
  changelogScript.setAttribute('defer', 'defer')
  changelogScript.setAttribute('async', 'async')
  changelogScript.setAttribute('src', changelogUrl)

  document.head.appendChild(changelogScript)
})()
