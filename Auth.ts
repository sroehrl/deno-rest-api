import { create,verify, getNumericDate } from "https://deno.land/x/djwt@v2.2/mod.ts"


const payload = {
    iss: 'example',
    exp: getNumericDate(2*60*60),
};

export class Auth{
    private readonly key: any;
    constructor(secret:string) {
        this.key = secret;
    }
    async assign(additionalPayload:object){
        let finalPayload = {...payload, ...additionalPayload}
        return await create({typ:'JWT',alg:'HS512'}, finalPayload, this.key)
    }
    async validate(authorizationHeader:string){
        const token = authorizationHeader.split(' ')[1];
        return await verify(token, this.key, 'HS512')
    }
}