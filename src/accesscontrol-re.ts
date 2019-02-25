import * as _ from 'lodash';
import * as _f from 'lodash/fp';
import { AccessControl, IAccessInfo } from 'accesscontrol';

// @todo: export class AccessControlRe {}
const accessInfos: IAccessInfo[] = [];

export const addAccessInfo = (accessInfo: IAccessInfo | IAccessInfo[]): void => {
  if (!accessInfo || !_.isObject(accessInfo))
    throw new Error(`Invalid accessInfo:\n${JSON.stringify(accessInfo)}`);
  _.isArray(accessInfo) ? accessInfos.push(...accessInfo) : accessInfos.push(accessInfo);
};

export const build = _.once(
  (): AccessControl => {
    const actions = getActions();
    const resources = getResources();

    addCustomActions(actions); // allow custom actions (patching AccessControl)

    const ac: AccessControl = new AccessControl();
    for (const ai of accessInfos) {
      const [action, possession] = ai.action.split(':');

      // grant all known actions / resources with * wildcards ?
      const actionsToGrant = action === '*' ? actions : [action];
      const resourcesToGrant = ai.resource === '*' ? resources : [ai.resource];

      for (const actionToGrant of actionsToGrant) {
        for (const resourceToGrant of resourcesToGrant) {
          const accessInfo: IAccessInfo = {
            possession,
            ...ai,
            action: actionToGrant,
            resource: resourceToGrant,
          };

          ac.grant(accessInfo);
        }
      }
    }

    return ac.lock();
  }
);

/*
Issue: Dynamic Actions and Possession Groups https://github.com/onury/accesscontrol/issues/46
       where any non-CRUD action throws an `AccessControlError: Invalid action: list` eg when action = 'list:any'

Note: accesscontrol/lib/enums = {
  Action:
   { CREATE: 'create',
     READ: 'read',
     UPDATE: 'update',
     DELETE: 'delete',
     LIST: 'list' }, // <== add custom actions here
  Possession: { OWN: 'own', ANY: 'any' },
  actions: [ 'create', 'read', 'update', 'delete'], // <== add custom actions here also
  possessions: [ 'own', 'any' ] }
*/
import { Action, actions, Possession, possessions } from 'accesscontrol/lib/enums';
const crudActions = [...actions];
export const addCustomActions = (customActions: string[]) => {
  _.each(_.uniq(customActions), customAction => {
    Action[customAction.toUpperCase()] = customAction.toLowerCase();
    actions.push(customAction.toLowerCase());
  });
};

// Some helpers

/**
 * Get all available roles
 */
export const getRoles = (): string[] => {
  return cleanStarEtc(_.map(accessInfos, ai => ai.role));
};

/**
 * Get all available resources
 */
export const getResources = (): string[] => {
  return cleanStarEtc(_.map(accessInfos, ai => ai.resource));
};

/**
 * Get all available actions
 */
export const getActions = (): string[] => {
  return cleanStarEtc(
    _.reduce(
      accessInfos,
      (actions, accessInfo) => {
        const [action] = accessInfo.action.split(':');
        if (action !== '*') actions.push(action);
        return actions;
      },
      []
    ).concat(crudActions)
  );
};

// utils
export const cleanStarEtc = _.flow(
  _f.remove(_f.isEqual('*')),
  _f.uniq,
  _f.sortBy(_f.identity)
);
