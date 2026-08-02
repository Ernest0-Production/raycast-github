import { Action, ActionPanel, Color, Icon, MenuBarExtra } from "@raycast/api";

type SortType = { title: string; value: string | null };

export type SortTypesDataProps = { sortTypesData: SortType[] };

export type SortActionProps = Partial<{
  sortQuery: string | null;
  setSortQuery: (value: string | null) => void;
}>;

type SortActionDataProps = { data: SortType[] } & SortActionProps;

export const SortAction = ({ sortQuery, setSortQuery, data }: SortActionDataProps) =>
  setSortQuery ? (
    <ActionPanel.Submenu title={"Sort By"} icon={Icon.ArrowUp} shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}>
      {data
        .filter(({ value }) => value == null || !value.startsWith("sort:reaction"))
        .map(({ title, value }) => (
          <SortActionItem key={value ?? "null"} {...{ title, value, sortQuery, setSortQuery }} />
        ))}
      {data.some(({ value }) => value && value.startsWith("sort:reaction")) && (
        <ActionPanel.Section title={"Most Reactions"}>
          {data
            .filter(({ value }) => value && value.startsWith("sort:reaction"))
            .map(({ title, value }) => (
              <SortActionItem key={value ?? "null"} {...{ title, value, sortQuery, setSortQuery }} />
            ))}
        </ActionPanel.Section>
      )}
    </ActionPanel.Submenu>
  ) : (
    <></>
  );

const SortActionItem = ({
  title,
  value,
  sortQuery,
  setSortQuery,
}: { title: string; value: string | null } & Required<SortActionProps>) => (
  <Action
    title={title}
    icon={sortQuery === value ? { source: Icon.CheckCircle, tintColor: Color.Green } : Icon.Circle}
    onAction={() => setSortQuery(value)}
  />
);

export const SortMenuBarAction = ({ sortQuery, setSortQuery, data }: SortActionDataProps) =>
  setSortQuery ? (
    <MenuBarExtra.Submenu title="Sort By" icon={Icon.ArrowUp}>
      {data
        .filter(({ value }) => !value.startsWith("sort:reaction"))
        .map(({ title, value }) => (
          <SortMenuBarItem key={value} {...{ title, value, sortQuery, setSortQuery }} />
        ))}
      {data.some(({ value }) => value.startsWith("sort:reaction")) && (
        <MenuBarExtra.Section title="Most Reactions">
          {data
            .filter(({ value }) => value.startsWith("sort:reaction"))
            .map(({ title, value }) => (
              <SortMenuBarItem key={value} {...{ title, value, sortQuery, setSortQuery }} />
            ))}
        </MenuBarExtra.Section>
      )}
    </MenuBarExtra.Submenu>
  ) : (
    <></>
  );

const SortMenuBarItem = ({
  title,
  value,
  sortQuery,
  setSortQuery,
}: { title: string; value: string } & Required<SortActionProps>) => (
  <MenuBarExtra.Item
    title={title}
    icon={sortQuery === value ? { source: Icon.CheckCircle, tintColor: Color.Green } : Icon.Circle}
    onAction={() => setSortQuery(value)}
  />
);
