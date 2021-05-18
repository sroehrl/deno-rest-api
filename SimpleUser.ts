import {ClientRequest} from "./interfaces.ts";
import {RouteException} from "./SimpleServer.ts";
import {hash, verify} from "https://deno.land/x/scrypt/mod.ts";
import {DataTypes, Model} from 'https://deno.land/x/denodb/mod.ts';

export class SimpleUser extends Model{
    static table = 'users'
    static timestamps = true;
    static fields = {
        id: {
            type:DataTypes.INTEGER,
            primaryKey: true
        },
        email: {
            type:DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING
    }
    static async login(client: ClientRequest){
        const foundUser = await SimpleUser.where('email', client.body.email).first()
        if(foundUser){
            const password:string = foundUser.password ? foundUser.password.toString() : 'a123456'
            if(await verify(client.body.password.toString(), password)){
                return {token: await client.auth.assign(foundUser)}
            }

        }
        throw new RouteException(401)
    }
}
SimpleUser.on('created', async (model:SimpleUser) =>{
    const u = await SimpleUser.orderBy('id','desc').first();
    const password:string = u.password ? u.password.toString() : 'a123456'
    u.password = await hash(password);
    await u.update();
})