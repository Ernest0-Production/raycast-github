import { useCachedPromise } from "@raycast/utils";

import { getGitHubClient } from "../api/githubClient";
import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";

import { useViewer } from "./useViewer";

export function useMyRepositories() {
  const { github } = getGitHubClient();
  const viewer = useViewer();

  const ownerQueries = [
    "user:@me",
    ...(viewer?.organizations?.nodes?.flatMap((org) => (org?.login ? [`org:${org.login}`] : [])) ?? []),
  ];
  const ownerQueryKey = ownerQueries.join(" ");

  return useCachedPromise(
    async (ownerQueryKey) => {
      const results = await Promise.allSettled(
        ownerQueryKey.split(" ").map((ownerQuery: string) =>
          github.searchRepositories({
            query: `${ownerQuery} archived:false sort:updated-desc`,
            numberOfItems: 22,
          }),
        ),
      );

      const repositories = results.flatMap((result) =>
        result.status === "fulfilled" ? (result.value.search.nodes as ExtendedRepositoryFieldsFragment[]) : [],
      );

      return [...new Map(repositories.map((repository) => [repository.id, repository])).values()].sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
    },
    [ownerQueryKey],
  );
}
