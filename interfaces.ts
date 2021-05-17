type Parameters = {
    [key: string]: any
}

export interface RouteDefinition{
    path: string,
    handler: Function,
    method: string,
    params?: Parameters
}
export interface RouteDefinitions extends Array<RouteDefinition>{}

export interface ServerRequest{
    respond:Function,
    url: string,
    method: string,
    bodyDecoded: object
}

export interface ClientRequest{
    url: string,
    params: Parameters,
    method: string,
    body: object
}