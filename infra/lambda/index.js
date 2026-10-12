"use strict";

exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      ok: true,
      ambiente: process.env.AMBIENTE ?? "desconhecido",
      servico: "api",
    }),
  };
};
