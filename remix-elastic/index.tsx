import { useLoaderData } from "remix";
import { init as initApm } from "@elastic/apm-rum";
import type { AgentConfigOptions } from "@elastic/apm-rum";

/**
 * Initializes the Elastic APM agent.
 *
 * Gets its configuration data from the loader. This assumes a valid
 * elasticApmConfig object is passed to getLoadData() in
 */
export function ElasticApm() {
  //   console.log({ loaderData: useLoaderData() });
  const { elasticApmRumAgentConfig } =
    useLoaderData<{ elasticApmRumAgentConfig: AgentConfigOptions }>();
  initApm(elasticApmRumAgentConfig);

  return null;
}
