# Access Control Re v2.0.0

A facade enhancing the great javascript [Access Control](https://onury.io/accesscontrol), but with much desired missing features!

## Features 

- Allowing custom *Actions*, beyond CRUD (`create`, `read`, `update`, `delete`) actions. You can have actions like `like`, `follow`, `list`, `share`, `approve` and anything your business domain requires. See https://github.com/onury/accesscontrol/issues/46

- Allowing `'*'` for `*Roles`, `*Actions` and `*Resources` on `IAccessInfo` grants, a much needed feature (see https://github.com/onury/accesscontrol/issues/58)!
  
  *It is very powerful, but it can open security holes, so use with caution!*
  
  Using it you can define `'GOD'`-like Roles: 

       
      // "GOD" can do any *Action on any *Resource!
      { 
        role: 'GOD', 
        resource: '*',
        action: '*:any'
      }
      
  This will actually grant GOD to any known *Action* against any known *Resource*.
  
  Another scenario is to allow every `*Role` to access a particular *Resource* and/or *Action*:
  
  
      // Any *Role can "look" any "openToAllResource"
      {
        role: '*',
        resource: 'openToAllResource',
        action: 'look:any',
      }
      
  You can of course use any combination, even `'*'` for *permit all* :-)
  
- In **AccessControl**, `AccessControl.grant` is NOT respecting `denied: true` of that `IAccessInfo` (see https://github.com/onury/accesscontrol/issues/67). **AccessControlRe** instead properly handles it they way someone would expect.     
  
- In **AccessControl**, `accessControl.permission()` throws an Error `AccessControlError: Invalid role(s): []` when empty roles (eg a User with an empty `roles: []`) is passed in that `IQueryInfo`.
 **AccessControlRe** instead silently overcomes it (and returns a `permission.granted === false`). The reasoning is that and empty roles array fo the User is something allowed in the real world (eg a new user without any assigned roles).
   
## How to use

    import { IAccessInfo, Permission } from 'accesscontrol';
    import { AccessControlRe } from '../src';
    
    const accessInfos: IAccessInfo[] = [
      {
        role: 'user',
        resource: 'comment',
        action: 'list:any',
        attributes: ['*', '!secret'],
      },
    ];
    
    const acre = new AccessControlRe();
    acre.addAccessInfo(accessInfos);        // also accepts a single IAccessInfo
    acre.addAccessInfo(accessInfos);        // repeat as many
    acre.build();                           // call `build()` to start querying (only `_.once` per instance)!
    
    // the above can be done fluently in one statement
    const acre2 = new AccessControlRe(accessInfos).build();
    
    // From then on, you use `acre.permission()` - there is no need to use anything else from AccessControl :-)
    // It has the exact signature & usage as `accessControl.permission` (it delegates to it) and also returns a `Permission`

    const userPerm: Permission = acre.permission({
      role: 'user',
      resource: 'comment',
      action: 'list:own',
    });
    
    console.log('USER', userPerm.granted);
    
## Caveats

- Only the `.grant(accessInfo: IAccessInfo)` (implicitly and only through `AccessControlRe::addAccessInfo(accessInfo: IAccessInfo)`) and `AccessControlRe::permission(queryInfo: IQueryInfo)` are supported for now, not the chained fluent methods like `createAny` & `updateOwn` or the `grantsObject` etc of **AccessControl**. The upside of this is that you can do anything without those, and it is actually cleaner and easier to use and follow for DB or bulk creation & querying of permissions than the fluent ones. 

- There is some patching going on, as this is *not a fork* or reworked version of Access Control, just a facade. This is actually a very good point, cause Access Control version 2.x is just in `peerdependencies` so its updates on your local version will be picked up.

- You need to create ALL your grants (i.e add all your `addAccessInfo()`) before you can use it & call `.build()` to retrieve an ActionControl instance with the grants locked. This is due to the way the `'*'` actions & resources actually work: the `'*'` is forcing all known actions / resources / roles to be created. Also you can call `build()` only `_.once`, it has no effect after that (use `require-clean` if you want a fresh instance :-).  

- @todo: `.extend` is disabled by design and is discouraged, for your own sake. Its evil to use while this is open https://github.com/onury/accesscontrol/issues/34#issuecomment-466387586 - when closed I'll happily add it :-) 

- Using `'*'` for *Action*, it grants access to *all known Actions* against the Resource, event if the Resource doesn't support some of these Actions. It shouldn't do any harm :-)

- Order of `addAccessInfo`, matters!

## Public API

### constructor AccessControlRe(accessInfo?: IAccessInfo | IAccessInfo[])

Optionally pass an initial `accessInfo` to add to your instance.

### addAccessInfo(accessInfo: IAccessInfo | IAccessInfo[]): AccessControlRe

Call it as many times as you want (but before calling `.build()`) to add new `accessInfos` to your instance. 

### build(): AccessControlRe

You **have to call it** after you've finished adding ALL your `accessInfos`. After calling `.build()` you can't call `.addAccessInfo()` again on that instance.  

Internally, it creates the tweaked AccessControl instance that you can start query with `.permission()`.   

### permission(queryInfo: IQueryInfo): Permission {

Works like `AccessControl.permission()` - see node_modules/accesscontrol/lib/AccessControl.d.ts

###  getRoles(): string[]

Get all available roles (sorted).
   
### getResources: string[]

Get all available resources (sorted).

### getActions: string[]

Get all available actions (sorted).

## Coming up

- Custom Possessions (beyond `'any'` & `'own'`) - completing https://github.com/onury/accesscontrol/issues/46

- DONE: ~~Role `'*'` wildcard - scenarios like _Any *Role can Visit the Homepage_, eg `role: '*'`~~

- Add some of *Roles*, *Actions*, *Resources* (or *Possessions* in the future), using negate wildcards, eg: `action: ['*', '!drop_entity_table']`. 

- If other goodies and Access Control issues solved via this facade seem important, they will get here!

- DONE: ~~Refactor to a class~~
 
- PRs, with tests + rationale, more than welcome :-)

# Licence

MIT
