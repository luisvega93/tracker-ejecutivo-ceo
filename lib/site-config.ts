export const siteOrigin = "https://luisvega93.github.io";
export const siteRepoName = "tracker-ejecutivo-ceo";
export const siteName = "Tracker Ejecutivo";
export const trackerStorageKey = "tracker_ejecutivo_coo_tasks_v1";
export const trackerViewStorageKey = "tracker_ejecutivo_view_v1";
export const trackerCooAccessStorageKey = "tracker_ejecutivo_coo_access_v1";
export const trackerCooPasswordHash =
  "38cfd5070d21febee016f0660941eb1ba69cec106b9f00ff7678cbf39392aad9";

export const deployTarget =
  process.env.NEXT_PUBLIC_DEPLOY_TARGET === "github-pages"
    ? "github-pages"
    : "application";

export const isGithubPagesBuild = deployTarget === "github-pages";
export const siteBasePath = isGithubPagesBuild ? `/${siteRepoName}` : "";

export function buildSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const sitePath =
    normalizedPath === "/" ? siteBasePath || "/" : `${siteBasePath}${normalizedPath}`;

  return new URL(sitePath, siteOrigin).toString();
}
