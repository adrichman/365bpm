'use strict';

function cors(req, res, next) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "OPTIONS, GET, POST, PUT, DELETE, PATCH");
  res.setHeader("access-control-allow-headers", "Content-Type", "Data-Type");
  res.setHeader("access-control-max-age", 10);

  if (req.method === "OPTIONS") { res.send(204) }
  
  next();
}

module.exports = {
  cors : cors
}
