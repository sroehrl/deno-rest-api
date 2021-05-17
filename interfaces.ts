import {Auth} from "./Auth.ts";

type Parameters = {
    [key: string]: any
}

export interface RouteDefinition{
    path: string,
    handler: Function,
    method: string,
    params?: Parameters
    use?:Array<Function>
}
export interface RouteDefinitions extends Array<RouteDefinition>{}

export interface ServerRequest{
    authenticated: object | null
    respond:Function,
    url: string,
    method: string,
    bodyDecoded: object
}

export interface ClientRequest{
    authenticated: object | null
    url: string,
    params: Parameters,
    method: string,
    body: any,
    auth: Auth
}