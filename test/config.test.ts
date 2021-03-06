import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import { parseEntryPoint } from '../src/config';
// tslint:disable-next-line:no-var-requires
const fs = require('fs-extra');

suite('config tests', () => {

    suite('load main entry point from package.json', () => {

        suite('with a relative path', () => {
            let tempDir: string;
            let packageJsonPath: string;
            const minimalPackageJson = [
                '{',
                '\t"name": "test",',
                '\t"version": "1.0",',
                '\t"main": "someModule.js"',
                '}',
            ].join('\n');

            setup(() => {
                tempDir = fs.mkdtempSync(os.tmpdir() + path.sep);
                packageJsonPath = tempDir + path.sep + 'package.json';
                const fd = fs.openSync(packageJsonPath, 'w');
                fs.writeFileSync(packageJsonPath, minimalPackageJson);
                // close fd, otherwise we get an EPERM in removeSync
                fs.closeSync(fd);
            });

            teardown(() => {
                fs.unlinkSync(packageJsonPath);
                // removeSync instead of rmdirSync, otherwise we get an ENOTEMPTY here
                setTimeout(() => { fs.removeSync(tempDir); }, 1000);
            });

            test('should prepend path with placeholder', () => {
                const entryPoint = parseEntryPoint(packageJsonPath);
                assert.equal(path.join('${workspaceRoot}', 'someModule.js'), entryPoint);
            });
        });

        suite('with an abolute path', () => {
            let tempDir: string;
            let absPath: string;
            let packageJsonPath: string;

            setup(() => {
                tempDir = fs.mkdtempSync(os.tmpdir() + path.sep);
                packageJsonPath = tempDir + path.sep + 'package.json';
                const fd = fs.openSync(packageJsonPath, 'w');
                absPath = path.join(tempDir, 'someModule.js');
                const minimalPackageJson = [
                    '{',
                    '\t"name": "test",',
                    '\t"version": "1.0",',
                    '\t"main": "' + absPath.replace(/\\/g, '\\\\') + '"',
                    '}',
                ].join('\n');
                fs.writeFileSync(packageJsonPath, minimalPackageJson);
                // close fd, otherwise we get an EPERM in removeSync
                fs.closeSync(fd);
            });

            teardown(() => {
                fs.unlinkSync(packageJsonPath);
                // removeSync instead of rmdirSync, otherwise we get an ENOTEMPTY here
                setTimeout(() => { fs.removeSync(tempDir); }, 1000);
            });

            test('should return the path', () => {
                const entryPoint = parseEntryPoint(packageJsonPath);
                assert.equal(absPath, entryPoint);
            });
        });

        suite('with no "main" property', () => {
            let tempDir: string;
            let packageJsonPath: string;
            const minimalPackageJson = [
                '{',
                '\t"name": "test",',
                '\t"version": "1.0"',
                '}',
            ].join('\n');

            setup(() => {
                tempDir = fs.mkdtempSync(os.tmpdir() + path.sep);
                packageJsonPath = tempDir + path.sep + 'package.json';
                const fd = fs.openSync(packageJsonPath, 'w');
                fs.writeFileSync(packageJsonPath, minimalPackageJson);
                // close fd, otherwise we get an EPERM in removeSync
                fs.closeSync(fd);
            });

            teardown(() => {
                fs.unlinkSync(packageJsonPath);
                // removeSync instead of rmdirSync, otherwise we get an ENOTEMPTY here
                setTimeout(() => { fs.removeSync(tempDir); }, 1000);
            });

            test('should return undefined', () => {
                const entryPoint = parseEntryPoint(packageJsonPath);
                assert.equal(undefined, entryPoint);
            });
        });
    });
});
