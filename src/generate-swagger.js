const { codegen } = require('swagger-axios-codegen');
const fs = require('fs');

let axiosOverride =
`
import { AuthService } from '../core/AuthService';
import container from "../../inversify.config";
// Instance selector
export async function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  const authService = container.get<AuthService>("AuthService");
  if (serviceOptions.axios) {

    var setAuth = authService.getUser().then((user) => 
    {
        if(user && user.access_token) {
          configs.headers['Authorization'] = "Bearer " + user.access_token;
        }
    });

    await setAuth;

    return serviceOptions.axios
      .request(configs)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}
`
;

codegen({
  methodNameMode: 'path',
  remoteUrl:'http://localhost:5000/swagger/1.0.0%20(a)/swagger.json',
  useClassTransformer: false,
  outputDir: './src/services/ORII',
  multipleFileMode: true,
  modelMode: 'interface'
})
.then(() => {
  fs.appendFile('src/services/ORII/index.defs.ts', axiosOverride, function (err) {
    if (err) throw err;
    console.log('AXIOS OVERRIDEN!');
  });
});