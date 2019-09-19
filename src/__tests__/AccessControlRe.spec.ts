import { accessInfos } from './fixtures-re';
import { AccessControlRe } from '../accesscontrol-re';

const acre = new AccessControlRe(accessInfos).build();

describe('AccessControlRe', () => {
  it(`returns all known getResources()`, () => {
    expect(acre.getResources()).toEqual(['comment', 'post', 'openToAllResource'].sort());
  });

  it(`returns all known getRoles()`, () => {
    expect(acre.getRoles()).toEqual(['admin', 'god', 'poweruser', 'user']);
  });

  it(`returns all known getActions() & implicitelly allows custom actions`, () => {
    expect(acre.getActions()).toEqual(
      ['create', 'read', 'update', 'delete', 'like', 'approve', 'look'].sort()
    );
  });

  it(`allows custom actions, since a "user" can "like" ANY "comment"`, () => {
    expect(
      acre.permission({
        role: 'user',
        action: 'like',
        possession: 'any',
        resource: 'comment',
      }).granted
    ).toEqual(true);
  });

  it(`possession in "action:possession" overrides "possession", since "user" can not "delete" ANY "post"`, () => {
    expect(
      acre.permission({
        role: 'user',
        action: 'delete',
        possession: 'any',
        resource: 'post',
      }).granted
    ).toEqual(false);
  });

  it(`'denied: true' in IAccessInfo is respected - user CANNOT approve ANY post`, () => {
    expect(
      acre.permission({
        role: 'user',
        action: 'approve:any',
        resource: 'post',
      }).granted
    ).toEqual(false);
  });

  it(`'denied: false' in IAccessInfo is respected - user CAN approve OWN post`, () => {
    expect(
      acre.permission({
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
              acre.permission({
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
                acre.permission({
                  role: 'poweruser',
                  possession: 'any',
                  resource,
                  action,
                }).granted
              ).toEqual(false);
            });

          it(`poweruser can do ANY *Action (${action}) only to OWN *Resource (${resource}) `, () => {
            expect(
              acre.permission({
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
              acre.permission({
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

  it('doesnt throw error on permission with empty user.roles', async () => {
    expect(
      acre.permission({
        role: [],
        resource: 'openToAllResource',
        action: 'look',
      }).granted
    ).toEqual(false);
  });
});
