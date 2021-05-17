import {startSimpleServer, setup} from './simpleServer.ts';
import {Routes} from "./routes.ts";

setup.set('JWT-secret', '9878sdf1238hsdf7');
startSimpleServer(Routes)