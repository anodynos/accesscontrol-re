import { IAccessInfo } from 'accesscontrol';

export const accessInfos: IAccessInfo[] = [
  {
    role: 'user',
    action: 'like:any',
    resource: 'comment',
    attributes: ['*'],
  },
  {
    role: ['user'],
    action: 'delete:own',
    possession: 'any', // overriden by action's possession
    resource: 'post',
  },
  {
    role: ['admin', 'user'], // user will be actually denied below
    action: 'approve',      // possession `any` assumed
    resource: 'post',
    attributes: ['*'],
  },
  {
    role: ['user'],
    action: 'approve',
    resource: 'post',
    attributes: ['*'],
    denied: true // should be respected - // https://github.com/onury/accesscontrol/issues/67
  },
  {
    role: ['user'],
    action: 'approve:own',
    resource: 'post',
    attributes: ['*'],
    denied: false // should be respected - // https://github.com/onury/accesscontrol/issues/67
  },
  {
    role: 'god',
    action: '*:any',
    resource: '*',
  },
  {
    role: 'poweruser',
    action: '*:own', // overrides `possession: 'any'`
    resource: '*',
    possession: 'any',
  },
  {
    role: '*',
    action: 'look:any',
    resource: 'openToAllResource',
  },
];
