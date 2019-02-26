import { IAccessInfo } from 'accesscontrol';

export const accessInfos: IAccessInfo[] = [
  {
    role: 'user',
    resource: 'comment',
    action: 'like:any',
    attributes: ['*'],
  },
  {
    role: ['user'],
    resource: 'post',
    possession: 'any', // overriden by action's possession
    action: 'delete:own',
  },
  {
    role: 'admin',
    resource: 'comment',
    possession: 'any',
    action: 'delete',
    attributes: ['*'],
  },
  {
    role: ['admin'],
    resource: 'post',
    action: 'approve', // possession `any` assumed
    attributes: ['*'],
  },
  {
    role: 'god',
    resource: '*',
    action: '*:any',
  },
  {
    role: 'poweruser',
    resource: '*',
    possession: 'any',
    action: '*:own', // overrides `possession: 'any'`
  },
  {
    role: '*',
    resource: 'openToAllResource',
    action: 'look:any',
  },
];
