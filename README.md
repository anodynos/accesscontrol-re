# Access Control Re

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
  
- Solving various smaller issues and bugs: 
  
  - Not respecting `denied: true` of `IAccessInfo` in `AccessControl.grant` - https://github.com/onury/accesscontrol/issues/67   
   
## How to use

    import { IAccessInfo } from 'accesscontrol';
    import { addAccessInfo, build } from 'accesscontrol-re';
  
    const accessInfos: IAccessInfo[] = [
        {
          role: 'user',
          resource: 'comment',
          action: 'list:any',
          attributes: ['*', '!secret'],
        }, ...
    ]

    addAccessInfo(accessInfos);        // also accepts a single IAccessInfo
    const ac: AccessControl = build(); // @note: can call only `_.once`!
    
    // you should use `ac.permission()` only from now on :-)
    
## Caveats

- Only the `.grant(accessInfo: IAccessInfo)` and `.permission(queryInfo: IQueryInfo)` are supported for now, not the chained fluent methods like `createAny` & `updateOwn` or the `grantsObject` etc. The upside of this is that you can do anything without just those, and they are cleaner and easier to use for DB or bulk creation & querying of permissions than the fluent ones. 
 This problem could be solved with an ES6 Proxy, but I wont even bother :-)

- There is some patching going on, as this is *not a fork* or reworked version of Access Control, just a facade. This is actually a very good point, cause Access Control version 2.x is just in `peerdependencies` so its updates on your local version will be picked up.

- You need to create ALL your grants (i.e add all your `addAccessInfo`) before you can use it & call `.build` to retrieve an ActionControl instance with the grants locked. This is due to the way the `'*'` actions & resources actually work: the `'*'` is forcing all known actions / resources / roles to be created. Also you can call `build()` only `_.once`, it has no effect after that (use `require-clean` if you want a fresh instance :-).  

- @todo: `.extend` is disabled by design and is discouraged, for your own sake. Its evil to use while this is open https://github.com/onury/accesscontrol/issues/34#issuecomment-466387586 - when closed I'll happily add it :-) 

- Using `'*'` for *Action*, it grants access to *all known Actions* against the Resource, event if the Resource doesn't support some of these Actions. It shouldn't do any harm :-)

- Order of `addAccessInfo`, matters!

## Coming up

- Custom Possessions (beyond `'any'` & `'own'`) - completing https://github.com/onury/accesscontrol/issues/46

- DONE: ~~Role `'*'` wildcard - scenarios like _Any *Role can Visit the Homepage_, eg `role: '*'`~~

- Add some of *Roles*, *Actions*, *Resources* (or *Possessions* in the future), using negate wildcards, eg: `action: ['*', '!drop_entity_table']`. 

- If other goodies and Access Control issues solved via this facade seem important, they will get here!

- PRs, with tests + rationale, more than welcome :-)

# Licence

MIT
