import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findModuleByExport,
  Export,
  MenuItem,
  Patch,
  findInTree,
} from '@decky/ui';
import { FC } from 'react';

import t from '../utils/i18n';

/**
 * MENU ACTIONS REGISTRY
 * Using a registry makes it easy to add/remove actions globally.
 */
const COMPLETIONIST_ACTIONS = [
  { id: 'completed', key: 'completionist-mark-completed', labelKey: 'ACTION_MARK_COMPLETED', defaultLabel: 'Mark as Completed' },
  { id: 'full', key: 'completionist-mark-full-completed', labelKey: 'ACTION_MARK_FULLCOMPLETED', defaultLabel: 'Mark as 100% Completed' },
  { id: 'favorite', key: 'completionist-mark-favorite', labelKey: 'ACTION_MARK_FAVORITE', defaultLabel: 'Mark as Favorite' },
  { id: 'todo', key: 'completionist-mark-todo', labelKey: 'ACTION_MARK_TODO', defaultLabel: 'Mark as To-Do' }
];

/**
 * Removes existing items from this plugin using their unique keys.
 */
const handleItemDupes = (items: any[]) => {
  if (!items) return;
  const actionKeys = COMPLETIONIST_ACTIONS.map(a => a.key);
  
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i] && actionKeys.includes(items[i].key)) {
      items.splice(i, 1);
    }
  }
};

/**
 * Splices items into the menu, anchored to the "Properties" item.
 */
const spliceBadgeItems = (children: any[], appid: number) => {
  const propertiesIdx = children.findIndex((item) =>
    findInReactTree(item, (x) => x?.onSelected && x.onSelected.toString().includes('AppProperties'))
  );

  const targetIdx = propertiesIdx !== -1 ? propertiesIdx : children.length;

  const newItems = COMPLETIONIST_ACTIONS.map((action) => (
    <MenuItem
      key={action.key}
      onSelected={async () => {
        console.log(`[completionist] LOG: Action ${action.id} triggered for AppID ${appid}`);
        try {
          // @ts-ignore
          await call("toggle_and_reload", { appid: appid, action: action.id });
        } catch (e) {
          console.error(`[completionist] LOG ERROR: Call failed for action ${action.id}`, e);
        }
      }}
    >
      {t(action.labelKey, action.defaultLabel)}
    </MenuItem>
  ));

  children.splice(targetIdx, 0, ...newItems);
};

/**
 * LANGUAGE-AGNOSTIC VALIDATION
 * Instead of checking for "Gérer", we check for the 'Uninstall' key.
 * If 'Uninstall' is present, we are in the Manage sub-menu and we abort.
 */
const isValidMenu = (items: any[]) => {
  if (!items?.length) return false;

  // 1. Language-independent check: The 'Manage' sub-menu always has 'Uninstall'
  const hasUninstallKey = items.some((x: any) => x?.key === 'Uninstall');
  if (hasUninstallKey) {
    return false; 
  }

  // 2. Identify the main context menu by its essential items
  return !!findInReactTree(items, (x) => 
    x?.props?.onSelected && 
    (x.props.onSelected.toString().includes('launchSource') || 
     x.props.onSelected.toString().includes('AppProperties'))
  );
};

const patchMenuItems = (menuItems: any[], appid: number) => {
  let updatedAppid: number = appid;
  
  const parentOverview = menuItems.find((x: any) => 
    x?._owner?.pendingProps?.overview?.appid && x._owner.pendingProps.overview.appid !== appid
  );
  if (parentOverview) updatedAppid = parentOverview._owner.pendingProps.overview.appid;

  const foundApp = findInTree(menuItems, (x) => x?.app?.appid, { walkable: ['props', 'children'] });
  if (foundApp) updatedAppid = foundApp.app.appid;

  handleItemDupes(menuItems);
  spliceBadgeItems(menuItems, updatedAppid);
};

const contextMenuPatch = (LibraryContextMenu: any) => {
  const patches: { outer?: Patch, inner?: Patch, unpatch: () => void } = { unpatch: () => {} };

  patches.outer = afterPatch(LibraryContextMenu.prototype, 'render', (_: any, component: any) => {
    let appid: number = 0;
    if (component._owner) {
      appid = component._owner.pendingProps.overview.appid;
    } else {
      const foundApp = findInTree(component.props.children, (x) => x?.app?.appid, { walkable: ['props', 'children'] });
      if (foundApp) appid = foundApp.app.appid;
    }

    if (!patches.inner) {
      patches.inner = afterPatch(component, 'type', (_: any, ret: any) => {
        afterPatch(ret.type.prototype, 'render', (_: any, ret2: any) => {
          const menuItems = ret2.props.children[0];
          
          // No longer passing props as we don't need to check text labels
          if (!isValidMenu(menuItems)) return ret2;
          
          patchMenuItems(menuItems, appid);
          return ret2;
        });
        return ret;
      });
    } else {
      const menuItems = component.props.children[0];
      if (isValidMenu(menuItems)) patchMenuItems(menuItems, appid);
    }
    return component;
  });

  patches.unpatch = () => {
    patches.outer?.unpatch();
    patches.inner?.unpatch();
  };
  return patches;
};

export const LibraryContextMenu = fakeRenderComponent(
  Object.values(
    findModuleByExport((e: Export) => e?.toString && e.toString().includes('().LibraryContextMenu'))
  ).find((sibling) => (
    sibling?.toString().includes('createElement') &&
    sibling?.toString().includes('navigator:')
  )) as FC
).type;

export default contextMenuPatch;