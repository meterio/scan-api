import axios from 'axios';
import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import solc from 'solc';

import Controller from '../interfaces/controller.interface';
import { downloadByVersion } from '../utils/downloader';

class VerifyController implements Controller {
  public path = '/api/verify';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, try$(this.verify));
  }

  private verify = async (req: Request, res: Response) => {
    const { address, chain, sourceCode, optimizer, version } = req.body;

    const { SOURCIFY_SERVER } = process.env;

    try {
      const checkByAddr = await axios.get(
        `${SOURCIFY_SERVER}/checkByAddresses?addresses=${address}&chainIds=${chain}`
      );
      console.log(checkByAddr.data);
      if (checkByAddr.data[0]['status'] === 'perfect') {
        return res.json({
          result: checkByAddr.data[0],
        });
      }

      let start = +new Date();
      const input = {
        language: 'Solidity',
        settings: {
          optimizer: { enabled: optimizer === '1', runs: 200 },
          outputSelection: {
            '*': {
              '*': ['*'],
            },
          },
        },
        sources: {
          'test.sol': {
            content: sourceCode,
          },
        },
      };

      console.log(`Load specific version: ${version} starts`);
      const outputPath = await downloadByVersion(version);
      if (!outputPath) {
        console.log('could not download');
      }

      console.log(
        `Download solc-js file takes: ${(+new Date() - start) / 1000} seconds`
      );
      if (!outputPath) {
        return res.json({
          result: { status: false, msg: 'invalid version ' + version },
        });
      }

      start = +new Date();
      console.log('using ', outputPath);
      const solcjs = solc.setupMethods(require(outputPath));
      console.log(
        `load solc-js version takes: ${(+new Date() - start) / 1000} seconds`
      );
      start = +new Date();
      const output = JSON.parse(solcjs.compile(JSON.stringify(input)));
      console.log(`compile takes ${(+new Date() - start) / 1000} seconds`);
      let check: { error: string; warnings: string[] } = {} as any;
      if (output.errors) {
        check = output.errors.reduce((check, err) => {
          if (err.severity === 'warning') {
            if (!check.warnings) check.warnings = [];
            check.warnings.push(err.message);
          }
          if (err.severity === 'error') {
            check.error = err.message;
          }
          return check;
        }, {});
      }
      if (check.error) {
        return res.json({
          result: { status: false, msg: check.error },
        });
      }

      const data = {
        address: '0xB9A395c843620822E6cA2B20905bFfb71f4e05C4',
        chain: '83',
        files: {
          sourceCode: sourceCode.toString(),
          metadata: output.contracts['test.sol'].Storage.metadata.toString(),
        },
      };
      console.log(data);
      const verifyRes = await axios({
        url: SOURCIFY_SERVER,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      });
      console.log('verify res: ', verifyRes.data);

      return res.json({
        ...verifyRes.data,
      });
    } catch (e) {
      return res.json({
        result: {
          status: false,
          msg: e.message,
        },
      });
    }
  };
}

export default VerifyController;
