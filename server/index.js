//////////////////////////
// Begin Elastic APM setup

// Start the agent with the config
const package = require("../package.json");
const apm = require("elastic-apm-node").start({
  disableInstrumentations: ["express"],
  serviceName: `${package.name}-server`,
  serviceVersion: package.version,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  logLevel: "debug",
});
//apm.clearPatches("express");
apm.setFramework({ name: "remix", version: package.dependencies.remix });
// Set up the loader context to do the distributed trace correlation on the client
const { getElasticApmClientConfig } = require("../remix-elastic/server");
function getLoadContext() {
  return {
    elasticApmRumAgentConfig: getElasticApmClientConfig(
      {
        serverUrl: process.env.ELASTIC_APM_SERVER_URL,
        serviceName: `${package.name}-client`,
        serviceVersion: package.version,
      },
      apm
    ),
  };
}

// Patch the agent
const { patchHandler } = require("../remix-elastic/server");
apm.addPatch("@remix-run/server-runtime", patchHandler);

// End Elastic APM setup
////////////////////////

const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

let app = express();
app.use(compression());

// You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

// Remix fingerprints its assets so we can cache forever
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));
app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require("./build"), getLoadContext })
    : (req, res, next) => {
        purgeRequireCache();
        let build = require("./build");
        return createRequestHandler({ build, getLoadContext, mode: MODE })(
          req,
          res,
          next
        );
      }
);

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (let key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
