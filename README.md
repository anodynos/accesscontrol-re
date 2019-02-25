# Access Control Re

A facade enhancing the great (Access Control)[https://onury.io/accesscontrol], but with much desired missing features!

## Features 

- Allowing custom *Actions*, beyond CRUD (`create`, `read`, `update`, `delete`) actions. You can have actions like `like`, `follow`, `list`, `share`, `approve` and anything your business domain requires. See https://github.com/onury/accesscontrol/issues/46

- Allowing `'*'` for `*Actions` and `*Resources` on grants, eg: 
   
      // GOD can do any *Action on any *Resource!
      { 
        role: 'GOD', 
        resource: '*',
        grant: {
          '*:any': ['*'],
        },
      }
      
  This will actually allow any known *Action* against any known *Resource*, so use with caution! 
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

    addAccessInfo(accessInfos);    
    const ac: AccessControl = build(); // @note: can call only `_.once`!
    
    // you should use `ac.permission()` only from now on :-)
    
## Caveats

- Only the `.grant(accessInfo: IAccessInfo)` and `.permission(queryInfo: IQueryInfo)` are supported, not the chained fluent methods like `createAny` & `updateOwn`. The upside of this is that you can do anything without those, and they are cleaner and easier to use for DB or bulk creation & querying of permissions than the fluent ones. 
 This problem could be solved with the new JavaScript Proxy, but I wont even bother :-)

- There is some patching going on, as this is not a fork or reworked version of Access Control, just a facade. This is actually a very good point, cause Access Control version 2.x is just in `peerdependencies` so its updates on your local version will be picked up.

- You need to create ALL your grants before you can use it & call `.build` to retrieve an ActionControl instance with the grants locked. This is due to the way the `'*'` actions & resources actually work: the `'*'` is forcing all known actions / resources to be created. Also you can call `build()` only `_.once`, it has no effect after that (use `require-clean` if you want a fresh instance :-).  

- @todo: `.extend` is disabled by design and is discouraged, for your own sake. Its evil to use while this is open https://github.com/onury/accesscontrol/issues/34#issuecomment-466387586 - when closed I'll happily add it :-) 

- Order of addAccessInfo, matters!

## Coming up

- Custom Possessions (beyond `'any'` & `'own'`) - completing https://github.com/onury/accesscontrol/issues/46)

- Role `'*'` wildcard - scenarios like _*Any Role can Visit the Homepage_, eg `role: '*'`

- Add most of *Actions*, *Resources* or *Possessions*, using negate wildcards, eg: `action: ['*', '!drop_entity_table']`. 

- If other goodies and Access Control issues solved via this facade seem important to me, they will!

- PRs, with tests + rationale, more than welcome :-)

# Licence

MIT
