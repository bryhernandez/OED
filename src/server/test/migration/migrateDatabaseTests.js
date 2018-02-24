/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;
const mocha = require('mocha');

const recreateDB = require('../db/common').recreateDB;
const db = require('../../models/database').db;

const Migration = require('../../models/Migration');
const { migrateAll } = require('../../migrations/migrateDatabase');


const versionLists = ['0.1.0-0.2.0', '0.2.0-0.3.0', '0.3.0-0.1.0', '0.1.0-0.4.0'];
const migrationList = [];
const isCalled = [false, false, false, false];

// This mocks registerMigration.js
for (let i = 0; i < versionLists.length; i++) {
	const fromVersion = versionLists[i].split('-')[0];
	const toVersion = versionLists[i].split('-')[1];
	const item = {
		fromVersion,
		toVersion,
		up: async dbt => {
			// migration here
			isCalled[i] = true;
		}
	};
	migrationList.push(item);
}


mocha.describe('Migrate the database from current to new version', () => {
	mocha.beforeEach(recreateDB);
	// mocha.beforeEach(async () => {
	// 	await new Migration(undefined, '0.0.0', '0.1.0').insert();
	// });

	mocha.it('should show correct correct up method for each migration in list and insert new row into database', async () => {
		await migrateAll('0.3.0', migrationList);
		const afterCalled = [true, true, false, false];
		expect(isCalled).to.deep.equal(afterCalled);
	});

	// mocha.it('should fail because there is no path', async () => {
	// 	// const testFilePath = path.join(__dirname, 'data', 'metasys-duplicate.csv');
	// 	// await readMetasysData(testFilePath, 60, 2, true);
	// 	// const {reading} = await db.one('SELECT reading FROM readings LIMIT 1');
	// 	// expect(parseInt(reading)).to.equal(280);
	// });
});
