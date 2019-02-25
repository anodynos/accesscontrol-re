import { IAccessInfo } from 'accesscontrol';

export const accessInfos: IAccessInfo[] = [
  {
    role: 'user',
    resource: 'comment',
    action: 'like:any',
    attributes: ['*'],
  },
  {
    role: 'user',
    resource: 'post',
    action: 'delete:own',
  },
  {
    role: 'admin',
    resource: 'comment',
    action: 'delete',
    possession: 'any',
    attributes: ['*'],
  },
  {
    role: 'admin',
    resource: 'post',
    action: 'approve:any',
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
    action: '*:own',
  },
];
