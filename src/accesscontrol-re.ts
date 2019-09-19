import * as _ from 'lodash';
import * as _f from 'lodash/fp';
import { AccessControl, IAccessInfo, IQueryInfo, Permission } from 'accesscontrol';

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

// note: patched actions of AC remain, irrespective of added AC-re instances
const addCustomActions = (customActions: string[]) => {
  _.each(_.uniq(customActions), customAction => {
    customAction = customAction.toLowerCase();
    Action[customAction.toUpperCase()] = customAction;

    if (!actions.includes(customAction)) actions.push(customAction);
  });
};

export class AccessControlRe {
  private accessInfos: IAccessInfo[] = [];
  private _accessControl: AccessControl = new AccessControl();

  public addAccessInfo = (accessInfo: IAccessInfo | IAccessInfo[]): AccessControlRe => {
    if (!accessInfo || !_.isObject(accessInfo))
      throw new Error(`Invalid accessInfo:\n${JSON.stringify(accessInfo)}`);

    _.isArray(accessInfo)
      ? this.accessInfos.push(...accessInfo)
      : this.accessInfos.push(accessInfo);

    return this;
  };

  public build = _.once(
    (): AccessControlRe => {
      const actions = this.getActions();
      const resources = this.getResources();
      const roles = this.getRoles();

      // allow custom actions (i.e patch AccessControl) - see note in method
      addCustomActions(actions);

      for (const ai of this.accessInfos) {
        const [action, actionPossession] = ai.action.split(':');
        // arrayize ai.role
        ai.role = _.isArray(ai.role) ? ai.role : [ai.role];

        // grant all known actions / resources / roles with * wildcards ?
        const actionsToGrant = action === '*' ? actions : [action];
        const resourcesToGrant = ai.resource === '*' ? resources : [ai.resource];
        const rolesToGrant = ai.role.includes('*') ? roles : ai.role;

        for (const actionToGrant of actionsToGrant) {
          for (const resourceToGrant of resourcesToGrant) {
            const accessInfo: IAccessInfo = {
              ...ai,
              possession: actionPossession || ai.possession || 'any',
              action: actionToGrant,
              resource: resourceToGrant,
              role: rolesToGrant,
            };

            accessInfo.denied
              ? this._accessControl.deny(accessInfo)
              : this._accessControl.grant(accessInfo);
          }
        }
      }

      this._accessControl.lock();

      return this;
    }
  );

  // Instead of calling `accessControl.permission()` we force use to delegate it to us.
  // This allows us to do things like solving the empty roles throwing of AccessControl
  // @see node_modules/accesscontrol/lib/AccessControl.d.ts
  public permission(queryInfo: IQueryInfo): Permission {
    return this._accessControl.permission(queryInfo);
  }

  // Some helpers

  /**
   * Get all available roles
   */
  public getRoles = (): string[] => {
    return cleanStarEtc(_.map(this.accessInfos, ai => ai.role));
  };

  /**
   * Get all available resources
   */
  public getResources = (): string[] => {
    return cleanStarEtc(_.map(this.accessInfos, ai => ai.resource));
  };

  /**
   * Get all available actions
   */
  public getActions = (): string[] => {
    return cleanStarEtc(
      _.reduce(
        this.accessInfos,
        (actions, accessInfo) => {
          const [action] = accessInfo.action.split(':');
          if (action !== '*') actions.push(action);
          return actions;
        },
        []
      ).concat(crudActions)
    );
  };
}

// utils
export const cleanStarEtc = _.flow(
  _f.flatten,
  _f.remove(_f.isEqual('*')),
  _f.uniq,
  _f.sortBy(_f.identity)
);
