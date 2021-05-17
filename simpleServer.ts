import { serve } from "https://deno.land/std@0.96.0/http/server.ts";
import {ClientRequest, RouteDefinition, RouteDefinitions, ServerRequest} from "./interfaces.ts";

const server = serve({ port: 8080 });


const registeredRoutes: RouteDefinitions = [];

async function startListener(){
    for await (const request of server) {

        const found = matchRequest(request.method, request.url)
        if(found){
            const answerMachine = (answer: any) =>{
                request.respond(answer)
            }
            const internalRequest:ServerRequest = {
                bodyDecoded: await readBody(request.body),
                url: request.url,
                method: request.method,
                respond: answerMachine
            }
            response(internalRequest, found)
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

function response(req: ServerRequest, route: RouteDefinition){
    const headers = new Headers();
    headers.set('Content-Type','application/json')
    try{
        const body = route.handler(exposeToClient(req,route));
        req.respond({status:200,body:JSON.stringify(body)})
    } catch (e) {
        req.respond({status:500})
    }
}

function exposeToClient(req: ServerRequest, route: RouteDefinition): ClientRequest{
    return {
        url: req.url,
        method: req.method,
        params: route.params || {},
        body: req.bodyDecoded
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
