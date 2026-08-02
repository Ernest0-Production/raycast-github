import { Color } from "@raycast/api";

import { IssueDetailFieldsFragment, IssueFieldsFragment, IssueStateReason } from "../generated/graphql";

import { getGitHubUser } from "./users";

export function getIssueStatus(issue: IssueFieldsFragment | IssueDetailFieldsFragment) {
  if (issue.stateReason === IssueStateReason.NotPlanned) {
    return {
      icon: { source: "skip.svg", tintColor: Color.SecondaryText },
      text: "Closed as not planned",
      color: Color.Purple,
    };
  }

  if (issue.stateReason === IssueStateReason.Completed) {
    return {
      icon: { source: "issue-closed.svg", tintColor: Color.Purple },
      text: "Closed as completed",
      color: Color.Purple,
    };
  }

  if (issue.closed) {
    return {
      icon: { source: "issue-closed.svg", tintColor: Color.Purple },
      text: "Closed",
      color: Color.Purple,
    };
  }

  return {
    icon: { source: "issue-open.svg", tintColor: Color.Green },
    text: "Open",
    color: Color.Green,
  };
}

export function getIssueAuthor(issue: IssueFieldsFragment | IssueDetailFieldsFragment) {
  return getGitHubUser(issue.author);
}

export const ISSUE_SORT_TYPES_TO_QUERIES = [
  { title: "Newest", value: "sort:created-desc" },
  { title: "Oldest", value: "sort:created-asc" },
  { title: "Most Commented", value: "sort:comments-desc" },
  { title: "Least Commented", value: "sort:comments-asc" },
  { title: "Recently Updated", value: "sort:updated-desc" },
  { title: "Least Recently Updated", value: "sort:updated-asc" },
  { title: "Best Match", value: "sort:relevance-desc" },
  { title: "👍", value: "sort:reactions-+1-desc" },
  { title: "👎", value: "sort:reactions--1-desc" },
  { title: "😄", value: "sort:reactions-smile-desc" },
  { title: "🎉", value: "sort:reactions-tada-desc" },
  { title: "🙁", value: "sort:reactions-thinking_face-desc" },
  { title: "❤️", value: "sort:reactions-heart-desc" },
  { title: "🚀", value: "sort:reactions-rocket-desc" },
  { title: "👀", value: "sort:reactions-eyes-desc" },
];

export const ISSUE_DEFAULT_SORT_QUERY = "sort:updated-desc";
