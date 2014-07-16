'use strict';

function cors(req, res, next) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type accept");
  res.setHeader("access-control-max-age", 10);

  if (req.method === "OPTIONS") { res.send(204) }
  
  next();
}

module.exports = {
  cors : cors
}
