import('./worker-start.js')
  .then(module => {
    postMessage('ready')

    onmessage = event => module.onmessage(event) 
  })
  .catch(e => console.error('Error importing `index.js`:', e));
