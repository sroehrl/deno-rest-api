import {Auth} from "./Auth.ts";

type Parameters = {
    [key: string]: any
}
export enum Method {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE"
}

export interface RouteDefinition{
    path: string,
    handler: Function,
    method: Method | string,
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