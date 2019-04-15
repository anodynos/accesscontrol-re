import { accessInfos } from './fixtures-re';
import { AcccessControlRe } from '../accesscontrol-re';
import { AccessControl } from 'accesscontrol';

const acre = new AcccessControlRe();
acre.addAccessInfo(accessInfos);
const ac: AccessControl = acre.build();

describe('AccessControlRe', () => {
  it(`returns all known getResources()`, () => {
    expect(acre.getResources()).toEqual(['comment', 'post', 'openToAllResource'].sort());
    expect(acre.getResources()).toEqual(ac.getResources().sort());
  });

  it(`returns all known getRoles()`, () => {
    expect(acre.getRoles()).toEqual(['admin', 'god', 'poweruser', 'user']);
    expect(acre.getRoles()).toEqual(ac.getRoles().sort());
  });

  it(`returns all known getActions() & implicitelly allows custom actions`, () => {
    expect(acre.getActions()).toEqual(
      ['create', 'read', 'update', 'delete', 'like', 'approve', 'look'].sort()
    );
  });

  it(`allows custom actions, since a "user" can "like" ANY "comment"`, () => {
    expect(
      ac.permission({
        role: 'user',
        action: 'like',
        possession: 'any',
        resource: 'comment',
      }).granted
    ).toEqual(true);
  });

  it(`possession in "action:possession" overrides "possession", since "user" can not "delete" ANY "post"`, () => {
    expect(
      ac.permission({
        role: 'user',
        action: 'delete',
        possession: 'any',
        resource: 'post',
      }).granted
    ).toEqual(false);
  });

  it(`'denied: true' in IAccessInfo is respected - user CANNOT approve ANY post`, () => {
    expect(
      ac.permission({
        role: 'user',
        action: 'approve:any',
        resource: 'post',
      }).granted
    ).toEqual(false);
  });
  
  it(`'denied: false' in IAccessInfo is respected - user CAN approve OWN post`, () => {
    expect(
      ac.permission({
        role: 'user',
        action: 'approve:own',
        resource: 'post',
      }).granted
    ).toEqual(true);
  });

  describe(`wildcard '*' for Role, Action & Resource`, () => {
    describe(`*Action & *Resource, creating GOD and PowerUsers roles:`, () => {
      for (const action of acre.getActions()) {
        for (const resource of acre.getResources()) {
          it(`GOD can do ANY *Action (${action}) to ANY *Resource (${resource}) `, () => {
            expect(
              ac.permission({
                role: 'god',
                possession: 'any',
                resource,
                action,
              }).granted
            ).toEqual(true);
          });

          if (resource !== 'openToAllResource')
            it(`poweruser can NOT do ANY *Action (${action}) to any *Resource (${resource}) `, () => {
              expect(
                ac.permission({
                  role: 'poweruser',
                  possession: 'any',
                  resource,
                  action,
                }).granted
              ).toEqual(false);
            });

          it(`poweruser can do ANY *Action (${action}) only to OWN *Resource (${resource}) `, () => {
            expect(
              ac.permission({
                role: 'poweruser',
                possession: 'own',
                resource,
                action,
              }).granted
            ).toEqual(true);
          });
        }
      }

      describe(`*Roles create open to all Resources / Actions:`, () => {
        for (const role of acre.getRoles()) {
          it(`Any *Role (${role} can "look" at any "openToAllResource"`, () => {
            expect(
              ac.permission({
                role,
                possession: 'any',
                resource: 'openToAllResource',
                action: 'look',
              }).granted
            ).toEqual(true);
          });
        }
      });
    });
  });
});
