import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import {ClientRequest, RouteDefinition, RouteDefinitions, ServerRequest} from "./interfaces.ts";
import {Auth} from "./Auth.ts";


let configuration = {
    port:8080
};

export const setup = {
    runtimeVariables:{
        'JWT-secret':Math.random().toString(36).substr(2, 14)
    },
    set(what:string, value:any){
        // @ts-ignore
        this.runtimeVariables[what] = value;
    }
}

export class RouteException extends Error{
    private readonly status: number;
    constructor(status = 400, message = 'Bad Request') {
        super();
        this.name = 'RouteException'
        this.message = message
        this.status = status
    }
    getStatus(){
        return this.status;
    }
}


const registeredRoutes: RouteDefinitions = [];

async function startListener(){
    const server = serve(configuration);
    const auth = new Auth(setup.runtimeVariables["JWT-secret"])
    for await (const request of server) {
        const found = matchRequest(request.method, request.url)
        if(found){
            const authHeader = request.headers.get('Authorization')
            let authenticated = null;
            if(authHeader){
                try{
                    authenticated = await auth.validate(authHeader)
                } catch (e) {
                    // console.log('unauthenticated call');
                }
            }
            const answerMachine = (answer: any) =>{

                request.respond(answer)
            }
            const internalRequest:ServerRequest = {
                authenticated,
                bodyDecoded: await readBody(request.body),
                url: request.url,
                method: request.method,
                respond: answerMachine
            }
            await response(internalRequest, found, auth)
        } else {
            const headers = new Headers();
            headers.set('Content-Type','application/json')
            request.respond({ status: 404, body: 'Not found', headers});
        }

    }
}
async function readBody(bodyReader: any){
    const buf: Uint8Array = await Deno.readAll(bodyReader);
    const b = new TextDecoder();
    return JSON.parse(b.decode(buf))
}

function matchRequest(method:string,url:string): RouteDefinition|null {
    let matchedRoute = null;
    const urlParts = url.split('/');
    registeredRoutes.forEach(route => {
        if(route.method === method){
            const routeParts = route.path.split('/');
            let continueMatch = true;
            for (let i = 0; i < routeParts.length; i++){
                if(!continueMatch){
                    break;
                }
                if(urlParts[i] !== routeParts[i]){
                    continueMatch = false;
                }
                if(routeParts[i].charAt(0) === ':'){
                    // @ts-ignore
                    route.params[routeParts[i].replace(':','')] = urlParts[i];
                    continueMatch = true;
                }
            }
            if(continueMatch){
                matchedRoute = route;
            }
        }
    })
    return matchedRoute;
}

async function response(req: ServerRequest, route: RouteDefinition, auth: Auth){
    const headers = new Headers();
    headers.set('Content-Type','application/json')
    try{
        if(typeof route.use !== 'undefined'){
            for(let i = 0; i < route.use.length; i++){
                await Promise.resolve(route.use[i](exposeToClient(req,route, auth)));
            }
        }
        const body = await Promise.resolve(route.handler(exposeToClient(req,route, auth)))

        req.respond({status:200,body:JSON.stringify(body)})
    } catch (e) {
        req.respond({status:e.status,body:e.message})
    }
}

function exposeToClient(req: ServerRequest, route: RouteDefinition, auth: Auth): ClientRequest{
    return {
        url: req.url,
        method: req.method,
        params: route.params || {},
        body: req.bodyDecoded,
        authenticated: req.authenticated,
        auth
    }
}

export function startSimpleServer(routes: Array<RouteDefinition>):void{
    routes.forEach(route => {
        const params = route.path.match(/\/:[^/]+/g)
        if(params){
            if(typeof route.params === 'undefined'){
                route.params = {}
            }
            // @ts-ignore
            params.forEach(param => route.params[param] = null)
        }

        registeredRoutes.push(route)
    })
    startListener()
}
