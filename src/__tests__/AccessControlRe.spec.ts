import { accessInfos } from './fixtures-re';
import { addAccessInfo, build, getActions, getResources, getRoles } from '../accesscontrol-re';
import { AccessControl } from 'accesscontrol';

addAccessInfo(accessInfos);
const ac: AccessControl = build();

describe.only('AccessControlRe', () => {
  it(`returns all known getResources()`, () => {
    expect(getResources()).toEqual(['comment', 'post', 'openToAllResource'].sort());
    expect(getResources()).toEqual(ac.getResources().sort());
  });

  it(`returns all known getRoles()`, () => {
    expect(getRoles()).toEqual(['admin', 'god', 'poweruser', 'user']);
    expect(getRoles()).toEqual(ac.getRoles().sort());
  });

  it(`returns all known getActions() & implicitelly allows custom actions`, () => {
    expect(getActions()).toEqual(
      ['create', 'read', 'update', 'delete', 'like', 'approve', 'look'].sort()
    );
  });

  it.skip(``, () => {}); // covered below :-)

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

  it(`admin can delete ANY post`, () => {
    expect(
      ac.permission({
        role: 'admin',
        action: 'delete:any',
        resource: 'comment',
      }).granted
    ).toEqual(true);
  });

  describe(`wildcard '*' for Role, Action & Resource`, () => {
    describe(`*Action & *Resource, creating GOD and PowerUsers roles:`, () => {
      for (const action of getActions()) {
        for (const resource of getResources()) {
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
        for (const role of getRoles()) {
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
