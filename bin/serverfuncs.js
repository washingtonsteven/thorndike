const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val; //named pipe
  }

  if (port >= 0) {
    return port; //port num
  }

  return false;
}

const onError = (error, port) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privs`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const onListening = (server, debug = console.debug) => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

exports.normalizePort = normalizePort;
exports.onError = onError;
exports.onListening = onListening;