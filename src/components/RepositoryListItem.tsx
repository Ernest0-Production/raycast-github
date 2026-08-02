import { Color, List } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { formatDistanceToNow } from "date-fns";

import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";
import { brightenLanguageColor, getLanguageIcon } from "../helpers/language";
import { getGitHubUser } from "../helpers/users";

import RepositoryActions from "./RepositoryActions";
import { SortActionProps, SortTypesDataProps } from "./SortAction";

type RepositoryListItemProps<T = ExtendedRepositoryFieldsFragment[] | undefined> = {
  repository: ExtendedRepositoryFieldsFragment;
  onVisit: (repository: ExtendedRepositoryFieldsFragment) => void;
  onUpdate?: (repository: ExtendedRepositoryFieldsFragment) => void;
  onRemove?: (repository: ExtendedRepositoryFieldsFragment) => void;
  mutateList: MutatePromise<T>;
} & SortActionProps &
  SortTypesDataProps;

export default function RepositoryListItem<T = ExtendedRepositoryFieldsFragment[] | undefined>({
  repository,
  mutateList,
  onVisit,
  onUpdate,
  onRemove,
  sortQuery,
  setSortQuery,
  sortTypesData,
}: RepositoryListItemProps<T>) {
  const owner = getGitHubUser(repository.owner);
  const numberOfStars = repository.stargazerCount;
  const updatedAt = repository.pushedAt
    ? new Date(repository.pushedAt)
    : repository.updatedAt
      ? new Date(repository.updatedAt)
      : undefined;

  const accessories: List.Item.Accessory[] = updatedAt
    ? [
        {
          date: updatedAt,
          tooltip: `Updated ${formatDistanceToNow(updatedAt, { addSuffix: true })}`,
        },
      ]
    : [];

  if (repository.isArchived) {
    accessories.unshift({
      tag: { value: "Archived", color: Color.Orange },
      tooltip: "This repository is archived",
    });
  }

  if (repository.isFork) {
    accessories.unshift({
      tag: { value: "Fork", color: Color.Purple },
      icon: { source: "fork.svg", tintColor: Color.Purple },
      tooltip: "This repository is a fork",
    });
  }

  if (repository.primaryLanguage) {
    const { name, color } = repository.primaryLanguage;
    const vividColor = brightenLanguageColor(color) ?? Color.SecondaryText;
    accessories.unshift({
      tag: { value: name, color: vividColor },
      icon: getLanguageIcon(name, color),
      tooltip: `Language: ${name}`,
    });
  }

  if (repository.viewerHasStarred) {
    accessories.unshift({
      icon: { source: "star-filled.svg", tintColor: Color.Yellow },
      tooltip: "You have starred this repository",
    });
  }

  return (
    <List.Item
      icon={owner.icon}
      title={repository.nameWithOwner}
      {...(numberOfStars > 0
        ? {
            subtitle: {
              value: `☆ ${numberOfStars}`,
              tooltip: `Number of Stars: ${numberOfStars}`,
            },
          }
        : {})}
      accessories={accessories}
      actions={
        <RepositoryActions
          {...{ repository, onVisit, onUpdate, onRemove, mutateList, sortQuery, setSortQuery, sortTypesData }}
        />
      }
    />
  );
}
