import {ClientRequest, RouteDefinitions, ServerRequest} from "./interfaces.ts";
import {RouteException} from "./simpleServer.ts";


function testMe(req: ClientRequest){
    return {test:'me'}
}

function requiresAuthentication(clientRequest: ClientRequest){
    if(!clientRequest.authenticated){
        throw new RouteException(401, 'unauthorized')
    }
}

export const Routes:RouteDefinitions = [
    {
        path: '/api/test',
        method: 'GET',
        handler: testMe
    },
    {
        path: '/api/login',
        method: 'POST',
        handler: async (client: ClientRequest)=>{
            const jwt = await client.auth.assign(client.body);
            return {token: jwt}
        }

    },
    {
        path: '/api/user/:id/:name',
        method: 'GET',
        handler: (client: ClientRequest) =>{
            return {id: client.params.id}
        }
    },
    {
        path: '/api/restricted',
        method: 'GET',
        use: [requiresAuthentication],
        handler:  (client: ClientRequest) =>{
            // @ts-ignore
            return {email: client.authenticated.email}
        }
    }
]
