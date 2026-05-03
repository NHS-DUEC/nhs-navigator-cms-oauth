const express = require('express')
const fetch = require('node-fetch')

const app = express()
const PORT = process.env.PORT || 3000
const CLIENT_ID = process.env.OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET
const SCOPES = process.env.SCOPES || 'repo,user'

function callbackUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol
  return `${proto}://${req.hostname}/callback`
}

app.get('/auth', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: callbackUrl(req),
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

app.get('/callback', async (req, res) => {
  const { code } = req.query

  let script
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: callbackUrl(req) }),
    })
    const data = await response.json()

    if (data.access_token) {
      const message = JSON.stringify({ token: data.access_token, provider: 'github' })
      script = `<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:success:${message}', e.origin)
  }
  window.addEventListener('message', receiveMessage, false)
  window.opener.postMessage('authorizing:github', '*')
})()
</script>`
    } else {
      const message = JSON.stringify({ error: data.error || 'unknown_error' })
      script = `<script>window.opener.postMessage('authorization:github:error:${message}', '*');window.close();</script>`
    }
  } catch (err) {
    const message = JSON.stringify({ error: err.message })
    script = `<script>window.opener.postMessage('authorization:github:error:${message}', '*');window.close();</script>`
  }

  res.send(script)
})

app.listen(PORT, () => console.log(`OAuth proxy listening on port ${PORT}`))
