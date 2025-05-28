import jetEnv, { num, str } from 'jet-env';
import { isEnumVal } from 'jet-validators';

import { NodeEnvs } from '.';


/******************************************************************************
                                 Setup
******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  DbHost: str,
  DbPort: num, // Assuming DB_PORT is a number, if it's a string, use 'str'
  DbUser: str,
  DbPassword: str,
  DbName: str,
  MongodbConnectionString: str,
  JwtSecret: str,
  JwtSecretExpiryTime: str,
  ExchangeRateApiKey: str,
});


/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;
