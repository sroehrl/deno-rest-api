# Deno RESTful POC

Experiment on how working with deno as a REST-API might look like.

## ORM: denodb
Check out https://eveningkid.com/denodb-docs/docs/getting-started

## Authentication
Check out https://deno.land/x/djwt

## Usage:
`https://raw.githubusercontent.com/sroehrl/deno-rest-api/master/mod.ts`
```javascript
import {ClientRequest, Method, startSimpleServer} from 'https://raw.githubusercontent.com/sroehrl/deno-rest-api/master/mod.ts';
startSimpleServer([
    {
        path:'/api/test',
        method:Method.GET,
        handler:() => {test:'me'}
    },
    {
        path: '/api/read-parmas/:name',
        method: Method.GET,
        handler: (client: ClientRequest) => {name:client.params.name}
    },
    {
        path: '/api/yes-or-no',
        method: Method.POST,
        handler: (client: ClientRequest) => {
            const answer = {
                approval: client.body.approval === 'yes' ? 'yes' : 'no'
            }
            return answer;
        }
    }
])
```

## to run
`deno run --allow-net --allow-read --allow-write --watch {your-file.ts}`
