import {ClientRequest, RouteDefinitions, ServerRequest} from "./interfaces.ts";


function testMe(req: ClientRequest){
    return {test:'me'}
}

export const Routes:RouteDefinitions = [
    {
        path: '/api/test',
        method: 'GET',
        handler: testMe
    },
    {
        path: '/api/post',
        method: 'POST',
        handler: (client: ClientRequest)=>{
            return client.body;
        }

    },
    {
        path: '/api/user/:id/:name',
        method: 'GET',
        handler: (client: ClientRequest) =>{
            return {id: client.params.id}
        }
    }
]
