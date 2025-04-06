require('dotenv').config()
import { DefaultCrudRepository } from '@loopback/repository'
import { ModelIdType, GeneralUtility } from '@david.ezechukwu/core'
import * as Winston from 'winston'
import { GroupModel, LookupCategoryModel, LookupModel, RoleModel, UserGroupModel, UserGroupRoleModel, UserModel, UserDisplaySettingsModel } from '../../models'
import { Api } from './../../Api'
import { GetConfigurationFromEnv, LocalStrategyOptions, provider, ConfigurationType } from '../../Configuration'
import { Lookups } from '../fixtures/localisation/Lookups'
import {
	GroupRepositoryService,
	LookupCategoryRepositoryService,
	LookupRepositoryService,
	RoleRepositoryService,
	UserEmailAddressRepositoryService,
	UserGroupRoleRepositoryService,
	UserLogonRepositoryService,
	UserPasswordRepositoryService,
	UserPhoneNumberRepositoryService,
	UserDisplaySettingsRepositoryService,
	UserRepositoryService
} from '../../repositories'
import { LocalisationUtils } from '../../utils'
import { CasbinService, LookupService } from '../../services'
import { LoggingBindings, WinstonLogger } from '@loopback/logging'
import { UserNameRepositoryService } from '../../repositories/UserNameRepositoryService'
import { readdir } from 'node:fs/promises'
import { UserGroupRepositoryService } from '../../repositories/UserGroupRepositoryService'
import { CoreDataSource } from '../../datasources'
import { SQLMigrations } from '../../datasources/SQLMigrations'
const crypto = require('crypto')
const path = require('path')

export async function FirstRun(args: string[]) {
	const configuration = GetConfigurationFromEnv()
	GeneralUtility.Debug(`Starting migrations`)
	let exitCode = 0
	try {
		const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
		const existingSchema = args.includes('--rebuild') ? 'drop' : args.length < 3 ? 'drop' : 'alter'
		const api = new Api(configuration)
		await api.boot()
		await api.init()
		await api.start()
		const logger: WinstonLogger = await api.get(LoggingBindings.WINSTON_LOGGER)
		logger.info(`Migration first run using api.migrateSchema(${existingSchema})`)

		const models = await GetModelsToBeMigrated(logger, configuration)
		api.migrateSchema({ existingSchema, models })
			.then(async () => {
				if (SQLMigrations.length > 0) {
					logger.info(`Creating referential intigrity definitions...`)
					const dataSource: CoreDataSource = await api.get(CoreDataSource.BINDING_KEY.key)
					for (const sqlMigration of SQLMigrations) {
						logger.info(sqlMigration)
						await dataSource.execute(sqlMigration)
					}
				}
				logger.info(`Database updated successfully`)
				const lookupRepositoryService: LookupRepositoryService = api.getSync(LookupRepositoryService.BINDING_KEY.key)
				const lookupCategoryRepositoryService: LookupCategoryRepositoryService = api.getSync(LookupCategoryRepositoryService.BINDING_KEY.key)
				const groupRepositoryService: GroupRepositoryService = api.getSync(GroupRepositoryService.BINDING_KEY.key)
				const roleRepositoryService: RoleRepositoryService = api.getSync(RoleRepositoryService.BINDING_KEY.key)
				const userRepositoryService: UserRepositoryService = api.getSync(UserRepositoryService.BINDING_KEY.key)
				const userGroupRepositoryService: UserGroupRepositoryService = api.getSync(UserGroupRepositoryService.BINDING_KEY.key)
				const userGroupRoleRepositoryService: UserGroupRoleRepositoryService = api.getSync(UserGroupRoleRepositoryService.BINDING_KEY.key)
				const userLogonRepositoryService: UserLogonRepositoryService = api.getSync(UserLogonRepositoryService.BINDING_KEY.key)
				const userPasswordRepositoryService: UserPasswordRepositoryService = api.getSync(UserPasswordRepositoryService.BINDING_KEY.key)
				const userEmailAddressRepositoryService: UserEmailAddressRepositoryService = api.getSync(UserEmailAddressRepositoryService.BINDING_KEY.key)
				const userDisplaySettingsRepositoryService: UserDisplaySettingsRepositoryService = api.getSync(UserDisplaySettingsRepositoryService.BINDING_KEY.key)
				const userNameRepositoryService: UserNameRepositoryService = api.getSync(UserNameRepositoryService.BINDING_KEY.key)
				const userPhoneNumberRepositoryService: UserPhoneNumberRepositoryService = api.getSync(UserPhoneNumberRepositoryService.BINDING_KEY.key)

				const rootUser = await CreateRootUser(logger, userRepositoryService, configuration)
				await CreateLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
				const roles = await CreateRoles(rootUser, logger, lookups, roleRepositoryService)
				const groups = await CreateGroups(rootUser, logger, lookups, groupRepositoryService)
				await AddRootUserToGroups(rootUser, logger, groups, roles, userGroupRepositoryService, userGroupRoleRepositoryService)
				await CreateProfileForRootUser(
					rootUser,
					lookups,
					logger,
					configuration,
					lookupRepositoryService,
					lookupCategoryRepositoryService,
					userLogonRepositoryService,
					userPasswordRepositoryService,
					userEmailAddressRepositoryService,
					userDisplaySettingsRepositoryService,
					userNameRepositoryService,
					userPhoneNumberRepositoryService
				)
			})
			.catch(e => {
				exitCode = 666
				logger.error(`Database Schema first run failed with this error: ${JSON.stringify(e)}`)
				throw e
			})
			.finally(() => {
				if (!exitCode) {
					logger.info(`Database Schema first run completed successfully.`)
				} else {
					logger.error(`Database Schema first run did not complete successfully`)
					logger.error(`Please correct all errors, reset the database, and try again`)
					//TODO: implement db rolllback, i.e reset to new
				}
				process.exit(exitCode)
			})
	} catch (e) {
		exitCode = 666
		GeneralUtility.Debug(`The database initial migration did not complete successfully, it failed with this error: ${JSON.stringify(e)}`)
		GeneralUtility.Debug(`The database migration failed`)
		process.exit(exitCode)
		//TODO: implement db rollback, i.e reset to new
	}
}

async function GetModelsToBeMigrated(logger: Winston.Logger, config: ConfigurationType): Promise<string[]> {
	return new Promise<string[]>(async (resolve, reject) => {
		logger.info(`Getting the list of models...`)
		const models: string[] = []
		try {
			const files = await readdir(path.join(__dirname, '../../models'))
			for (const file of files) {
				if (file.indexOf(`.js.map`) < 0 && file.indexOf(`.d.ts`) < 0 && file.indexOf(`SuperModel`) < 0) {
					const model = file.replace('.js', '')
					if (model.toLocaleLowerCase() !== 'index') {
						models.push(model)
					}
				}
			}
			logger.info(`Got the list of models ${JSON.stringify(models)}`)
			resolve(models)
			return
		} catch (err) {
			logger.info(`Encountered an error whilst reading the models directory(${path.join(__dirname, '../../models')}`)
			reject(err)
		}
	})
}

async function CreateRootUser(logger: Winston.Logger, userRepository: DefaultCrudRepository<UserModel, ModelIdType, UserModel>, config: ConfigurationType): Promise<UserModel> {
	logger.info(`Creating root user...`)
	const rootUser = await userRepository.create(new UserModel({ CreatedById: config.rootUser.id, UpdatedById: config.rootUser.id }))
	logger.info(`Created root user ${JSON.stringify(rootUser)}`)
	return rootUser
}

async function CreateLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: LookupRepositoryService,
	lookupCategoryRepositoryService: LookupCategoryRepositoryService
): Promise<[LookupCategoryModel[], LookupModel[]]> {
	logger.info(`Creating Lookup Categories and Lookups...`)
	await CreateCountryLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateCurrencyLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateLanguagesLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateAuthenticationProviderLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateNotificationStrategyLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateNotificationStatusLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreatePhoneTypesLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreatePhotoTypesLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateThemesLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateBasicTypesLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	await CreateImportanceLookups(rootUser, logger, lookups, lookupRepositoryService, lookupCategoryRepositoryService)
	logger.info(`Finished creating Lookup Categories and Lookups...`)
	const categories = await lookupCategoryRepositoryService.Find()
	const categoryLookups = await lookupRepositoryService.Find()
	return [categories, categoryLookups]
}

async function CreateCountryLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const countries = LookupService.CountryLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${countries} category`)
	const countriesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: countries, Value: lookups[countries]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const countriesLookup = lookups.Countries
	const countriesToCreate: LookupModel[] = []
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Afghanistan.Name, OfficialName: countriesLookup.Afghanistan.OfficialName, PluralName: countriesLookup.Afghanistan.PluralName, Value: countriesLookup.Afghanistan.Value, OtherValue1: countriesLookup.Afghanistan.Alpha_2Value, OtherValue2: countriesLookup.Afghanistan.Alpha_3Value, OtherValue3: countriesLookup.Afghanistan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.AlandIslands.Name, OfficialName: countriesLookup.AlandIslands.OfficialName, PluralName: countriesLookup.AlandIslands.PluralName, Value: countriesLookup.AlandIslands.Value, OtherValue1: countriesLookup.AlandIslands.Alpha_2Value, OtherValue2: countriesLookup.AlandIslands.Alpha_3Value, OtherValue3: countriesLookup.AlandIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Albania.Name, OfficialName: countriesLookup.Albania.OfficialName, PluralName: countriesLookup.Albania.PluralName, Value: countriesLookup.Albania.Value, OtherValue1: countriesLookup.Albania.Alpha_2Value, OtherValue2: countriesLookup.Albania.Alpha_3Value, OtherValue3: countriesLookup.Albania.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Algeria.Name, OfficialName: countriesLookup.Algeria.OfficialName, PluralName: countriesLookup.Algeria.PluralName, Value: countriesLookup.Algeria.Value, OtherValue1: countriesLookup.Algeria.Alpha_2Value, OtherValue2: countriesLookup.Algeria.Alpha_3Value, OtherValue3: countriesLookup.Algeria.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.AmericanSamoa.Name, OfficialName: countriesLookup.AmericanSamoa.OfficialName, PluralName: countriesLookup.AmericanSamoa.PluralName, Value: countriesLookup.AmericanSamoa.Value, OtherValue1: countriesLookup.AmericanSamoa.Alpha_2Value, OtherValue2: countriesLookup.AmericanSamoa.Alpha_3Value, OtherValue3: countriesLookup.AmericanSamoa.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Andorra.Name, OfficialName: countriesLookup.Andorra.OfficialName, PluralName: countriesLookup.Andorra.PluralName, Value: countriesLookup.Andorra.Value, OtherValue1: countriesLookup.Andorra.Alpha_2Value, OtherValue2: countriesLookup.Andorra.Alpha_3Value, OtherValue3: countriesLookup.Andorra.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Angola.Name, OfficialName: countriesLookup.Angola.OfficialName, PluralName: countriesLookup.Angola.PluralName, Value: countriesLookup.Angola.Value, OtherValue1: countriesLookup.Angola.Alpha_2Value, OtherValue2: countriesLookup.Angola.Alpha_3Value, OtherValue3: countriesLookup.Angola.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Anguilla.Name, OfficialName: countriesLookup.Anguilla.OfficialName, PluralName: countriesLookup.Anguilla.PluralName, Value: countriesLookup.Anguilla.Value, OtherValue1: countriesLookup.Anguilla.Alpha_2Value, OtherValue2: countriesLookup.Anguilla.Alpha_3Value, OtherValue3: countriesLookup.Anguilla.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Antarctica.Name, OfficialName: countriesLookup.Antarctica.OfficialName, PluralName: countriesLookup.Antarctica.PluralName, Value: countriesLookup.Antarctica.Value, OtherValue1: countriesLookup.Antarctica.Alpha_2Value, OtherValue2: countriesLookup.Antarctica.Alpha_3Value, OtherValue3: countriesLookup.Antarctica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.AntiguaandBarbuda.Name, OfficialName: countriesLookup.AntiguaandBarbuda.OfficialName, PluralName: countriesLookup.AntiguaandBarbuda.PluralName, Value: countriesLookup.AntiguaandBarbuda.Value, OtherValue1: countriesLookup.AntiguaandBarbuda.Alpha_2Value, OtherValue2: countriesLookup.AntiguaandBarbuda.Alpha_3Value, OtherValue3: countriesLookup.AntiguaandBarbuda.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Argentina.Name, OfficialName: countriesLookup.Argentina.OfficialName, PluralName: countriesLookup.Argentina.PluralName, Value: countriesLookup.Argentina.Value, OtherValue1: countriesLookup.Argentina.Alpha_2Value, OtherValue2: countriesLookup.Argentina.Alpha_3Value, OtherValue3: countriesLookup.Argentina.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Armenia.Name, OfficialName: countriesLookup.Armenia.OfficialName, PluralName: countriesLookup.Armenia.PluralName, Value: countriesLookup.Armenia.Value, OtherValue1: countriesLookup.Armenia.Alpha_2Value, OtherValue2: countriesLookup.Armenia.Alpha_3Value, OtherValue3: countriesLookup.Armenia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Aruba.Name, OfficialName: countriesLookup.Aruba.OfficialName, PluralName: countriesLookup.Aruba.PluralName, Value: countriesLookup.Aruba.Value, OtherValue1: countriesLookup.Aruba.Alpha_2Value, OtherValue2: countriesLookup.Aruba.Alpha_3Value, OtherValue3: countriesLookup.Aruba.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Australia.Name, OfficialName: countriesLookup.Australia.OfficialName, PluralName: countriesLookup.Australia.PluralName, Value: countriesLookup.Australia.Value, OtherValue1: countriesLookup.Australia.Alpha_2Value, OtherValue2: countriesLookup.Australia.Alpha_3Value, OtherValue3: countriesLookup.Australia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Austria.Name, OfficialName: countriesLookup.Austria.OfficialName, PluralName: countriesLookup.Austria.PluralName, Value: countriesLookup.Austria.Value, OtherValue1: countriesLookup.Austria.Alpha_2Value, OtherValue2: countriesLookup.Austria.Alpha_3Value, OtherValue3: countriesLookup.Austria.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Azerbaijan.Name, OfficialName: countriesLookup.Azerbaijan.OfficialName, PluralName: countriesLookup.Azerbaijan.PluralName, Value: countriesLookup.Azerbaijan.Value, OtherValue1: countriesLookup.Azerbaijan.Alpha_2Value, OtherValue2: countriesLookup.Azerbaijan.Alpha_3Value, OtherValue3: countriesLookup.Azerbaijan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bahamas.Name, OfficialName: countriesLookup.Bahamas.OfficialName, PluralName: countriesLookup.Bahamas.PluralName, Value: countriesLookup.Bahamas.Value, OtherValue1: countriesLookup.Bahamas.Alpha_2Value, OtherValue2: countriesLookup.Bahamas.Alpha_3Value, OtherValue3: countriesLookup.Bahamas.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bahrain.Name, OfficialName: countriesLookup.Bahrain.OfficialName, PluralName: countriesLookup.Bahrain.PluralName, Value: countriesLookup.Bahrain.Value, OtherValue1: countriesLookup.Bahrain.Alpha_2Value, OtherValue2: countriesLookup.Bahrain.Alpha_3Value, OtherValue3: countriesLookup.Bahrain.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bangladesh.Name, OfficialName: countriesLookup.Bangladesh.OfficialName, PluralName: countriesLookup.Bangladesh.PluralName, Value: countriesLookup.Bangladesh.Value, OtherValue1: countriesLookup.Bangladesh.Alpha_2Value, OtherValue2: countriesLookup.Bangladesh.Alpha_3Value, OtherValue3: countriesLookup.Bangladesh.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Barbados.Name, OfficialName: countriesLookup.Barbados.OfficialName, PluralName: countriesLookup.Barbados.PluralName, Value: countriesLookup.Barbados.Value, OtherValue1: countriesLookup.Barbados.Alpha_2Value, OtherValue2: countriesLookup.Barbados.Alpha_3Value, OtherValue3: countriesLookup.Barbados.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Belarus.Name, OfficialName: countriesLookup.Belarus.OfficialName, PluralName: countriesLookup.Belarus.PluralName, Value: countriesLookup.Belarus.Value, OtherValue1: countriesLookup.Belarus.Alpha_2Value, OtherValue2: countriesLookup.Belarus.Alpha_3Value, OtherValue3: countriesLookup.Belarus.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Belgium.Name, OfficialName: countriesLookup.Belgium.OfficialName, PluralName: countriesLookup.Belgium.PluralName, Value: countriesLookup.Belgium.Value, OtherValue1: countriesLookup.Belgium.Alpha_2Value, OtherValue2: countriesLookup.Belgium.Alpha_3Value, OtherValue3: countriesLookup.Belgium.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Belize.Name, OfficialName: countriesLookup.Belize.OfficialName, PluralName: countriesLookup.Belize.PluralName, Value: countriesLookup.Belize.Value, OtherValue1: countriesLookup.Belize.Alpha_2Value, OtherValue2: countriesLookup.Belize.Alpha_3Value, OtherValue3: countriesLookup.Belize.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Benin.Name, OfficialName: countriesLookup.Benin.OfficialName, PluralName: countriesLookup.Benin.PluralName, Value: countriesLookup.Benin.Value, OtherValue1: countriesLookup.Benin.Alpha_2Value, OtherValue2: countriesLookup.Benin.Alpha_3Value, OtherValue3: countriesLookup.Benin.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bermuda.Name, OfficialName: countriesLookup.Bermuda.OfficialName, PluralName: countriesLookup.Bermuda.PluralName, Value: countriesLookup.Bermuda.Value, OtherValue1: countriesLookup.Bermuda.Alpha_2Value, OtherValue2: countriesLookup.Bermuda.Alpha_3Value, OtherValue3: countriesLookup.Bermuda.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bhutan.Name, OfficialName: countriesLookup.Bhutan.OfficialName, PluralName: countriesLookup.Bhutan.PluralName, Value: countriesLookup.Bhutan.Value, OtherValue1: countriesLookup.Bhutan.Alpha_2Value, OtherValue2: countriesLookup.Bhutan.Alpha_3Value, OtherValue3: countriesLookup.Bhutan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bolivia.Name, OfficialName: countriesLookup.Bolivia.OfficialName, PluralName: countriesLookup.Bolivia.PluralName, Value: countriesLookup.Bolivia.Value, OtherValue1: countriesLookup.Bolivia.Alpha_2Value, OtherValue2: countriesLookup.Bolivia.Alpha_3Value, OtherValue3: countriesLookup.Bolivia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bonaire.Name, OfficialName: countriesLookup.Bonaire.OfficialName, PluralName: countriesLookup.Bonaire.PluralName, Value: countriesLookup.Bonaire.Value, OtherValue1: countriesLookup.Bonaire.Alpha_2Value, OtherValue2: countriesLookup.Bonaire.Alpha_3Value, OtherValue3: countriesLookup.Bonaire.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.BosniaandHerzegovina.Name, OfficialName: countriesLookup.BosniaandHerzegovina.OfficialName, PluralName: countriesLookup.BosniaandHerzegovina.PluralName, Value: countriesLookup.BosniaandHerzegovina.Value, OtherValue1: countriesLookup.BosniaandHerzegovina.Alpha_2Value, OtherValue2: countriesLookup.BosniaandHerzegovina.Alpha_3Value, OtherValue3: countriesLookup.BosniaandHerzegovina.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Botswana.Name, OfficialName: countriesLookup.Botswana.OfficialName, PluralName: countriesLookup.Botswana.PluralName, Value: countriesLookup.Botswana.Value, OtherValue1: countriesLookup.Botswana.Alpha_2Value, OtherValue2: countriesLookup.Botswana.Alpha_3Value, OtherValue3: countriesLookup.Botswana.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Brazil.Name, OfficialName: countriesLookup.Brazil.OfficialName, PluralName: countriesLookup.Brazil.PluralName, Value: countriesLookup.Brazil.Value, OtherValue1: countriesLookup.Brazil.Alpha_2Value, OtherValue2: countriesLookup.Brazil.Alpha_3Value, OtherValue3: countriesLookup.Brazil.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.BritishIndianOceanTerritory.Name, OfficialName: countriesLookup.BritishIndianOceanTerritory.OfficialName, PluralName: countriesLookup.BritishIndianOceanTerritory.PluralName, Value: countriesLookup.BritishIndianOceanTerritory.Value, OtherValue1: countriesLookup.BritishIndianOceanTerritory.Alpha_2Value, OtherValue2: countriesLookup.BritishIndianOceanTerritory.Alpha_3Value, OtherValue3: countriesLookup.BritishIndianOceanTerritory.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Brunei.Name, OfficialName: countriesLookup.Brunei.OfficialName, PluralName: countriesLookup.Brunei.PluralName, Value: countriesLookup.Brunei.Value, OtherValue1: countriesLookup.Brunei.Alpha_2Value, OtherValue2: countriesLookup.Brunei.Alpha_3Value, OtherValue3: countriesLookup.Brunei.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Bulgaria.Name, OfficialName: countriesLookup.Bulgaria.OfficialName, PluralName: countriesLookup.Bulgaria.PluralName, Value: countriesLookup.Bulgaria.Value, OtherValue1: countriesLookup.Bulgaria.Alpha_2Value, OtherValue2: countriesLookup.Bulgaria.Alpha_3Value, OtherValue3: countriesLookup.Bulgaria.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.BurkinaFaso.Name, OfficialName: countriesLookup.BurkinaFaso.OfficialName, PluralName: countriesLookup.BurkinaFaso.PluralName, Value: countriesLookup.BurkinaFaso.Value, OtherValue1: countriesLookup.BurkinaFaso.Alpha_2Value, OtherValue2: countriesLookup.BurkinaFaso.Alpha_3Value, OtherValue3: countriesLookup.BurkinaFaso.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Burundi.Name, OfficialName: countriesLookup.Burundi.OfficialName, PluralName: countriesLookup.Burundi.PluralName, Value: countriesLookup.Burundi.Value, OtherValue1: countriesLookup.Burundi.Alpha_2Value, OtherValue2: countriesLookup.Burundi.Alpha_3Value, OtherValue3: countriesLookup.Burundi.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CaboVerde.Name, OfficialName: countriesLookup.CaboVerde.OfficialName, PluralName: countriesLookup.CaboVerde.PluralName, Value: countriesLookup.CaboVerde.Value, OtherValue1: countriesLookup.CaboVerde.Alpha_2Value, OtherValue2: countriesLookup.CaboVerde.Alpha_3Value, OtherValue3: countriesLookup.CaboVerde.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Cambodia.Name, OfficialName: countriesLookup.Cambodia.OfficialName, PluralName: countriesLookup.Cambodia.PluralName, Value: countriesLookup.Cambodia.Value, OtherValue1: countriesLookup.Cambodia.Alpha_2Value, OtherValue2: countriesLookup.Cambodia.Alpha_3Value, OtherValue3: countriesLookup.Cambodia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Cameroon.Name, OfficialName: countriesLookup.Cameroon.OfficialName, PluralName: countriesLookup.Cameroon.PluralName, Value: countriesLookup.Cameroon.Value, OtherValue1: countriesLookup.Cameroon.Alpha_2Value, OtherValue2: countriesLookup.Cameroon.Alpha_3Value, OtherValue3: countriesLookup.Cameroon.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Canada.Name, OfficialName: countriesLookup.Canada.OfficialName, PluralName: countriesLookup.Canada.PluralName, Value: countriesLookup.Canada.Value, OtherValue1: countriesLookup.Canada.Alpha_2Value, OtherValue2: countriesLookup.Canada.Alpha_3Value, OtherValue3: countriesLookup.Canada.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CaymanIslands.Name, OfficialName: countriesLookup.CaymanIslands.OfficialName, PluralName: countriesLookup.CaymanIslands.PluralName, Value: countriesLookup.CaymanIslands.Value, OtherValue1: countriesLookup.CaymanIslands.Alpha_2Value, OtherValue2: countriesLookup.CaymanIslands.Alpha_3Value, OtherValue3: countriesLookup.CaymanIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CentralAfricanRepublic.Name, OfficialName: countriesLookup.CentralAfricanRepublic.OfficialName, PluralName: countriesLookup.CentralAfricanRepublic.PluralName, Value: countriesLookup.CentralAfricanRepublic.Value, OtherValue1: countriesLookup.CentralAfricanRepublic.Alpha_2Value, OtherValue2: countriesLookup.CentralAfricanRepublic.Alpha_3Value, OtherValue3: countriesLookup.CentralAfricanRepublic.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Chad.Name, OfficialName: countriesLookup.Chad.OfficialName, PluralName: countriesLookup.Chad.PluralName, Value: countriesLookup.Chad.Value, OtherValue1: countriesLookup.Chad.Alpha_2Value, OtherValue2: countriesLookup.Chad.Alpha_3Value, OtherValue3: countriesLookup.Chad.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Chile.Name, OfficialName: countriesLookup.Chile.OfficialName, PluralName: countriesLookup.Chile.PluralName, Value: countriesLookup.Chile.Value, OtherValue1: countriesLookup.Chile.Alpha_2Value, OtherValue2: countriesLookup.Chile.Alpha_3Value, OtherValue3: countriesLookup.Chile.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.China.Name, OfficialName: countriesLookup.China.OfficialName, PluralName: countriesLookup.China.PluralName, Value: countriesLookup.China.Value, OtherValue1: countriesLookup.China.Alpha_2Value, OtherValue2: countriesLookup.China.Alpha_3Value, OtherValue3: countriesLookup.China.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.ChristmasIsland.Name, OfficialName: countriesLookup.ChristmasIsland.OfficialName, PluralName: countriesLookup.ChristmasIsland.PluralName, Value: countriesLookup.ChristmasIsland.Value, OtherValue1: countriesLookup.ChristmasIsland.Alpha_2Value, OtherValue2: countriesLookup.ChristmasIsland.Alpha_3Value, OtherValue3: countriesLookup.ChristmasIsland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CocosIslands.Name, OfficialName: countriesLookup.CocosIslands.OfficialName, PluralName: countriesLookup.CocosIslands.PluralName, Value: countriesLookup.CocosIslands.Value, OtherValue1: countriesLookup.CocosIslands.Alpha_2Value, OtherValue2: countriesLookup.CocosIslands.Alpha_3Value, OtherValue3: countriesLookup.CocosIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Colombia.Name, OfficialName: countriesLookup.Colombia.OfficialName, PluralName: countriesLookup.Colombia.PluralName, Value: countriesLookup.Colombia.Value, OtherValue1: countriesLookup.Colombia.Alpha_2Value, OtherValue2: countriesLookup.Colombia.Alpha_3Value, OtherValue3: countriesLookup.Colombia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Comoros.Name, OfficialName: countriesLookup.Comoros.OfficialName, PluralName: countriesLookup.Comoros.PluralName, Value: countriesLookup.Comoros.Value, OtherValue1: countriesLookup.Comoros.Alpha_2Value, OtherValue2: countriesLookup.Comoros.Alpha_3Value, OtherValue3: countriesLookup.Comoros.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.DRCongo.Name, OfficialName: countriesLookup.DRCongo.OfficialName, PluralName: countriesLookup.DRCongo.PluralName, Value: countriesLookup.DRCongo.Value, OtherValue1: countriesLookup.DRCongo.Alpha_2Value, OtherValue2: countriesLookup.DRCongo.Alpha_3Value, OtherValue3: countriesLookup.DRCongo.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Congo.Name, OfficialName: countriesLookup.Congo.OfficialName, PluralName: countriesLookup.Congo.PluralName, Value: countriesLookup.Congo.Value, OtherValue1: countriesLookup.Congo.Alpha_2Value, OtherValue2: countriesLookup.Congo.Alpha_3Value, OtherValue3: countriesLookup.Congo.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CookIslands.Name, OfficialName: countriesLookup.CookIslands.OfficialName, PluralName: countriesLookup.CookIslands.PluralName, Value: countriesLookup.CookIslands.Value, OtherValue1: countriesLookup.CookIslands.Alpha_2Value, OtherValue2: countriesLookup.CookIslands.Alpha_3Value, OtherValue3: countriesLookup.CookIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.CostaRica.Name, OfficialName: countriesLookup.CostaRica.OfficialName, PluralName: countriesLookup.CostaRica.PluralName, Value: countriesLookup.CostaRica.Value, OtherValue1: countriesLookup.CostaRica.Alpha_2Value, OtherValue2: countriesLookup.CostaRica.Alpha_3Value, OtherValue3: countriesLookup.CostaRica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.IvoryCoast.Name, OfficialName: countriesLookup.IvoryCoast.OfficialName, PluralName: countriesLookup.IvoryCoast.PluralName, Value: countriesLookup.IvoryCoast.Value, OtherValue1: countriesLookup.IvoryCoast.Alpha_2Value, OtherValue2: countriesLookup.IvoryCoast.Alpha_3Value, OtherValue3: countriesLookup.IvoryCoast.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Croatia.Name, OfficialName: countriesLookup.Croatia.OfficialName, PluralName: countriesLookup.Croatia.PluralName, Value: countriesLookup.Croatia.Value, OtherValue1: countriesLookup.Croatia.Alpha_2Value, OtherValue2: countriesLookup.Croatia.Alpha_3Value, OtherValue3: countriesLookup.Croatia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Cuba.Name, OfficialName: countriesLookup.Cuba.OfficialName, PluralName: countriesLookup.Cuba.PluralName, Value: countriesLookup.Cuba.Value, OtherValue1: countriesLookup.Cuba.Alpha_2Value, OtherValue2: countriesLookup.Cuba.Alpha_3Value, OtherValue3: countriesLookup.Cuba.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Curacao.Name, OfficialName: countriesLookup.Curacao.OfficialName, PluralName: countriesLookup.Curacao.PluralName, Value: countriesLookup.Curacao.Value, OtherValue1: countriesLookup.Curacao.Alpha_2Value, OtherValue2: countriesLookup.Curacao.Alpha_3Value, OtherValue3: countriesLookup.Curacao.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Cyprus.Name, OfficialName: countriesLookup.Cyprus.OfficialName, PluralName: countriesLookup.Cyprus.PluralName, Value: countriesLookup.Cyprus.Value, OtherValue1: countriesLookup.Cyprus.Alpha_2Value, OtherValue2: countriesLookup.Cyprus.Alpha_3Value, OtherValue3: countriesLookup.Cyprus.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Czechia.Name, OfficialName: countriesLookup.Czechia.OfficialName, PluralName: countriesLookup.Czechia.PluralName, Value: countriesLookup.Czechia.Value, OtherValue1: countriesLookup.Czechia.Alpha_2Value, OtherValue2: countriesLookup.Czechia.Alpha_3Value, OtherValue3: countriesLookup.Czechia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Denmark.Name, OfficialName: countriesLookup.Denmark.OfficialName, PluralName: countriesLookup.Denmark.PluralName, Value: countriesLookup.Denmark.Value, OtherValue1: countriesLookup.Denmark.Alpha_2Value, OtherValue2: countriesLookup.Denmark.Alpha_3Value, OtherValue3: countriesLookup.Denmark.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Djibouti.Name, OfficialName: countriesLookup.Djibouti.OfficialName, PluralName: countriesLookup.Djibouti.PluralName, Value: countriesLookup.Djibouti.Value, OtherValue1: countriesLookup.Djibouti.Alpha_2Value, OtherValue2: countriesLookup.Djibouti.Alpha_3Value, OtherValue3: countriesLookup.Djibouti.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Dominica.Name, OfficialName: countriesLookup.Dominica.OfficialName, PluralName: countriesLookup.Dominica.PluralName, Value: countriesLookup.Dominica.Value, OtherValue1: countriesLookup.Dominica.Alpha_2Value, OtherValue2: countriesLookup.Dominica.Alpha_3Value, OtherValue3: countriesLookup.Dominica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.DominicanRepublic.Name, OfficialName: countriesLookup.DominicanRepublic.OfficialName, PluralName: countriesLookup.DominicanRepublic.PluralName, Value: countriesLookup.DominicanRepublic.Value, OtherValue1: countriesLookup.DominicanRepublic.Alpha_2Value, OtherValue2: countriesLookup.DominicanRepublic.Alpha_3Value, OtherValue3: countriesLookup.DominicanRepublic.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Ecuador.Name, OfficialName: countriesLookup.Ecuador.OfficialName, PluralName: countriesLookup.Ecuador.PluralName, Value: countriesLookup.Ecuador.Value, OtherValue1: countriesLookup.Ecuador.Alpha_2Value, OtherValue2: countriesLookup.Ecuador.Alpha_3Value, OtherValue3: countriesLookup.Ecuador.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Egypt.Name, OfficialName: countriesLookup.Egypt.OfficialName, PluralName: countriesLookup.Egypt.PluralName, Value: countriesLookup.Egypt.Value, OtherValue1: countriesLookup.Egypt.Alpha_2Value, OtherValue2: countriesLookup.Egypt.Alpha_3Value, OtherValue3: countriesLookup.Egypt.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.ElSalvador.Name, OfficialName: countriesLookup.ElSalvador.OfficialName, PluralName: countriesLookup.ElSalvador.PluralName, Value: countriesLookup.ElSalvador.Value, OtherValue1: countriesLookup.ElSalvador.Alpha_2Value, OtherValue2: countriesLookup.ElSalvador.Alpha_3Value, OtherValue3: countriesLookup.ElSalvador.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.EquatorialGuinea.Name, OfficialName: countriesLookup.EquatorialGuinea.OfficialName, PluralName: countriesLookup.EquatorialGuinea.PluralName, Value: countriesLookup.EquatorialGuinea.Value, OtherValue1: countriesLookup.EquatorialGuinea.Alpha_2Value, OtherValue2: countriesLookup.EquatorialGuinea.Alpha_3Value, OtherValue3: countriesLookup.EquatorialGuinea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Eritrea.Name, OfficialName: countriesLookup.Eritrea.OfficialName, PluralName: countriesLookup.Eritrea.PluralName, Value: countriesLookup.Eritrea.Value, OtherValue1: countriesLookup.Eritrea.Alpha_2Value, OtherValue2: countriesLookup.Eritrea.Alpha_3Value, OtherValue3: countriesLookup.Eritrea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Estonia.Name, OfficialName: countriesLookup.Estonia.OfficialName, PluralName: countriesLookup.Estonia.PluralName, Value: countriesLookup.Estonia.Value, OtherValue1: countriesLookup.Estonia.Alpha_2Value, OtherValue2: countriesLookup.Estonia.Alpha_3Value, OtherValue3: countriesLookup.Estonia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Eswatini.Name, OfficialName: countriesLookup.Eswatini.OfficialName, PluralName: countriesLookup.Eswatini.PluralName, Value: countriesLookup.Eswatini.Value, OtherValue1: countriesLookup.Eswatini.Alpha_2Value, OtherValue2: countriesLookup.Eswatini.Alpha_3Value, OtherValue3: countriesLookup.Eswatini.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Ethiopia.Name, OfficialName: countriesLookup.Ethiopia.OfficialName, PluralName: countriesLookup.Ethiopia.PluralName, Value: countriesLookup.Ethiopia.Value, OtherValue1: countriesLookup.Ethiopia.Alpha_2Value, OtherValue2: countriesLookup.Ethiopia.Alpha_3Value, OtherValue3: countriesLookup.Ethiopia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.FalklandIslands.Name, OfficialName: countriesLookup.FalklandIslands.OfficialName, PluralName: countriesLookup.FalklandIslands.PluralName, Value: countriesLookup.FalklandIslands.Value, OtherValue1: countriesLookup.FalklandIslands.Alpha_2Value, OtherValue2: countriesLookup.FalklandIslands.Alpha_3Value, OtherValue3: countriesLookup.FalklandIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.FaroeIslands.Name, OfficialName: countriesLookup.FaroeIslands.OfficialName, PluralName: countriesLookup.FaroeIslands.PluralName, Value: countriesLookup.FaroeIslands.Value, OtherValue1: countriesLookup.FaroeIslands.Alpha_2Value, OtherValue2: countriesLookup.FaroeIslands.Alpha_3Value, OtherValue3: countriesLookup.FaroeIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Fiji.Name, OfficialName: countriesLookup.Fiji.OfficialName, PluralName: countriesLookup.Fiji.PluralName, Value: countriesLookup.Fiji.Value, OtherValue1: countriesLookup.Fiji.Alpha_2Value, OtherValue2: countriesLookup.Fiji.Alpha_3Value, OtherValue3: countriesLookup.Fiji.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Finland.Name, OfficialName: countriesLookup.Finland.OfficialName, PluralName: countriesLookup.Finland.PluralName, Value: countriesLookup.Finland.Value, OtherValue1: countriesLookup.Finland.Alpha_2Value, OtherValue2: countriesLookup.Finland.Alpha_3Value, OtherValue3: countriesLookup.Finland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.France.Name, OfficialName: countriesLookup.France.OfficialName, PluralName: countriesLookup.France.PluralName, Value: countriesLookup.France.Value, OtherValue1: countriesLookup.France.Alpha_2Value, OtherValue2: countriesLookup.France.Alpha_3Value, OtherValue3: countriesLookup.France.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.FrenchGuiana.Name, OfficialName: countriesLookup.FrenchGuiana.OfficialName, PluralName: countriesLookup.FrenchGuiana.PluralName, Value: countriesLookup.FrenchGuiana.Value, OtherValue1: countriesLookup.FrenchGuiana.Alpha_2Value, OtherValue2: countriesLookup.FrenchGuiana.Alpha_3Value, OtherValue3: countriesLookup.FrenchGuiana.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.FrenchPolynesia.Name, OfficialName: countriesLookup.FrenchPolynesia.OfficialName, PluralName: countriesLookup.FrenchPolynesia.PluralName, Value: countriesLookup.FrenchPolynesia.Value, OtherValue1: countriesLookup.FrenchPolynesia.Alpha_2Value, OtherValue2: countriesLookup.FrenchPolynesia.Alpha_3Value, OtherValue3: countriesLookup.FrenchPolynesia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.FrenchSouthernTerritories.Name, OfficialName: countriesLookup.FrenchSouthernTerritories.OfficialName, PluralName: countriesLookup.FrenchSouthernTerritories.PluralName, Value: countriesLookup.FrenchSouthernTerritories.Value, OtherValue1: countriesLookup.FrenchSouthernTerritories.Alpha_2Value, OtherValue2: countriesLookup.FrenchSouthernTerritories.Alpha_3Value, OtherValue3: countriesLookup.FrenchSouthernTerritories.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Gabon.Name, OfficialName: countriesLookup.Gabon.OfficialName, PluralName: countriesLookup.Gabon.PluralName, Value: countriesLookup.Gabon.Value, OtherValue1: countriesLookup.Gabon.Alpha_2Value, OtherValue2: countriesLookup.Gabon.Alpha_3Value, OtherValue3: countriesLookup.Gabon.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Gambia.Name, OfficialName: countriesLookup.Gambia.OfficialName, PluralName: countriesLookup.Gambia.PluralName, Value: countriesLookup.Gambia.Value, OtherValue1: countriesLookup.Gambia.Alpha_2Value, OtherValue2: countriesLookup.Gambia.Alpha_3Value, OtherValue3: countriesLookup.Gambia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Georgia.Name, OfficialName: countriesLookup.Georgia.OfficialName, PluralName: countriesLookup.Georgia.PluralName, Value: countriesLookup.Georgia.Value, OtherValue1: countriesLookup.Georgia.Alpha_2Value, OtherValue2: countriesLookup.Georgia.Alpha_3Value, OtherValue3: countriesLookup.Georgia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Germany.Name, OfficialName: countriesLookup.Germany.OfficialName, PluralName: countriesLookup.Germany.PluralName, Value: countriesLookup.Germany.Value, OtherValue1: countriesLookup.Germany.Alpha_2Value, OtherValue2: countriesLookup.Germany.Alpha_3Value, OtherValue3: countriesLookup.Germany.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Ghana.Name, OfficialName: countriesLookup.Ghana.OfficialName, PluralName: countriesLookup.Ghana.PluralName, Value: countriesLookup.Ghana.Value, OtherValue1: countriesLookup.Ghana.Alpha_2Value, OtherValue2: countriesLookup.Ghana.Alpha_3Value, OtherValue3: countriesLookup.Ghana.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Gibraltar.Name, OfficialName: countriesLookup.Gibraltar.OfficialName, PluralName: countriesLookup.Gibraltar.PluralName, Value: countriesLookup.Gibraltar.Value, OtherValue1: countriesLookup.Gibraltar.Alpha_2Value, OtherValue2: countriesLookup.Gibraltar.Alpha_3Value, OtherValue3: countriesLookup.Gibraltar.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Greece.Name, OfficialName: countriesLookup.Greece.OfficialName, PluralName: countriesLookup.Greece.PluralName, Value: countriesLookup.Greece.Value, OtherValue1: countriesLookup.Greece.Alpha_2Value, OtherValue2: countriesLookup.Greece.Alpha_3Value, OtherValue3: countriesLookup.Greece.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Greenland.Name, OfficialName: countriesLookup.Greenland.OfficialName, PluralName: countriesLookup.Greenland.PluralName, Value: countriesLookup.Greenland.Value, OtherValue1: countriesLookup.Greenland.Alpha_2Value, OtherValue2: countriesLookup.Greenland.Alpha_3Value, OtherValue3: countriesLookup.Greenland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Grenada.Name, OfficialName: countriesLookup.Grenada.OfficialName, PluralName: countriesLookup.Grenada.PluralName, Value: countriesLookup.Grenada.Value, OtherValue1: countriesLookup.Grenada.Alpha_2Value, OtherValue2: countriesLookup.Grenada.Alpha_3Value, OtherValue3: countriesLookup.Grenada.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guadeloupe.Name, OfficialName: countriesLookup.Guadeloupe.OfficialName, PluralName: countriesLookup.Guadeloupe.PluralName, Value: countriesLookup.Guadeloupe.Value, OtherValue1: countriesLookup.Guadeloupe.Alpha_2Value, OtherValue2: countriesLookup.Guadeloupe.Alpha_3Value, OtherValue3: countriesLookup.Guadeloupe.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guam.Name, OfficialName: countriesLookup.Guam.OfficialName, PluralName: countriesLookup.Guam.PluralName, Value: countriesLookup.Guam.Value, OtherValue1: countriesLookup.Guam.Alpha_2Value, OtherValue2: countriesLookup.Guam.Alpha_3Value, OtherValue3: countriesLookup.Guam.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guatemala.Name, OfficialName: countriesLookup.Guatemala.OfficialName, PluralName: countriesLookup.Guatemala.PluralName, Value: countriesLookup.Guatemala.Value, OtherValue1: countriesLookup.Guatemala.Alpha_2Value, OtherValue2: countriesLookup.Guatemala.Alpha_3Value, OtherValue3: countriesLookup.Guatemala.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guernsey.Name, OfficialName: countriesLookup.Guernsey.OfficialName, PluralName: countriesLookup.Guernsey.PluralName, Value: countriesLookup.Guernsey.Value, OtherValue1: countriesLookup.Guernsey.Alpha_2Value, OtherValue2: countriesLookup.Guernsey.Alpha_3Value, OtherValue3: countriesLookup.Guernsey.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guinea.Name, OfficialName: countriesLookup.Guinea.OfficialName, PluralName: countriesLookup.Guinea.PluralName, Value: countriesLookup.Guinea.Value, OtherValue1: countriesLookup.Guinea.Alpha_2Value, OtherValue2: countriesLookup.Guinea.Alpha_3Value, OtherValue3: countriesLookup.Guinea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.GuineaBissau.Name, OfficialName: countriesLookup.GuineaBissau.OfficialName, PluralName: countriesLookup.GuineaBissau.PluralName, Value: countriesLookup.GuineaBissau.Value, OtherValue1: countriesLookup.GuineaBissau.Alpha_2Value, OtherValue2: countriesLookup.GuineaBissau.Alpha_3Value, OtherValue3: countriesLookup.GuineaBissau.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Guyana.Name, OfficialName: countriesLookup.Guyana.OfficialName, PluralName: countriesLookup.Guyana.PluralName, Value: countriesLookup.Guyana.Value, OtherValue1: countriesLookup.Guyana.Alpha_2Value, OtherValue2: countriesLookup.Guyana.Alpha_3Value, OtherValue3: countriesLookup.Guyana.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Haiti.Name, OfficialName: countriesLookup.Haiti.OfficialName, PluralName: countriesLookup.Haiti.PluralName, Value: countriesLookup.Haiti.Value, OtherValue1: countriesLookup.Haiti.Alpha_2Value, OtherValue2: countriesLookup.Haiti.Alpha_3Value, OtherValue3: countriesLookup.Haiti.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.HeardIslandandMcDonaldIslands.Name, OfficialName: countriesLookup.HeardIslandandMcDonaldIslands.OfficialName, PluralName: countriesLookup.HeardIslandandMcDonaldIslands.PluralName, Value: countriesLookup.HeardIslandandMcDonaldIslands.Value, OtherValue1: countriesLookup.HeardIslandandMcDonaldIslands.Alpha_2Value, OtherValue2: countriesLookup.HeardIslandandMcDonaldIslands.Alpha_3Value, OtherValue3: countriesLookup.HeardIslandandMcDonaldIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Honduras.Name, OfficialName: countriesLookup.Honduras.OfficialName, PluralName: countriesLookup.Honduras.PluralName, Value: countriesLookup.Honduras.Value, OtherValue1: countriesLookup.Honduras.Alpha_2Value, OtherValue2: countriesLookup.Honduras.Alpha_3Value, OtherValue3: countriesLookup.Honduras.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.HongKong.Name, OfficialName: countriesLookup.HongKong.OfficialName, PluralName: countriesLookup.HongKong.PluralName, Value: countriesLookup.HongKong.Value, OtherValue1: countriesLookup.HongKong.Alpha_2Value, OtherValue2: countriesLookup.HongKong.Alpha_3Value, OtherValue3: countriesLookup.HongKong.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Hungary.Name, OfficialName: countriesLookup.Hungary.OfficialName, PluralName: countriesLookup.Hungary.PluralName, Value: countriesLookup.Hungary.Value, OtherValue1: countriesLookup.Hungary.Alpha_2Value, OtherValue2: countriesLookup.Hungary.Alpha_3Value, OtherValue3: countriesLookup.Hungary.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Iceland.Name, OfficialName: countriesLookup.Iceland.OfficialName, PluralName: countriesLookup.Iceland.PluralName, Value: countriesLookup.Iceland.Value, OtherValue1: countriesLookup.Iceland.Alpha_2Value, OtherValue2: countriesLookup.Iceland.Alpha_3Value, OtherValue3: countriesLookup.Iceland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.India.Name, OfficialName: countriesLookup.India.OfficialName, PluralName: countriesLookup.India.PluralName, Value: countriesLookup.India.Value, OtherValue1: countriesLookup.India.Alpha_2Value, OtherValue2: countriesLookup.India.Alpha_3Value, OtherValue3: countriesLookup.India.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Indonesia.Name, OfficialName: countriesLookup.Indonesia.OfficialName, PluralName: countriesLookup.Indonesia.PluralName, Value: countriesLookup.Indonesia.Value, OtherValue1: countriesLookup.Indonesia.Alpha_2Value, OtherValue2: countriesLookup.Indonesia.Alpha_3Value, OtherValue3: countriesLookup.Indonesia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Iran.Name, OfficialName: countriesLookup.Iran.OfficialName, PluralName: countriesLookup.Iran.PluralName, Value: countriesLookup.Iran.Value, OtherValue1: countriesLookup.Iran.Alpha_2Value, OtherValue2: countriesLookup.Iran.Alpha_3Value, OtherValue3: countriesLookup.Iran.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Iraq.Name, OfficialName: countriesLookup.Iraq.OfficialName, PluralName: countriesLookup.Iraq.PluralName, Value: countriesLookup.Iraq.Value, OtherValue1: countriesLookup.Iraq.Alpha_2Value, OtherValue2: countriesLookup.Iraq.Alpha_3Value, OtherValue3: countriesLookup.Iraq.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Ireland.Name, OfficialName: countriesLookup.Ireland.OfficialName, PluralName: countriesLookup.Ireland.PluralName, Value: countriesLookup.Ireland.Value, OtherValue1: countriesLookup.Ireland.Alpha_2Value, OtherValue2: countriesLookup.Ireland.Alpha_3Value, OtherValue3: countriesLookup.Ireland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.IsleofMan.Name, OfficialName: countriesLookup.IsleofMan.OfficialName, PluralName: countriesLookup.IsleofMan.PluralName, Value: countriesLookup.IsleofMan.Value, OtherValue1: countriesLookup.IsleofMan.Alpha_2Value, OtherValue2: countriesLookup.IsleofMan.Alpha_3Value, OtherValue3: countriesLookup.IsleofMan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Israel.Name, OfficialName: countriesLookup.Israel.OfficialName, PluralName: countriesLookup.Israel.PluralName, Value: countriesLookup.Israel.Value, OtherValue1: countriesLookup.Israel.Alpha_2Value, OtherValue2: countriesLookup.Israel.Alpha_3Value, OtherValue3: countriesLookup.Israel.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Italy.Name, OfficialName: countriesLookup.Italy.OfficialName, PluralName: countriesLookup.Italy.PluralName, Value: countriesLookup.Italy.Value, OtherValue1: countriesLookup.Italy.Alpha_2Value, OtherValue2: countriesLookup.Italy.Alpha_3Value, OtherValue3: countriesLookup.Italy.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Jamaica.Name, OfficialName: countriesLookup.Jamaica.OfficialName, PluralName: countriesLookup.Jamaica.PluralName, Value: countriesLookup.Jamaica.Value, OtherValue1: countriesLookup.Jamaica.Alpha_2Value, OtherValue2: countriesLookup.Jamaica.Alpha_3Value, OtherValue3: countriesLookup.Jamaica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Japan.Name, OfficialName: countriesLookup.Japan.OfficialName, PluralName: countriesLookup.Japan.PluralName, Value: countriesLookup.Japan.Value, OtherValue1: countriesLookup.Japan.Alpha_2Value, OtherValue2: countriesLookup.Japan.Alpha_3Value, OtherValue3: countriesLookup.Japan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Jersey.Name, OfficialName: countriesLookup.Jersey.OfficialName, PluralName: countriesLookup.Jersey.PluralName, Value: countriesLookup.Jersey.Value, OtherValue1: countriesLookup.Jersey.Alpha_2Value, OtherValue2: countriesLookup.Jersey.Alpha_3Value, OtherValue3: countriesLookup.Jersey.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Jordan.Name, OfficialName: countriesLookup.Jordan.OfficialName, PluralName: countriesLookup.Jordan.PluralName, Value: countriesLookup.Jordan.Value, OtherValue1: countriesLookup.Jordan.Alpha_2Value, OtherValue2: countriesLookup.Jordan.Alpha_3Value, OtherValue3: countriesLookup.Jordan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Kazakhstan.Name, OfficialName: countriesLookup.Kazakhstan.OfficialName, PluralName: countriesLookup.Kazakhstan.PluralName, Value: countriesLookup.Kazakhstan.Value, OtherValue1: countriesLookup.Kazakhstan.Alpha_2Value, OtherValue2: countriesLookup.Kazakhstan.Alpha_3Value, OtherValue3: countriesLookup.Kazakhstan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Kenya.Name, OfficialName: countriesLookup.Kenya.OfficialName, PluralName: countriesLookup.Kenya.PluralName, Value: countriesLookup.Kenya.Value, OtherValue1: countriesLookup.Kenya.Alpha_2Value, OtherValue2: countriesLookup.Kenya.Alpha_3Value, OtherValue3: countriesLookup.Kenya.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Kiribati.Name, OfficialName: countriesLookup.Kiribati.OfficialName, PluralName: countriesLookup.Kiribati.PluralName, Value: countriesLookup.Kiribati.Value, OtherValue1: countriesLookup.Kiribati.Alpha_2Value, OtherValue2: countriesLookup.Kiribati.Alpha_3Value, OtherValue3: countriesLookup.Kiribati.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NorthKorea.Name, OfficialName: countriesLookup.NorthKorea.OfficialName, PluralName: countriesLookup.NorthKorea.PluralName, Value: countriesLookup.NorthKorea.Value, OtherValue1: countriesLookup.NorthKorea.Alpha_2Value, OtherValue2: countriesLookup.NorthKorea.Alpha_3Value, OtherValue3: countriesLookup.NorthKorea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SouthKorea.Name, OfficialName: countriesLookup.SouthKorea.OfficialName, PluralName: countriesLookup.SouthKorea.PluralName, Value: countriesLookup.SouthKorea.Value, OtherValue1: countriesLookup.SouthKorea.Alpha_2Value, OtherValue2: countriesLookup.SouthKorea.Alpha_3Value, OtherValue3: countriesLookup.SouthKorea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Kuwait.Name, OfficialName: countriesLookup.Kuwait.OfficialName, PluralName: countriesLookup.Kuwait.PluralName, Value: countriesLookup.Kuwait.Value, OtherValue1: countriesLookup.Kuwait.Alpha_2Value, OtherValue2: countriesLookup.Kuwait.Alpha_3Value, OtherValue3: countriesLookup.Kuwait.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Kyrgyzstan.Name, OfficialName: countriesLookup.Kyrgyzstan.OfficialName, PluralName: countriesLookup.Kyrgyzstan.PluralName, Value: countriesLookup.Kyrgyzstan.Value, OtherValue1: countriesLookup.Kyrgyzstan.Alpha_2Value, OtherValue2: countriesLookup.Kyrgyzstan.Alpha_3Value, OtherValue3: countriesLookup.Kyrgyzstan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Laos.Name, OfficialName: countriesLookup.Laos.OfficialName, PluralName: countriesLookup.Laos.PluralName, Value: countriesLookup.Laos.Value, OtherValue1: countriesLookup.Laos.Alpha_2Value, OtherValue2: countriesLookup.Laos.Alpha_3Value, OtherValue3: countriesLookup.Laos.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Latvia.Name, OfficialName: countriesLookup.Latvia.OfficialName, PluralName: countriesLookup.Latvia.PluralName, Value: countriesLookup.Latvia.Value, OtherValue1: countriesLookup.Latvia.Alpha_2Value, OtherValue2: countriesLookup.Latvia.Alpha_3Value, OtherValue3: countriesLookup.Latvia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Lebanon.Name, OfficialName: countriesLookup.Lebanon.OfficialName, PluralName: countriesLookup.Lebanon.PluralName, Value: countriesLookup.Lebanon.Value, OtherValue1: countriesLookup.Lebanon.Alpha_2Value, OtherValue2: countriesLookup.Lebanon.Alpha_3Value, OtherValue3: countriesLookup.Lebanon.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Lesotho.Name, OfficialName: countriesLookup.Lesotho.OfficialName, PluralName: countriesLookup.Lesotho.PluralName, Value: countriesLookup.Lesotho.Value, OtherValue1: countriesLookup.Lesotho.Alpha_2Value, OtherValue2: countriesLookup.Lesotho.Alpha_3Value, OtherValue3: countriesLookup.Lesotho.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Liberia.Name, OfficialName: countriesLookup.Liberia.OfficialName, PluralName: countriesLookup.Liberia.PluralName, Value: countriesLookup.Liberia.Value, OtherValue1: countriesLookup.Liberia.Alpha_2Value, OtherValue2: countriesLookup.Liberia.Alpha_3Value, OtherValue3: countriesLookup.Liberia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Libya.Name, OfficialName: countriesLookup.Libya.OfficialName, PluralName: countriesLookup.Libya.PluralName, Value: countriesLookup.Libya.Value, OtherValue1: countriesLookup.Libya.Alpha_2Value, OtherValue2: countriesLookup.Libya.Alpha_3Value, OtherValue3: countriesLookup.Libya.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Liechtenstein.Name, OfficialName: countriesLookup.Liechtenstein.OfficialName, PluralName: countriesLookup.Liechtenstein.PluralName, Value: countriesLookup.Liechtenstein.Value, OtherValue1: countriesLookup.Liechtenstein.Alpha_2Value, OtherValue2: countriesLookup.Liechtenstein.Alpha_3Value, OtherValue3: countriesLookup.Liechtenstein.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Lithuania.Name, OfficialName: countriesLookup.Lithuania.OfficialName, PluralName: countriesLookup.Lithuania.PluralName, Value: countriesLookup.Lithuania.Value, OtherValue1: countriesLookup.Lithuania.Alpha_2Value, OtherValue2: countriesLookup.Lithuania.Alpha_3Value, OtherValue3: countriesLookup.Lithuania.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Luxembourg.Name, OfficialName: countriesLookup.Luxembourg.OfficialName, PluralName: countriesLookup.Luxembourg.PluralName, Value: countriesLookup.Luxembourg.Value, OtherValue1: countriesLookup.Luxembourg.Alpha_2Value, OtherValue2: countriesLookup.Luxembourg.Alpha_3Value, OtherValue3: countriesLookup.Luxembourg.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Macao.Name, OfficialName: countriesLookup.Macao.OfficialName, PluralName: countriesLookup.Macao.PluralName, Value: countriesLookup.Macao.Value, OtherValue1: countriesLookup.Macao.Alpha_2Value, OtherValue2: countriesLookup.Macao.Alpha_3Value, OtherValue3: countriesLookup.Macao.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Madagascar.Name, OfficialName: countriesLookup.Madagascar.OfficialName, PluralName: countriesLookup.Madagascar.PluralName, Value: countriesLookup.Madagascar.Value, OtherValue1: countriesLookup.Madagascar.Alpha_2Value, OtherValue2: countriesLookup.Madagascar.Alpha_3Value, OtherValue3: countriesLookup.Madagascar.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Malawi.Name, OfficialName: countriesLookup.Malawi.OfficialName, PluralName: countriesLookup.Malawi.PluralName, Value: countriesLookup.Malawi.Value, OtherValue1: countriesLookup.Malawi.Alpha_2Value, OtherValue2: countriesLookup.Malawi.Alpha_3Value, OtherValue3: countriesLookup.Malawi.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Malaysia.Name, OfficialName: countriesLookup.Malaysia.OfficialName, PluralName: countriesLookup.Malaysia.PluralName, Value: countriesLookup.Malaysia.Value, OtherValue1: countriesLookup.Malaysia.Alpha_2Value, OtherValue2: countriesLookup.Malaysia.Alpha_3Value, OtherValue3: countriesLookup.Malaysia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Maldives.Name, OfficialName: countriesLookup.Maldives.OfficialName, PluralName: countriesLookup.Maldives.PluralName, Value: countriesLookup.Maldives.Value, OtherValue1: countriesLookup.Maldives.Alpha_2Value, OtherValue2: countriesLookup.Maldives.Alpha_3Value, OtherValue3: countriesLookup.Maldives.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mali.Name, OfficialName: countriesLookup.Mali.OfficialName, PluralName: countriesLookup.Mali.PluralName, Value: countriesLookup.Mali.Value, OtherValue1: countriesLookup.Mali.Alpha_2Value, OtherValue2: countriesLookup.Mali.Alpha_3Value, OtherValue3: countriesLookup.Mali.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Malta.Name, OfficialName: countriesLookup.Malta.OfficialName, PluralName: countriesLookup.Malta.PluralName, Value: countriesLookup.Malta.Value, OtherValue1: countriesLookup.Malta.Alpha_2Value, OtherValue2: countriesLookup.Malta.Alpha_3Value, OtherValue3: countriesLookup.Malta.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.MarshallIslands.Name, OfficialName: countriesLookup.MarshallIslands.OfficialName, PluralName: countriesLookup.MarshallIslands.PluralName, Value: countriesLookup.MarshallIslands.Value, OtherValue1: countriesLookup.MarshallIslands.Alpha_2Value, OtherValue2: countriesLookup.MarshallIslands.Alpha_3Value, OtherValue3: countriesLookup.MarshallIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Martinique.Name, OfficialName: countriesLookup.Martinique.OfficialName, PluralName: countriesLookup.Martinique.PluralName, Value: countriesLookup.Martinique.Value, OtherValue1: countriesLookup.Martinique.Alpha_2Value, OtherValue2: countriesLookup.Martinique.Alpha_3Value, OtherValue3: countriesLookup.Martinique.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mauritania.Name, OfficialName: countriesLookup.Mauritania.OfficialName, PluralName: countriesLookup.Mauritania.PluralName, Value: countriesLookup.Mauritania.Value, OtherValue1: countriesLookup.Mauritania.Alpha_2Value, OtherValue2: countriesLookup.Mauritania.Alpha_3Value, OtherValue3: countriesLookup.Mauritania.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mauritius.Name, OfficialName: countriesLookup.Mauritius.OfficialName, PluralName: countriesLookup.Mauritius.PluralName, Value: countriesLookup.Mauritius.Value, OtherValue1: countriesLookup.Mauritius.Alpha_2Value, OtherValue2: countriesLookup.Mauritius.Alpha_3Value, OtherValue3: countriesLookup.Mauritius.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mayotte.Name, OfficialName: countriesLookup.Mayotte.OfficialName, PluralName: countriesLookup.Mayotte.PluralName, Value: countriesLookup.Mayotte.Value, OtherValue1: countriesLookup.Mayotte.Alpha_2Value, OtherValue2: countriesLookup.Mayotte.Alpha_3Value, OtherValue3: countriesLookup.Mayotte.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mexico.Name, OfficialName: countriesLookup.Mexico.OfficialName, PluralName: countriesLookup.Mexico.PluralName, Value: countriesLookup.Mexico.Value, OtherValue1: countriesLookup.Mexico.Alpha_2Value, OtherValue2: countriesLookup.Mexico.Alpha_3Value, OtherValue3: countriesLookup.Mexico.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Micronesia.Name, OfficialName: countriesLookup.Micronesia.OfficialName, PluralName: countriesLookup.Micronesia.PluralName, Value: countriesLookup.Micronesia.Value, OtherValue1: countriesLookup.Micronesia.Alpha_2Value, OtherValue2: countriesLookup.Micronesia.Alpha_3Value, OtherValue3: countriesLookup.Micronesia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Moldova.Name, OfficialName: countriesLookup.Moldova.OfficialName, PluralName: countriesLookup.Moldova.PluralName, Value: countriesLookup.Moldova.Value, OtherValue1: countriesLookup.Moldova.Alpha_2Value, OtherValue2: countriesLookup.Moldova.Alpha_3Value, OtherValue3: countriesLookup.Moldova.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Monaco.Name, OfficialName: countriesLookup.Monaco.OfficialName, PluralName: countriesLookup.Monaco.PluralName, Value: countriesLookup.Monaco.Value, OtherValue1: countriesLookup.Monaco.Alpha_2Value, OtherValue2: countriesLookup.Monaco.Alpha_3Value, OtherValue3: countriesLookup.Monaco.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mongolia.Name, OfficialName: countriesLookup.Mongolia.OfficialName, PluralName: countriesLookup.Mongolia.PluralName, Value: countriesLookup.Mongolia.Value, OtherValue1: countriesLookup.Mongolia.Alpha_2Value, OtherValue2: countriesLookup.Mongolia.Alpha_3Value, OtherValue3: countriesLookup.Mongolia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Montenegro.Name, OfficialName: countriesLookup.Montenegro.OfficialName, PluralName: countriesLookup.Montenegro.PluralName, Value: countriesLookup.Montenegro.Value, OtherValue1: countriesLookup.Montenegro.Alpha_2Value, OtherValue2: countriesLookup.Montenegro.Alpha_3Value, OtherValue3: countriesLookup.Montenegro.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Montserrat.Name, OfficialName: countriesLookup.Montserrat.OfficialName, PluralName: countriesLookup.Montserrat.PluralName, Value: countriesLookup.Montserrat.Value, OtherValue1: countriesLookup.Montserrat.Alpha_2Value, OtherValue2: countriesLookup.Montserrat.Alpha_3Value, OtherValue3: countriesLookup.Montserrat.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Morocco.Name, OfficialName: countriesLookup.Morocco.OfficialName, PluralName: countriesLookup.Morocco.PluralName, Value: countriesLookup.Morocco.Value, OtherValue1: countriesLookup.Morocco.Alpha_2Value, OtherValue2: countriesLookup.Morocco.Alpha_3Value, OtherValue3: countriesLookup.Morocco.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Mozambique.Name, OfficialName: countriesLookup.Mozambique.OfficialName, PluralName: countriesLookup.Mozambique.PluralName, Value: countriesLookup.Mozambique.Value, OtherValue1: countriesLookup.Mozambique.Alpha_2Value, OtherValue2: countriesLookup.Mozambique.Alpha_3Value, OtherValue3: countriesLookup.Mozambique.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Myanmar.Name, OfficialName: countriesLookup.Myanmar.OfficialName, PluralName: countriesLookup.Myanmar.PluralName, Value: countriesLookup.Myanmar.Value, OtherValue1: countriesLookup.Myanmar.Alpha_2Value, OtherValue2: countriesLookup.Myanmar.Alpha_3Value, OtherValue3: countriesLookup.Myanmar.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Namibia.Name, OfficialName: countriesLookup.Namibia.OfficialName, PluralName: countriesLookup.Namibia.PluralName, Value: countriesLookup.Namibia.Value, OtherValue1: countriesLookup.Namibia.Alpha_2Value, OtherValue2: countriesLookup.Namibia.Alpha_3Value, OtherValue3: countriesLookup.Namibia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Nauru.Name, OfficialName: countriesLookup.Nauru.OfficialName, PluralName: countriesLookup.Nauru.PluralName, Value: countriesLookup.Nauru.Value, OtherValue1: countriesLookup.Nauru.Alpha_2Value, OtherValue2: countriesLookup.Nauru.Alpha_3Value, OtherValue3: countriesLookup.Nauru.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Nepal.Name, OfficialName: countriesLookup.Nepal.OfficialName, PluralName: countriesLookup.Nepal.PluralName, Value: countriesLookup.Nepal.Value, OtherValue1: countriesLookup.Nepal.Alpha_2Value, OtherValue2: countriesLookup.Nepal.Alpha_3Value, OtherValue3: countriesLookup.Nepal.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Netherlands.Name, OfficialName: countriesLookup.Netherlands.OfficialName, PluralName: countriesLookup.Netherlands.PluralName, Value: countriesLookup.Netherlands.Value, OtherValue1: countriesLookup.Netherlands.Alpha_2Value, OtherValue2: countriesLookup.Netherlands.Alpha_3Value, OtherValue3: countriesLookup.Netherlands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NewCaledonia.Name, OfficialName: countriesLookup.NewCaledonia.OfficialName, PluralName: countriesLookup.NewCaledonia.PluralName, Value: countriesLookup.NewCaledonia.Value, OtherValue1: countriesLookup.NewCaledonia.Alpha_2Value, OtherValue2: countriesLookup.NewCaledonia.Alpha_3Value, OtherValue3: countriesLookup.NewCaledonia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NewZealand.Name, OfficialName: countriesLookup.NewZealand.OfficialName, PluralName: countriesLookup.NewZealand.PluralName, Value: countriesLookup.NewZealand.Value, OtherValue1: countriesLookup.NewZealand.Alpha_2Value, OtherValue2: countriesLookup.NewZealand.Alpha_3Value, OtherValue3: countriesLookup.NewZealand.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Nicaragua.Name, OfficialName: countriesLookup.Nicaragua.OfficialName, PluralName: countriesLookup.Nicaragua.PluralName, Value: countriesLookup.Nicaragua.Value, OtherValue1: countriesLookup.Nicaragua.Alpha_2Value, OtherValue2: countriesLookup.Nicaragua.Alpha_3Value, OtherValue3: countriesLookup.Nicaragua.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Niger.Name, OfficialName: countriesLookup.Niger.OfficialName, PluralName: countriesLookup.Niger.PluralName, Value: countriesLookup.Niger.Value, OtherValue1: countriesLookup.Niger.Alpha_2Value, OtherValue2: countriesLookup.Niger.Alpha_3Value, OtherValue3: countriesLookup.Niger.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Nigeria.Name, OfficialName: countriesLookup.Nigeria.OfficialName, PluralName: countriesLookup.Nigeria.PluralName, Value: countriesLookup.Nigeria.Value, OtherValue1: countriesLookup.Nigeria.Alpha_2Value, OtherValue2: countriesLookup.Nigeria.Alpha_3Value, OtherValue3: countriesLookup.Nigeria.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Niue.Name, OfficialName: countriesLookup.Niue.OfficialName, PluralName: countriesLookup.Niue.PluralName, Value: countriesLookup.Niue.Value, OtherValue1: countriesLookup.Niue.Alpha_2Value, OtherValue2: countriesLookup.Niue.Alpha_3Value, OtherValue3: countriesLookup.Niue.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NorfolkIsland.Name, OfficialName: countriesLookup.NorfolkIsland.OfficialName, PluralName: countriesLookup.NorfolkIsland.PluralName, Value: countriesLookup.NorfolkIsland.Value, OtherValue1: countriesLookup.NorfolkIsland.Alpha_2Value, OtherValue2: countriesLookup.NorfolkIsland.Alpha_3Value, OtherValue3: countriesLookup.NorfolkIsland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NorthMacedonia.Name, OfficialName: countriesLookup.NorthMacedonia.OfficialName, PluralName: countriesLookup.NorthMacedonia.PluralName, Value: countriesLookup.NorthMacedonia.Value, OtherValue1: countriesLookup.NorthMacedonia.Alpha_2Value, OtherValue2: countriesLookup.NorthMacedonia.Alpha_3Value, OtherValue3: countriesLookup.NorthMacedonia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.NorthernMarianaIslands.Name, OfficialName: countriesLookup.NorthernMarianaIslands.OfficialName, PluralName: countriesLookup.NorthernMarianaIslands.PluralName, Value: countriesLookup.NorthernMarianaIslands.Value, OtherValue1: countriesLookup.NorthernMarianaIslands.Alpha_2Value, OtherValue2: countriesLookup.NorthernMarianaIslands.Alpha_3Value, OtherValue3: countriesLookup.NorthernMarianaIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Norway.Name, OfficialName: countriesLookup.Norway.OfficialName, PluralName: countriesLookup.Norway.PluralName, Value: countriesLookup.Norway.Value, OtherValue1: countriesLookup.Norway.Alpha_2Value, OtherValue2: countriesLookup.Norway.Alpha_3Value, OtherValue3: countriesLookup.Norway.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Oman.Name, OfficialName: countriesLookup.Oman.OfficialName, PluralName: countriesLookup.Oman.PluralName, Value: countriesLookup.Oman.Value, OtherValue1: countriesLookup.Oman.Alpha_2Value, OtherValue2: countriesLookup.Oman.Alpha_3Value, OtherValue3: countriesLookup.Oman.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Pakistan.Name, OfficialName: countriesLookup.Pakistan.OfficialName, PluralName: countriesLookup.Pakistan.PluralName, Value: countriesLookup.Pakistan.Value, OtherValue1: countriesLookup.Pakistan.Alpha_2Value, OtherValue2: countriesLookup.Pakistan.Alpha_3Value, OtherValue3: countriesLookup.Pakistan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Palau.Name, OfficialName: countriesLookup.Palau.OfficialName, PluralName: countriesLookup.Palau.PluralName, Value: countriesLookup.Palau.Value, OtherValue1: countriesLookup.Palau.Alpha_2Value, OtherValue2: countriesLookup.Palau.Alpha_3Value, OtherValue3: countriesLookup.Palau.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Palestine.Name, OfficialName: countriesLookup.Palestine.OfficialName, PluralName: countriesLookup.Palestine.PluralName, Value: countriesLookup.Palestine.Value, OtherValue1: countriesLookup.Palestine.Alpha_2Value, OtherValue2: countriesLookup.Palestine.Alpha_3Value, OtherValue3: countriesLookup.Palestine.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Panama.Name, OfficialName: countriesLookup.Panama.OfficialName, PluralName: countriesLookup.Panama.PluralName, Value: countriesLookup.Panama.Value, OtherValue1: countriesLookup.Panama.Alpha_2Value, OtherValue2: countriesLookup.Panama.Alpha_3Value, OtherValue3: countriesLookup.Panama.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.PapuaNewGuinea.Name, OfficialName: countriesLookup.PapuaNewGuinea.OfficialName, PluralName: countriesLookup.PapuaNewGuinea.PluralName, Value: countriesLookup.PapuaNewGuinea.Value, OtherValue1: countriesLookup.PapuaNewGuinea.Alpha_2Value, OtherValue2: countriesLookup.PapuaNewGuinea.Alpha_3Value, OtherValue3: countriesLookup.PapuaNewGuinea.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Paraguay.Name, OfficialName: countriesLookup.Paraguay.OfficialName, PluralName: countriesLookup.Paraguay.PluralName, Value: countriesLookup.Paraguay.Value, OtherValue1: countriesLookup.Paraguay.Alpha_2Value, OtherValue2: countriesLookup.Paraguay.Alpha_3Value, OtherValue3: countriesLookup.Paraguay.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Peru.Name, OfficialName: countriesLookup.Peru.OfficialName, PluralName: countriesLookup.Peru.PluralName, Value: countriesLookup.Peru.Value, OtherValue1: countriesLookup.Peru.Alpha_2Value, OtherValue2: countriesLookup.Peru.Alpha_3Value, OtherValue3: countriesLookup.Peru.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Philippines.Name, OfficialName: countriesLookup.Philippines.OfficialName, PluralName: countriesLookup.Philippines.PluralName, Value: countriesLookup.Philippines.Value, OtherValue1: countriesLookup.Philippines.Alpha_2Value, OtherValue2: countriesLookup.Philippines.Alpha_3Value, OtherValue3: countriesLookup.Philippines.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Poland.Name, OfficialName: countriesLookup.Poland.OfficialName, PluralName: countriesLookup.Poland.PluralName, Value: countriesLookup.Poland.Value, OtherValue1: countriesLookup.Poland.Alpha_2Value, OtherValue2: countriesLookup.Poland.Alpha_3Value, OtherValue3: countriesLookup.Poland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Portugal.Name, OfficialName: countriesLookup.Portugal.OfficialName, PluralName: countriesLookup.Portugal.PluralName, Value: countriesLookup.Portugal.Value, OtherValue1: countriesLookup.Portugal.Alpha_2Value, OtherValue2: countriesLookup.Portugal.Alpha_3Value, OtherValue3: countriesLookup.Portugal.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.PuertoRico.Name, OfficialName: countriesLookup.PuertoRico.OfficialName, PluralName: countriesLookup.PuertoRico.PluralName, Value: countriesLookup.PuertoRico.Value, OtherValue1: countriesLookup.PuertoRico.Alpha_2Value, OtherValue2: countriesLookup.PuertoRico.Alpha_3Value, OtherValue3: countriesLookup.PuertoRico.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Qatar.Name, OfficialName: countriesLookup.Qatar.OfficialName, PluralName: countriesLookup.Qatar.PluralName, Value: countriesLookup.Qatar.Value, OtherValue1: countriesLookup.Qatar.Alpha_2Value, OtherValue2: countriesLookup.Qatar.Alpha_3Value, OtherValue3: countriesLookup.Qatar.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Reunion.Name, OfficialName: countriesLookup.Reunion.OfficialName, PluralName: countriesLookup.Reunion.PluralName, Value: countriesLookup.Reunion.Value, OtherValue1: countriesLookup.Reunion.Alpha_2Value, OtherValue2: countriesLookup.Reunion.Alpha_3Value, OtherValue3: countriesLookup.Reunion.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Romania.Name, OfficialName: countriesLookup.Romania.OfficialName, PluralName: countriesLookup.Romania.PluralName, Value: countriesLookup.Romania.Value, OtherValue1: countriesLookup.Romania.Alpha_2Value, OtherValue2: countriesLookup.Romania.Alpha_3Value, OtherValue3: countriesLookup.Romania.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.RussianFederation.Name, OfficialName: countriesLookup.RussianFederation.OfficialName, PluralName: countriesLookup.RussianFederation.PluralName, Value: countriesLookup.RussianFederation.Value, OtherValue1: countriesLookup.RussianFederation.Alpha_2Value, OtherValue2: countriesLookup.RussianFederation.Alpha_3Value, OtherValue3: countriesLookup.RussianFederation.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Rwanda.Name, OfficialName: countriesLookup.Rwanda.OfficialName, PluralName: countriesLookup.Rwanda.PluralName, Value: countriesLookup.Rwanda.Value, OtherValue1: countriesLookup.Rwanda.Alpha_2Value, OtherValue2: countriesLookup.Rwanda.Alpha_3Value, OtherValue3: countriesLookup.Rwanda.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintBarthelemy.Name, OfficialName: countriesLookup.SaintBarthelemy.OfficialName, PluralName: countriesLookup.SaintBarthelemy.PluralName, Value: countriesLookup.SaintBarthelemy.Value, OtherValue1: countriesLookup.SaintBarthelemy.Alpha_2Value, OtherValue2: countriesLookup.SaintBarthelemy.Alpha_3Value, OtherValue3: countriesLookup.SaintBarthelemy.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintHelena.Name, OfficialName: countriesLookup.SaintHelena.OfficialName, PluralName: countriesLookup.SaintHelena.PluralName, Value: countriesLookup.SaintHelena.Value, OtherValue1: countriesLookup.SaintHelena.Alpha_2Value, OtherValue2: countriesLookup.SaintHelena.Alpha_3Value, OtherValue3: countriesLookup.SaintHelena.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintKittsandNevis.Name, OfficialName: countriesLookup.SaintKittsandNevis.OfficialName, PluralName: countriesLookup.SaintKittsandNevis.PluralName, Value: countriesLookup.SaintKittsandNevis.Value, OtherValue1: countriesLookup.SaintKittsandNevis.Alpha_2Value, OtherValue2: countriesLookup.SaintKittsandNevis.Alpha_3Value, OtherValue3: countriesLookup.SaintKittsandNevis.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintLucia.Name, OfficialName: countriesLookup.SaintLucia.OfficialName, PluralName: countriesLookup.SaintLucia.PluralName, Value: countriesLookup.SaintLucia.Value, OtherValue1: countriesLookup.SaintLucia.Alpha_2Value, OtherValue2: countriesLookup.SaintLucia.Alpha_3Value, OtherValue3: countriesLookup.SaintLucia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintMartin.Name, OfficialName: countriesLookup.SaintMartin.OfficialName, PluralName: countriesLookup.SaintMartin.PluralName, Value: countriesLookup.SaintMartin.Value, OtherValue1: countriesLookup.SaintMartin.Alpha_2Value, OtherValue2: countriesLookup.SaintMartin.Alpha_3Value, OtherValue3: countriesLookup.SaintMartin.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintPierreandMiquelon.Name, OfficialName: countriesLookup.SaintPierreandMiquelon.OfficialName, PluralName: countriesLookup.SaintPierreandMiquelon.PluralName, Value: countriesLookup.SaintPierreandMiquelon.Value, OtherValue1: countriesLookup.SaintPierreandMiquelon.Alpha_2Value, OtherValue2: countriesLookup.SaintPierreandMiquelon.Alpha_3Value, OtherValue3: countriesLookup.SaintPierreandMiquelon.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaintVincentandtheGrenadines.Name, OfficialName: countriesLookup.SaintVincentandtheGrenadines.OfficialName, PluralName: countriesLookup.SaintVincentandtheGrenadines.PluralName, Value: countriesLookup.SaintVincentandtheGrenadines.Value, OtherValue1: countriesLookup.SaintVincentandtheGrenadines.Alpha_2Value, OtherValue2: countriesLookup.SaintVincentandtheGrenadines.Alpha_3Value, OtherValue3: countriesLookup.SaintVincentandtheGrenadines.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Samoa.Name, OfficialName: countriesLookup.Samoa.OfficialName, PluralName: countriesLookup.Samoa.PluralName, Value: countriesLookup.Samoa.Value, OtherValue1: countriesLookup.Samoa.Alpha_2Value, OtherValue2: countriesLookup.Samoa.Alpha_3Value, OtherValue3: countriesLookup.Samoa.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SanMarino.Name, OfficialName: countriesLookup.SanMarino.OfficialName, PluralName: countriesLookup.SanMarino.PluralName, Value: countriesLookup.SanMarino.Value, OtherValue1: countriesLookup.SanMarino.Alpha_2Value, OtherValue2: countriesLookup.SanMarino.Alpha_3Value, OtherValue3: countriesLookup.SanMarino.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaoTomeandPrincipe.Name, OfficialName: countriesLookup.SaoTomeandPrincipe.OfficialName, PluralName: countriesLookup.SaoTomeandPrincipe.PluralName, Value: countriesLookup.SaoTomeandPrincipe.Value, OtherValue1: countriesLookup.SaoTomeandPrincipe.Alpha_2Value, OtherValue2: countriesLookup.SaoTomeandPrincipe.Alpha_3Value, OtherValue3: countriesLookup.SaoTomeandPrincipe.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SaudiArabia.Name, OfficialName: countriesLookup.SaudiArabia.OfficialName, PluralName: countriesLookup.SaudiArabia.PluralName, Value: countriesLookup.SaudiArabia.Value, OtherValue1: countriesLookup.SaudiArabia.Alpha_2Value, OtherValue2: countriesLookup.SaudiArabia.Alpha_3Value, OtherValue3: countriesLookup.SaudiArabia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Senegal.Name, OfficialName: countriesLookup.Senegal.OfficialName, PluralName: countriesLookup.Senegal.PluralName, Value: countriesLookup.Senegal.Value, OtherValue1: countriesLookup.Senegal.Alpha_2Value, OtherValue2: countriesLookup.Senegal.Alpha_3Value, OtherValue3: countriesLookup.Senegal.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Serbia.Name, OfficialName: countriesLookup.Serbia.OfficialName, PluralName: countriesLookup.Serbia.PluralName, Value: countriesLookup.Serbia.Value, OtherValue1: countriesLookup.Serbia.Alpha_2Value, OtherValue2: countriesLookup.Serbia.Alpha_3Value, OtherValue3: countriesLookup.Serbia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Seychelles.Name, OfficialName: countriesLookup.Seychelles.OfficialName, PluralName: countriesLookup.Seychelles.PluralName, Value: countriesLookup.Seychelles.Value, OtherValue1: countriesLookup.Seychelles.Alpha_2Value, OtherValue2: countriesLookup.Seychelles.Alpha_3Value, OtherValue3: countriesLookup.Seychelles.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SierraLeone.Name, OfficialName: countriesLookup.SierraLeone.OfficialName, PluralName: countriesLookup.SierraLeone.PluralName, Value: countriesLookup.SierraLeone.Value, OtherValue1: countriesLookup.SierraLeone.Alpha_2Value, OtherValue2: countriesLookup.SierraLeone.Alpha_3Value, OtherValue3: countriesLookup.SierraLeone.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Singapore.Name, OfficialName: countriesLookup.Singapore.OfficialName, PluralName: countriesLookup.Singapore.PluralName, Value: countriesLookup.Singapore.Value, OtherValue1: countriesLookup.Singapore.Alpha_2Value, OtherValue2: countriesLookup.Singapore.Alpha_3Value, OtherValue3: countriesLookup.Singapore.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Slovakia.Name, OfficialName: countriesLookup.Slovakia.OfficialName, PluralName: countriesLookup.Slovakia.PluralName, Value: countriesLookup.Slovakia.Value, OtherValue1: countriesLookup.Slovakia.Alpha_2Value, OtherValue2: countriesLookup.Slovakia.Alpha_3Value, OtherValue3: countriesLookup.Slovakia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Slovenia.Name, OfficialName: countriesLookup.Slovenia.OfficialName, PluralName: countriesLookup.Slovenia.PluralName, Value: countriesLookup.Slovenia.Value, OtherValue1: countriesLookup.Slovenia.Alpha_2Value, OtherValue2: countriesLookup.Slovenia.Alpha_3Value, OtherValue3: countriesLookup.Slovenia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SolomonIslands.Name, OfficialName: countriesLookup.SolomonIslands.OfficialName, PluralName: countriesLookup.SolomonIslands.PluralName, Value: countriesLookup.SolomonIslands.Value, OtherValue1: countriesLookup.SolomonIslands.Alpha_2Value, OtherValue2: countriesLookup.SolomonIslands.Alpha_3Value, OtherValue3: countriesLookup.SolomonIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Somalia.Name, OfficialName: countriesLookup.Somalia.OfficialName, PluralName: countriesLookup.Somalia.PluralName, Value: countriesLookup.Somalia.Value, OtherValue1: countriesLookup.Somalia.Alpha_2Value, OtherValue2: countriesLookup.Somalia.Alpha_3Value, OtherValue3: countriesLookup.Somalia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SouthAfrica.Name, OfficialName: countriesLookup.SouthAfrica.OfficialName, PluralName: countriesLookup.SouthAfrica.PluralName, Value: countriesLookup.SouthAfrica.Value, OtherValue1: countriesLookup.SouthAfrica.Alpha_2Value, OtherValue2: countriesLookup.SouthAfrica.Alpha_3Value, OtherValue3: countriesLookup.SouthAfrica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.Name, OfficialName: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.OfficialName, PluralName: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.PluralName, Value: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.Value, OtherValue1: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.Alpha_2Value, OtherValue2: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.Alpha_3Value, OtherValue3: countriesLookup.SouthGeorgiaandtheSouthSandwichIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SouthSudan.Name, OfficialName: countriesLookup.SouthSudan.OfficialName, PluralName: countriesLookup.SouthSudan.PluralName, Value: countriesLookup.SouthSudan.Value, OtherValue1: countriesLookup.SouthSudan.Alpha_2Value, OtherValue2: countriesLookup.SouthSudan.Alpha_3Value, OtherValue3: countriesLookup.SouthSudan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Spain.Name, OfficialName: countriesLookup.Spain.OfficialName, PluralName: countriesLookup.Spain.PluralName, Value: countriesLookup.Spain.Value, OtherValue1: countriesLookup.Spain.Alpha_2Value, OtherValue2: countriesLookup.Spain.Alpha_3Value, OtherValue3: countriesLookup.Spain.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.SriLanka.Name, OfficialName: countriesLookup.SriLanka.OfficialName, PluralName: countriesLookup.SriLanka.PluralName, Value: countriesLookup.SriLanka.Value, OtherValue1: countriesLookup.SriLanka.Alpha_2Value, OtherValue2: countriesLookup.SriLanka.Alpha_3Value, OtherValue3: countriesLookup.SriLanka.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Sudan.Name, OfficialName: countriesLookup.Sudan.OfficialName, PluralName: countriesLookup.Sudan.PluralName, Value: countriesLookup.Sudan.Value, OtherValue1: countriesLookup.Sudan.Alpha_2Value, OtherValue2: countriesLookup.Sudan.Alpha_3Value, OtherValue3: countriesLookup.Sudan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Suriname.Name, OfficialName: countriesLookup.Suriname.OfficialName, PluralName: countriesLookup.Suriname.PluralName, Value: countriesLookup.Suriname.Value, OtherValue1: countriesLookup.Suriname.Alpha_2Value, OtherValue2: countriesLookup.Suriname.Alpha_3Value, OtherValue3: countriesLookup.Suriname.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Sweden.Name, OfficialName: countriesLookup.Sweden.OfficialName, PluralName: countriesLookup.Sweden.PluralName, Value: countriesLookup.Sweden.Value, OtherValue1: countriesLookup.Sweden.Alpha_2Value, OtherValue2: countriesLookup.Sweden.Alpha_3Value, OtherValue3: countriesLookup.Sweden.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Switzerland.Name, OfficialName: countriesLookup.Switzerland.OfficialName, PluralName: countriesLookup.Switzerland.PluralName, Value: countriesLookup.Switzerland.Value, OtherValue1: countriesLookup.Switzerland.Alpha_2Value, OtherValue2: countriesLookup.Switzerland.Alpha_3Value, OtherValue3: countriesLookup.Switzerland.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Syria.Name, OfficialName: countriesLookup.Syria.OfficialName, PluralName: countriesLookup.Syria.PluralName, Value: countriesLookup.Syria.Value, OtherValue1: countriesLookup.Syria.Alpha_2Value, OtherValue2: countriesLookup.Syria.Alpha_3Value, OtherValue3: countriesLookup.Syria.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Taiwan.Name, OfficialName: countriesLookup.Taiwan.OfficialName, PluralName: countriesLookup.Taiwan.PluralName, Value: countriesLookup.Taiwan.Value, OtherValue1: countriesLookup.Taiwan.Alpha_2Value, OtherValue2: countriesLookup.Taiwan.Alpha_3Value, OtherValue3: countriesLookup.Taiwan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tajikistan.Name, OfficialName: countriesLookup.Tajikistan.OfficialName, PluralName: countriesLookup.Tajikistan.PluralName, Value: countriesLookup.Tajikistan.Value, OtherValue1: countriesLookup.Tajikistan.Alpha_2Value, OtherValue2: countriesLookup.Tajikistan.Alpha_3Value, OtherValue3: countriesLookup.Tajikistan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tanzania.Name, OfficialName: countriesLookup.Tanzania.OfficialName, PluralName: countriesLookup.Tanzania.PluralName, Value: countriesLookup.Tanzania.Value, OtherValue1: countriesLookup.Tanzania.Alpha_2Value, OtherValue2: countriesLookup.Tanzania.Alpha_3Value, OtherValue3: countriesLookup.Tanzania.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Thailand.Name, OfficialName: countriesLookup.Thailand.OfficialName, PluralName: countriesLookup.Thailand.PluralName, Value: countriesLookup.Thailand.Value, OtherValue1: countriesLookup.Thailand.Alpha_2Value, OtherValue2: countriesLookup.Thailand.Alpha_3Value, OtherValue3: countriesLookup.Thailand.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.EastTimor.Name, OfficialName: countriesLookup.EastTimor.OfficialName, PluralName: countriesLookup.EastTimor.PluralName, Value: countriesLookup.EastTimor.Value, OtherValue1: countriesLookup.EastTimor.Alpha_2Value, OtherValue2: countriesLookup.EastTimor.Alpha_3Value, OtherValue3: countriesLookup.EastTimor.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Togo.Name, OfficialName: countriesLookup.Togo.OfficialName, PluralName: countriesLookup.Togo.PluralName, Value: countriesLookup.Togo.Value, OtherValue1: countriesLookup.Togo.Alpha_2Value, OtherValue2: countriesLookup.Togo.Alpha_3Value, OtherValue3: countriesLookup.Togo.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tokelau.Name, OfficialName: countriesLookup.Tokelau.OfficialName, PluralName: countriesLookup.Tokelau.PluralName, Value: countriesLookup.Tokelau.Value, OtherValue1: countriesLookup.Tokelau.Alpha_2Value, OtherValue2: countriesLookup.Tokelau.Alpha_3Value, OtherValue3: countriesLookup.Tokelau.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tonga.Name, OfficialName: countriesLookup.Tonga.OfficialName, PluralName: countriesLookup.Tonga.PluralName, Value: countriesLookup.Tonga.Value, OtherValue1: countriesLookup.Tonga.Alpha_2Value, OtherValue2: countriesLookup.Tonga.Alpha_3Value, OtherValue3: countriesLookup.Tonga.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.TrinidadandTobago.Name, OfficialName: countriesLookup.TrinidadandTobago.OfficialName, PluralName: countriesLookup.TrinidadandTobago.PluralName, Value: countriesLookup.TrinidadandTobago.Value, OtherValue1: countriesLookup.TrinidadandTobago.Alpha_2Value, OtherValue2: countriesLookup.TrinidadandTobago.Alpha_3Value, OtherValue3: countriesLookup.TrinidadandTobago.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tunisia.Name, OfficialName: countriesLookup.Tunisia.OfficialName, PluralName: countriesLookup.Tunisia.PluralName, Value: countriesLookup.Tunisia.Value, OtherValue1: countriesLookup.Tunisia.Alpha_2Value, OtherValue2: countriesLookup.Tunisia.Alpha_3Value, OtherValue3: countriesLookup.Tunisia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Turkey.Name, OfficialName: countriesLookup.Turkey.OfficialName, PluralName: countriesLookup.Turkey.PluralName, Value: countriesLookup.Turkey.Value, OtherValue1: countriesLookup.Turkey.Alpha_2Value, OtherValue2: countriesLookup.Turkey.Alpha_3Value, OtherValue3: countriesLookup.Turkey.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Turkmenistan.Name, OfficialName: countriesLookup.Turkmenistan.OfficialName, PluralName: countriesLookup.Turkmenistan.PluralName, Value: countriesLookup.Turkmenistan.Value, OtherValue1: countriesLookup.Turkmenistan.Alpha_2Value, OtherValue2: countriesLookup.Turkmenistan.Alpha_3Value, OtherValue3: countriesLookup.Turkmenistan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.TurksandCaicosIslands.Name, OfficialName: countriesLookup.TurksandCaicosIslands.OfficialName, PluralName: countriesLookup.TurksandCaicosIslands.PluralName, Value: countriesLookup.TurksandCaicosIslands.Value, OtherValue1: countriesLookup.TurksandCaicosIslands.Alpha_2Value, OtherValue2: countriesLookup.TurksandCaicosIslands.Alpha_3Value, OtherValue3: countriesLookup.TurksandCaicosIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Tuvalu.Name, OfficialName: countriesLookup.Tuvalu.OfficialName, PluralName: countriesLookup.Tuvalu.PluralName, Value: countriesLookup.Tuvalu.Value, OtherValue1: countriesLookup.Tuvalu.Alpha_2Value, OtherValue2: countriesLookup.Tuvalu.Alpha_3Value, OtherValue3: countriesLookup.Tuvalu.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Uganda.Name, OfficialName: countriesLookup.Uganda.OfficialName, PluralName: countriesLookup.Uganda.PluralName, Value: countriesLookup.Uganda.Value, OtherValue1: countriesLookup.Uganda.Alpha_2Value, OtherValue2: countriesLookup.Uganda.Alpha_3Value, OtherValue3: countriesLookup.Uganda.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Ukraine.Name, OfficialName: countriesLookup.Ukraine.OfficialName, PluralName: countriesLookup.Ukraine.PluralName, Value: countriesLookup.Ukraine.Value, OtherValue1: countriesLookup.Ukraine.Alpha_2Value, OtherValue2: countriesLookup.Ukraine.Alpha_3Value, OtherValue3: countriesLookup.Ukraine.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.UnitedArabEmirates.Name, OfficialName: countriesLookup.UnitedArabEmirates.OfficialName, PluralName: countriesLookup.UnitedArabEmirates.PluralName, Value: countriesLookup.UnitedArabEmirates.Value, OtherValue1: countriesLookup.UnitedArabEmirates.Alpha_2Value, OtherValue2: countriesLookup.UnitedArabEmirates.Alpha_3Value, OtherValue3: countriesLookup.UnitedArabEmirates.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.UnitedKingdom.Name, OfficialName: countriesLookup.UnitedKingdom.OfficialName, PluralName: countriesLookup.UnitedKingdom.PluralName, Value: countriesLookup.UnitedKingdom.Value, OtherValue1: countriesLookup.UnitedKingdom.Alpha_2Value, OtherValue2: countriesLookup.UnitedKingdom.Alpha_3Value, OtherValue3: countriesLookup.UnitedKingdom.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.UnitedStatesofAmerica.Name, OfficialName: countriesLookup.UnitedStatesofAmerica.OfficialName, PluralName: countriesLookup.UnitedStatesofAmerica.PluralName, Value: countriesLookup.UnitedStatesofAmerica.Value, OtherValue1: countriesLookup.UnitedStatesofAmerica.Alpha_2Value, OtherValue2: countriesLookup.UnitedStatesofAmerica.Alpha_3Value, OtherValue3: countriesLookup.UnitedStatesofAmerica.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Uruguay.Name, OfficialName: countriesLookup.Uruguay.OfficialName, PluralName: countriesLookup.Uruguay.PluralName, Value: countriesLookup.Uruguay.Value, OtherValue1: countriesLookup.Uruguay.Alpha_2Value, OtherValue2: countriesLookup.Uruguay.Alpha_3Value, OtherValue3: countriesLookup.Uruguay.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Uzbekistan.Name, OfficialName: countriesLookup.Uzbekistan.OfficialName, PluralName: countriesLookup.Uzbekistan.PluralName, Value: countriesLookup.Uzbekistan.Value, OtherValue1: countriesLookup.Uzbekistan.Alpha_2Value, OtherValue2: countriesLookup.Uzbekistan.Alpha_3Value, OtherValue3: countriesLookup.Uzbekistan.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Vanuatu.Name, OfficialName: countriesLookup.Vanuatu.OfficialName, PluralName: countriesLookup.Vanuatu.PluralName, Value: countriesLookup.Vanuatu.Value, OtherValue1: countriesLookup.Vanuatu.Alpha_2Value, OtherValue2: countriesLookup.Vanuatu.Alpha_3Value, OtherValue3: countriesLookup.Vanuatu.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Venezuela.Name, OfficialName: countriesLookup.Venezuela.OfficialName, PluralName: countriesLookup.Venezuela.PluralName, Value: countriesLookup.Venezuela.Value, OtherValue1: countriesLookup.Venezuela.Alpha_2Value, OtherValue2: countriesLookup.Venezuela.Alpha_3Value, OtherValue3: countriesLookup.Venezuela.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Vietnam.Name, OfficialName: countriesLookup.Vietnam.OfficialName, PluralName: countriesLookup.Vietnam.PluralName, Value: countriesLookup.Vietnam.Value, OtherValue1: countriesLookup.Vietnam.Alpha_2Value, OtherValue2: countriesLookup.Vietnam.Alpha_3Value, OtherValue3: countriesLookup.Vietnam.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.BritishVirginIslands.Name, OfficialName: countriesLookup.BritishVirginIslands.OfficialName, PluralName: countriesLookup.BritishVirginIslands.PluralName, Value: countriesLookup.BritishVirginIslands.Value, OtherValue1: countriesLookup.BritishVirginIslands.Alpha_2Value, OtherValue2: countriesLookup.BritishVirginIslands.Alpha_3Value, OtherValue3: countriesLookup.BritishVirginIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.USVirginIslands.Name, OfficialName: countriesLookup.USVirginIslands.OfficialName, PluralName: countriesLookup.USVirginIslands.PluralName, Value: countriesLookup.USVirginIslands.Value, OtherValue1: countriesLookup.USVirginIslands.Alpha_2Value, OtherValue2: countriesLookup.USVirginIslands.Alpha_3Value, OtherValue3: countriesLookup.USVirginIslands.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.WallisandFutuna.Name, OfficialName: countriesLookup.WallisandFutuna.OfficialName, PluralName: countriesLookup.WallisandFutuna.PluralName, Value: countriesLookup.WallisandFutuna.Value, OtherValue1: countriesLookup.WallisandFutuna.Alpha_2Value, OtherValue2: countriesLookup.WallisandFutuna.Alpha_3Value, OtherValue3: countriesLookup.WallisandFutuna.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Yemen.Name, OfficialName: countriesLookup.Yemen.OfficialName, PluralName: countriesLookup.Yemen.PluralName, Value: countriesLookup.Yemen.Value, OtherValue1: countriesLookup.Yemen.Alpha_2Value, OtherValue2: countriesLookup.Yemen.Alpha_3Value, OtherValue3: countriesLookup.Yemen.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Zambia.Name, OfficialName: countriesLookup.Zambia.OfficialName, PluralName: countriesLookup.Zambia.PluralName, Value: countriesLookup.Zambia.Value, OtherValue1: countriesLookup.Zambia.Alpha_2Value, OtherValue2: countriesLookup.Zambia.Alpha_3Value, OtherValue3: countriesLookup.Zambia.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	countriesToCreate.push(new LookupModel({ Name: countriesLookup.Zimbabwe.Name, OfficialName: countriesLookup.Zimbabwe.OfficialName, PluralName: countriesLookup.Zimbabwe.PluralName, Value: countriesLookup.Zimbabwe.Value, OtherValue1: countriesLookup.Zimbabwe.Alpha_2Value, OtherValue2: countriesLookup.Zimbabwe.Alpha_3Value, OtherValue3: countriesLookup.Zimbabwe.Domain, LookupCategoryId: countriesLookupCategory.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))

	const lookupsCreated = await lookupRepositoryService.createAll(countriesToCreate)
	logger.info(`Finished creating lookups for the ${countries} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateCurrencyLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const currencies = LookupService.CurrencyLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${currencies} category`)
	const currenciesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: currencies, Value: lookups[currencies]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const currenciesLookup = lookups.Currencies
	const currenciesToCreate: LookupModel[] = []
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.ArgentinePeso.Name,
			OfficialName: currenciesLookup.ArgentinePeso.OfficialName,
			PluralName: currenciesLookup.ArgentinePeso.PluralName,
			Value: currenciesLookup.ArgentinePeso.Value,
			OtherValue1: currenciesLookup.ArgentinePeso.Symbol,
			OtherValue2: currenciesLookup.ArgentinePeso.NativeSymbol,
			OtherValue3: currenciesLookup.ArgentinePeso.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.AustralianDollar.Name,
			OfficialName: currenciesLookup.AustralianDollar.OfficialName,
			PluralName: currenciesLookup.AustralianDollar.PluralName,
			Value: currenciesLookup.AustralianDollar.Value,
			OtherValue1: currenciesLookup.AustralianDollar.Symbol,
			OtherValue2: currenciesLookup.AustralianDollar.NativeSymbol,
			OtherValue3: currenciesLookup.AustralianDollar.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.BangladeshiTaka.Name,
			OfficialName: currenciesLookup.BangladeshiTaka.OfficialName,
			PluralName: currenciesLookup.BangladeshiTaka.PluralName,
			Value: currenciesLookup.BangladeshiTaka.Value,
			OtherValue1: currenciesLookup.BangladeshiTaka.Symbol,
			OtherValue2: currenciesLookup.BangladeshiTaka.NativeSymbol,
			OtherValue3: currenciesLookup.BangladeshiTaka.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.CanadianDollar.Name,
			OfficialName: currenciesLookup.CanadianDollar.OfficialName,
			PluralName: currenciesLookup.CanadianDollar.PluralName,
			Value: currenciesLookup.CanadianDollar.Value,
			OtherValue1: currenciesLookup.CanadianDollar.Symbol,
			OtherValue2: currenciesLookup.CanadianDollar.NativeSymbol,
			OtherValue3: currenciesLookup.CanadianDollar.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.Euro.Name,
			OfficialName: currenciesLookup.Euro.OfficialName,
			PluralName: currenciesLookup.Euro.PluralName,
			Value: currenciesLookup.Euro.Value,
			OtherValue1: currenciesLookup.Euro.Symbol,
			OtherValue2: currenciesLookup.Euro.NativeSymbol,
			OtherValue3: currenciesLookup.Euro.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.IndianRupee.Name,
			OfficialName: currenciesLookup.IndianRupee.OfficialName,
			PluralName: currenciesLookup.IndianRupee.PluralName,
			Value: currenciesLookup.IndianRupee.Value,
			OtherValue1: currenciesLookup.IndianRupee.Symbol,
			OtherValue2: currenciesLookup.IndianRupee.NativeSymbol,
			OtherValue3: currenciesLookup.IndianRupee.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.NigerianNaira.Name,
			OfficialName: currenciesLookup.NigerianNaira.OfficialName,
			PluralName: currenciesLookup.NigerianNaira.PluralName,
			Value: currenciesLookup.NigerianNaira.Value,
			OtherValue1: currenciesLookup.NigerianNaira.Symbol,
			OtherValue2: currenciesLookup.NigerianNaira.NativeSymbol,
			OtherValue3: currenciesLookup.NigerianNaira.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.PoundSterling.Name,
			OfficialName: currenciesLookup.PoundSterling.OfficialName,
			PluralName: currenciesLookup.PoundSterling.PluralName,
			Value: currenciesLookup.PoundSterling.Value,
			OtherValue1: currenciesLookup.PoundSterling.Symbol,
			OtherValue2: currenciesLookup.PoundSterling.NativeSymbol,
			OtherValue3: currenciesLookup.PoundSterling.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	currenciesToCreate.push(
		new LookupModel({
			Name: currenciesLookup.USDollar.Name,
			OfficialName: currenciesLookup.USDollar.OfficialName,
			PluralName: currenciesLookup.USDollar.PluralName,
			Value: currenciesLookup.USDollar.Value,
			OtherValue1: currenciesLookup.USDollar.Symbol,
			OtherValue2: currenciesLookup.USDollar.NativeSymbol,
			OtherValue3: currenciesLookup.USDollar.DecimalDigits.toString(),
			LookupCategoryId: currenciesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(currenciesToCreate)
	logger.info(`Finished creating lookups for the ${currencies} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateLanguagesLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const languages = LookupService.LanguageLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${languages} category`)
	const languagesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: languages, Value: lookups[languages]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const languagesLookup = lookups.Languages
	const languagesToCreate: LookupModel[] = []
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.English.Name,
			OfficialName: languagesLookup.English.OfficialName,
			PluralName: languagesLookup.English.PluralName,
			Value: languagesLookup.English.ISO639_1Value,
			OtherValue1: languagesLookup.English.ISO639_2Value,
			OtherValue3: languagesLookup.English.ISO639_3Value,
			OtherValue4: languagesLookup.English.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.French.Name,
			OfficialName: languagesLookup.French.OfficialName,
			PluralName: languagesLookup.French.PluralName,
			Value: languagesLookup.French.ISO639_1Value,
			OtherValue1: languagesLookup.French.ISO639_2Value,
			OtherValue3: languagesLookup.French.ISO639_3Value,
			OtherValue4: languagesLookup.French.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Punjabi.Name,
			OfficialName: languagesLookup.Punjabi.OfficialName,
			PluralName: languagesLookup.Punjabi.PluralName,
			Value: languagesLookup.Punjabi.ISO639_1Value,
			OtherValue1: languagesLookup.Punjabi.ISO639_2Value,
			OtherValue3: languagesLookup.Punjabi.ISO639_3Value,
			OtherValue4: languagesLookup.Punjabi.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Urdu.Name,
			OfficialName: languagesLookup.Urdu.OfficialName,
			PluralName: languagesLookup.Urdu.PluralName,
			Value: languagesLookup.Urdu.ISO639_1Value,
			OtherValue1: languagesLookup.Urdu.ISO639_2Value,
			OtherValue3: languagesLookup.Urdu.ISO639_3Value,
			OtherValue4: languagesLookup.Urdu.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	//TODO: comment out as more languages are added
	/*
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Bengali.Name,
			OfficialName: languagesLookup.Bengali.OfficialName,
			PluralName: languagesLookup.Bengali.PluralName,
			Value: languagesLookup.Bengali.ISO639_1Value,
			OtherValue1: languagesLookup.Bengali.ISO639_2Value,
			OtherValue3: languagesLookup.Bengali.ISO639_3Value,
			OtherValue4: languagesLookup.Bengali.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.German.Name,
			OfficialName: languagesLookup.German.OfficialName,
			PluralName: languagesLookup.German.PluralName,
			Value: languagesLookup.German.ISO639_1Value,
			OtherValue1: languagesLookup.German.ISO639_2Value,
			OtherValue3: languagesLookup.German.ISO639_3Value,
			OtherValue4: languagesLookup.German.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Hausa.Name,
			OfficialName: languagesLookup.Hausa.OfficialName,
			PluralName: languagesLookup.Hausa.PluralName,
			Value: languagesLookup.Hausa.ISO639_1Value,
			OtherValue1: languagesLookup.Hausa.ISO639_2Value,
			OtherValue3: languagesLookup.Hausa.ISO639_3Value,
			OtherValue4: languagesLookup.Hausa.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Hindi.Name,
			OfficialName: languagesLookup.Hindi.OfficialName,
			PluralName: languagesLookup.Hindi.PluralName,
			Value: languagesLookup.Hindi.ISO639_1Value,
			OtherValue1: languagesLookup.Hindi.ISO639_2Value,
			OtherValue3: languagesLookup.Hindi.ISO639_3Value,
			OtherValue4: languagesLookup.Hindi.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Igbo.Name,
			OfficialName: languagesLookup.Igbo.OfficialName,
			PluralName: languagesLookup.Igbo.PluralName,
			Value: languagesLookup.Igbo.ISO639_1Value,
			OtherValue1: languagesLookup.Igbo.ISO639_2Value,
			OtherValue3: languagesLookup.Igbo.ISO639_3Value,
			OtherValue4: languagesLookup.Igbo.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Marathi.Name,
			OfficialName: languagesLookup.Marathi.OfficialName,
			PluralName: languagesLookup.Marathi.PluralName,
			Value: languagesLookup.Marathi.ISO639_1Value,
			OtherValue1: languagesLookup.Marathi.ISO639_2Value,
			OtherValue3: languagesLookup.Marathi.ISO639_3Value,
			OtherValue4: languagesLookup.Marathi.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Pashto.Name,
			OfficialName: languagesLookup.Pashto.OfficialName,
			PluralName: languagesLookup.Pashto.PluralName,
			Value: languagesLookup.Pashto.ISO639_1Value,
			OtherValue1: languagesLookup.Pashto.ISO639_2Value,
			OtherValue3: languagesLookup.Pashto.ISO639_3Value,
			OtherValue4: languagesLookup.Pashto.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)    
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.ScottishGaelic.Name,
			OfficialName: languagesLookup.ScottishGaelic.OfficialName,
			PluralName: languagesLookup.ScottishGaelic.PluralName,
			Value: languagesLookup.ScottishGaelic.ISO639_1Value,
			OtherValue1: languagesLookup.ScottishGaelic.ISO639_2Value,
			OtherValue3: languagesLookup.ScottishGaelic.ISO639_3Value,
			OtherValue4: languagesLookup.ScottishGaelic.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Sindhi.Name,
			OfficialName: languagesLookup.Sindhi.OfficialName,
			PluralName: languagesLookup.Sindhi.PluralName,
			Value: languagesLookup.Sindhi.ISO639_1Value,
			OtherValue1: languagesLookup.Sindhi.ISO639_2Value,
			OtherValue3: languagesLookup.Sindhi.ISO639_3Value,
			OtherValue4: languagesLookup.Sindhi.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Spanish.Name,
			OfficialName: languagesLookup.Spanish.OfficialName,
			PluralName: languagesLookup.Spanish.PluralName,
			Value: languagesLookup.Spanish.ISO639_1Value,
			OtherValue1: languagesLookup.Spanish.ISO639_2Value,
			OtherValue3: languagesLookup.Spanish.ISO639_3Value,
			OtherValue4: languagesLookup.Spanish.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Tamil.Name,
			OfficialName: languagesLookup.Tamil.OfficialName,
			PluralName: languagesLookup.Tamil.PluralName,
			Value: languagesLookup.Tamil.ISO639_1Value,
			OtherValue1: languagesLookup.Tamil.ISO639_2Value,
			OtherValue3: languagesLookup.Tamil.ISO639_3Value,
			OtherValue4: languagesLookup.Tamil.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)    
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Welsh.Name,
			OfficialName: languagesLookup.Welsh.OfficialName,
			PluralName: languagesLookup.Welsh.PluralName,
			Value: languagesLookup.Welsh.ISO639_1Value,
			OtherValue1: languagesLookup.Welsh.ISO639_2Value,
			OtherValue3: languagesLookup.Welsh.ISO639_3Value,
			OtherValue4: languagesLookup.Welsh.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	languagesToCreate.push(
		new LookupModel({
			Name: languagesLookup.Yoruba.Name,
			OfficialName: languagesLookup.Yoruba.OfficialName,
			PluralName: languagesLookup.Yoruba.PluralName,
			Value: languagesLookup.Yoruba.ISO639_1Value,
			OtherValue1: languagesLookup.Yoruba.ISO639_2Value,
			OtherValue3: languagesLookup.Yoruba.ISO639_3Value,
			OtherValue4: languagesLookup.Yoruba.IsRTL.toString(),
			LookupCategoryId: languagesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	*/
	const lookupsCreated = await lookupRepositoryService.createAll(languagesToCreate)
	logger.info(`Finished creating lookups for the ${languages} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateAuthenticationProviderLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const notificationStrategies = LookupService.AuthenticationProviderLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${notificationStrategies} category`)
	const authenticationProviderLookupCategory = await lookupCategoryRepositoryService.create(
		new LookupCategoryModel({ Name: notificationStrategies, Value: lookups[notificationStrategies]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id })
	)
	const notificationStrategiesLookup = lookups.AuthenticationProviders
	const notificationStrategiesToCreate: LookupModel[] = []
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Local.Name,
			OfficialName: notificationStrategiesLookup.Local.OfficialName,
			PluralName: notificationStrategiesLookup.Local.PluralName,
			Value: notificationStrategiesLookup.Local.Value,
			LookupCategoryId: authenticationProviderLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Google.Name,
			OfficialName: notificationStrategiesLookup.Google.OfficialName,
			PluralName: notificationStrategiesLookup.Google.PluralName,
			Value: notificationStrategiesLookup.Google.Value,
			LookupCategoryId: authenticationProviderLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Facebook.Name,
			OfficialName: notificationStrategiesLookup.Facebook.OfficialName,
			PluralName: notificationStrategiesLookup.Facebook.PluralName,
			Value: notificationStrategiesLookup.Facebook.Value,
			LookupCategoryId: authenticationProviderLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Twitter.Name,
			OfficialName: notificationStrategiesLookup.Twitter.OfficialName,
			PluralName: notificationStrategiesLookup.Twitter.PluralName,
			Value: notificationStrategiesLookup.Twitter.Value,
			LookupCategoryId: authenticationProviderLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.LinkedIn.Name,
			OfficialName: notificationStrategiesLookup.LinkedIn.OfficialName,
			PluralName: notificationStrategiesLookup.LinkedIn.PluralName,
			Value: notificationStrategiesLookup.LinkedIn.Value,
			LookupCategoryId: authenticationProviderLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(notificationStrategiesToCreate)
	logger.info(`Finished creating lookups for the ${notificationStrategies} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateNotificationStrategyLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const notificationStrategies = LookupService.NotificationStrategiesLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${notificationStrategies} category`)
	const notificationStrategiesLookupCategory = await lookupCategoryRepositoryService.create(
		new LookupCategoryModel({ Name: notificationStrategies, Value: lookups[notificationStrategies]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id })
	)
	const notificationStrategiesLookup = lookups.NotificationStrategies
	const notificationStrategiesToCreate: LookupModel[] = []
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Email.Name,
			OfficialName: notificationStrategiesLookup.Email.OfficialName,
			PluralName: notificationStrategiesLookup.Email.PluralName,
			Value: notificationStrategiesLookup.Email.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.SMS.Name,
			OfficialName: notificationStrategiesLookup.SMS.OfficialName,
			PluralName: notificationStrategiesLookup.SMS.PluralName,
			Value: notificationStrategiesLookup.SMS.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.InApp.Name,
			OfficialName: notificationStrategiesLookup.InApp.OfficialName,
			PluralName: notificationStrategiesLookup.InApp.PluralName,
			Value: notificationStrategiesLookup.InApp.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Push.Name,
			OfficialName: notificationStrategiesLookup.Push.OfficialName,
			PluralName: notificationStrategiesLookup.Push.PluralName,
			Value: notificationStrategiesLookup.Push.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.Skype.Name,
			OfficialName: notificationStrategiesLookup.Skype.OfficialName,
			PluralName: notificationStrategiesLookup.Skype.PluralName,
			Value: notificationStrategiesLookup.Skype.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStrategiesToCreate.push(
		new LookupModel({
			Name: notificationStrategiesLookup.WhatsApp.Name,
			OfficialName: notificationStrategiesLookup.WhatsApp.OfficialName,
			PluralName: notificationStrategiesLookup.WhatsApp.PluralName,
			Value: notificationStrategiesLookup.WhatsApp.Value,
			LookupCategoryId: notificationStrategiesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(notificationStrategiesToCreate)
	logger.info(`Finished creating lookups for the ${notificationStrategies} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateNotificationStatusLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const notificationStatus = LookupService.NotificationStatusLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${notificationStatus} category`)
	const notificationStatusLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: notificationStatus, Value: lookups[notificationStatus]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const notificationStatusLookup = lookups.NotificationStatus
	const notificationStatusToCreate: LookupModel[] = []
	notificationStatusToCreate.push(
		new LookupModel({
			Name: notificationStatusLookup.Pending.Name,
			OfficialName: notificationStatusLookup.Pending.OfficialName,
			PluralName: notificationStatusLookup.Pending.PluralName,
			Value: notificationStatusLookup.Pending.Value,
			LookupCategoryId: notificationStatusLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStatusToCreate.push(
		new LookupModel({
			Name: notificationStatusLookup.Failed.Name,
			OfficialName: notificationStatusLookup.Failed.OfficialName,
			PluralName: notificationStatusLookup.Failed.PluralName,
			Value: notificationStatusLookup.Failed.Value,
			LookupCategoryId: notificationStatusLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStatusToCreate.push(
		new LookupModel({
			Name: notificationStatusLookup.Acknowledged.Name,
			OfficialName: notificationStatusLookup.Acknowledged.OfficialName,
			PluralName: notificationStatusLookup.Acknowledged.PluralName,
			Value: notificationStatusLookup.Acknowledged.Value,
			LookupCategoryId: notificationStatusLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStatusToCreate.push(
		new LookupModel({
			Name: notificationStatusLookup.Invalid.Name,
			OfficialName: notificationStatusLookup.Invalid.OfficialName,
			PluralName: notificationStatusLookup.Invalid.PluralName,
			Value: notificationStatusLookup.Invalid.Value,
			LookupCategoryId: notificationStatusLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	notificationStatusToCreate.push(
		new LookupModel({
			Name: notificationStatusLookup.Succeeded.Name,
			OfficialName: notificationStatusLookup.Succeeded.OfficialName,
			PluralName: notificationStatusLookup.Succeeded.PluralName,
			Value: notificationStatusLookup.Succeeded.Value,
			LookupCategoryId: notificationStatusLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(notificationStatusToCreate)
	logger.info(`Finished creating lookups for the ${notificationStatus} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreatePhoneTypesLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const phoneTypes = LookupService.PhoneTypesLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${phoneTypes} category`)
	const phoneTypesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: phoneTypes, Value: lookups[phoneTypes]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const phoneTypesLookup = lookups.PhoneTypes
	const phoneTypesToCreate: LookupModel[] = []
	phoneTypesToCreate.push(
		new LookupModel({
			Name: phoneTypesLookup.Landline.Name,
			OfficialName: phoneTypesLookup.Landline.OfficialName,
			PluralName: phoneTypesLookup.Landline.PluralName,
			Value: phoneTypesLookup.Landline.Value,
			LookupCategoryId: phoneTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	phoneTypesToCreate.push(
		new LookupModel({
			Name: phoneTypesLookup.Mobile.Name,
			OfficialName: phoneTypesLookup.Mobile.OfficialName,
			PluralName: phoneTypesLookup.Mobile.PluralName,
			Value: phoneTypesLookup.Mobile.Value,
			LookupCategoryId: phoneTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(phoneTypesToCreate)
	logger.info(`Finished creating lookups for the ${phoneTypes} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreatePhotoTypesLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const photoTypes = LookupService.PhotoTypesLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${photoTypes} category`)
	const photoTypesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: photoTypes, Value: lookups[photoTypes]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const photoTypesLookup = lookups.PhotoTypes
	const photoTypesToCreate: LookupModel[] = []
	photoTypesToCreate.push(
		new LookupModel({
			Name: photoTypesLookup.Avatar.Name,
			OfficialName: photoTypesLookup.Avatar.OfficialName,
			PluralName: photoTypesLookup.Avatar.PluralName,
			Value: photoTypesLookup.Avatar.Value,
			LookupCategoryId: photoTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	photoTypesToCreate.push(
		new LookupModel({
			Name: photoTypesLookup.Header.Name,
			OfficialName: photoTypesLookup.Header.OfficialName,
			PluralName: photoTypesLookup.Header.PluralName,
			Value: photoTypesLookup.Header.Value,
			LookupCategoryId: photoTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	photoTypesToCreate.push(
		new LookupModel({
			Name: photoTypesLookup.Other.Name,
			OfficialName: photoTypesLookup.Other.OfficialName,
			PluralName: photoTypesLookup.Other.PluralName,
			Value: photoTypesLookup.Other.Value,
			LookupCategoryId: photoTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(photoTypesToCreate)
	logger.info(`Finished creating lookups for the ${photoTypes} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateThemesLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const themes = LookupService.ThemesCategoryName
	logger.info(`Creating lookup category and lookups for the ${themes} category`)
	const themesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: themes, Value: lookups[themes]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const themesLookup = lookups.Themes
	const themesToCreate: LookupModel[] = []

	themesToCreate.push(
		new LookupModel({
			Name: themesLookup.Dark.Name,
			OfficialName: themesLookup.Dark.OfficialName,
			PluralName: themesLookup.Dark.PluralName,
			Value: themesLookup.Dark.Value,
			LookupCategoryId: themesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)

	themesToCreate.push(
		new LookupModel({
			Name: themesLookup.Light.Name,
			OfficialName: themesLookup.Light.OfficialName,
			PluralName: themesLookup.Light.PluralName,
			Value: themesLookup.Light.Value,
			LookupCategoryId: themesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)

	themesToCreate.push(
		new LookupModel({
			Name: themesLookup.Blue.Name,
			OfficialName: themesLookup.Blue.OfficialName,
			PluralName: themesLookup.Blue.PluralName,
			Value: themesLookup.Blue.Value,
			LookupCategoryId: themesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	themesToCreate.push(
		new LookupModel({
			Name: themesLookup.Red.Name,
			OfficialName: themesLookup.Red.OfficialName,
			PluralName: themesLookup.Red.PluralName,
			Value: themesLookup.Red.Value,
			LookupCategoryId: themesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	themesToCreate.push(
		new LookupModel({
			Name: themesLookup.Neutral.Name,
			OfficialName: themesLookup.Neutral.OfficialName,
			PluralName: themesLookup.Neutral.PluralName,
			Value: themesLookup.Neutral.Value,
			LookupCategoryId: themesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(themesToCreate)
	logger.info(`Finished creating lookups for the ${themes} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateBasicTypesLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const basicTypes = LookupService.BasicTypesLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${basicTypes} category`)
	const basicTypesLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: basicTypes, Value: lookups[basicTypes]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const basicTypesLookup = lookups.BasicTypes
	const basicTypesToCreate: LookupModel[] = []
	basicTypesToCreate.push(
		new LookupModel({
			Name: basicTypesLookup.Primary.Name,
			OfficialName: basicTypesLookup.Primary.OfficialName,
			PluralName: basicTypesLookup.Primary.PluralName,
			Value: basicTypesLookup.Primary.Value,
			LookupCategoryId: basicTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	basicTypesToCreate.push(
		new LookupModel({
			Name: basicTypesLookup.Secondary.Name,
			OfficialName: basicTypesLookup.Secondary.OfficialName,
			PluralName: basicTypesLookup.Secondary.PluralName,
			Value: basicTypesLookup.Secondary.Value,
			LookupCategoryId: basicTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	basicTypesToCreate.push(
		new LookupModel({
			Name: basicTypesLookup.Tertiary.Name,
			OfficialName: basicTypesLookup.Tertiary.OfficialName,
			PluralName: basicTypesLookup.Tertiary.PluralName,
			Value: basicTypesLookup.Tertiary.Value,
			LookupCategoryId: basicTypesLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(basicTypesToCreate)
	logger.info(`Finished creating lookups for the ${basicTypes} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateImportanceLookups(
	rootUser: UserModel,
	logger: Winston.Logger,
	lookups: Lookups,
	lookupRepositoryService: DefaultCrudRepository<LookupModel, ModelIdType, LookupModel>,
	lookupCategoryRepositoryService: DefaultCrudRepository<LookupCategoryModel, ModelIdType, LookupCategoryModel>
): Promise<LookupModel[]> {
	const importance = LookupService.ImportanceLookupCategoryName
	logger.info(`Creating lookup category and lookups for the ${importance} category`)
	const importanceLookupCategory = await lookupCategoryRepositoryService.create(new LookupCategoryModel({ Name: importance, Value: lookups[importance]['Value'].toLowerCase(), CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	const importanceLookup = lookups.Importance
	const importanceToCreate: LookupModel[] = []
	importanceToCreate.push(
		new LookupModel({
			Name: importanceLookup.Low.Name,
			OfficialName: importanceLookup.Low.OfficialName,
			PluralName: importanceLookup.Low.PluralName,
			Value: importanceLookup.Low.Value,
			LookupCategoryId: importanceLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	importanceToCreate.push(
		new LookupModel({
			Name: importanceLookup.Medium.Name,
			OfficialName: importanceLookup.Medium.OfficialName,
			PluralName: importanceLookup.Medium.PluralName,
			Value: importanceLookup.Medium.Value,
			LookupCategoryId: importanceLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	importanceToCreate.push(
		new LookupModel({
			Name: importanceLookup.High.Name,
			OfficialName: importanceLookup.High.OfficialName,
			PluralName: importanceLookup.High.PluralName,
			Value: importanceLookup.High.Value,
			LookupCategoryId: importanceLookupCategory.Id,
			CreatedById: rootUser.Id,
			UpdatedById: rootUser.Id
		})
	)
	const lookupsCreated = await lookupRepositoryService.createAll(importanceToCreate)
	logger.info(`Finished creating lookups for the ${importance} category`)
	lookupsCreated.forEach(lookup => {
		logger.info(`${JSON.stringify(lookup)}`)
	})
	return lookupsCreated
}

async function CreateRoles(rootUser: UserModel, logger: Winston.Logger, lookups: Lookups, roleRepositoryService: RoleRepositoryService): Promise<RoleModel[]> {
	logger.info(`Creating roles`)
	const rolesToCreate: RoleModel[] = []
	logger.info(`Using the casbin ${lookups.CasbinRoles.administrator.Value} policy to authorize the root user...`)
	const enforcer = await CasbinService.GetCasbinEnforcerByRole(lookups.CasbinRoles.administrator.Value)
	const roles = await enforcer?.getAllRoles()
	roles?.forEach((role: string) => {
		try {
			logger.info(`Assigning the ${role} role to the root user ...`)
			rolesToCreate.push(
				new RoleModel({
					Name: lookups.CasbinRoles[role].Value,
					DisplayName: lookups.CasbinRoles[role].Name,
					Rank: lookups.CasbinRoles[role].Rank,
					IsSystem: true,
					CreatedById: rootUser.Id,
					UpdatedById: rootUser.Id
				})
			)
		} catch {
			logger.error(`There was an error reading matching casbin rolels and Lookups using this Lookup: ${JSON.stringify(lookups)}`)
			throw new Error(`There was an error reading matching casbin roles and Lookups using this Lookup: ${JSON.stringify(lookups)}`)
		}
	})
	rolesToCreate.sort((a: RoleModel, b: RoleModel) => {
		if (a.Rank && b.Rank && a.Rank > b.Rank) {
			return 1
		} else if (a.Rank && b.Rank && a.Rank < b.Rank) {
			return -1
		} else {
			return 0
		}
	})
	const rolesCreated = await roleRepositoryService.createAll(rolesToCreate)
	logger.info(`Finished creating roles`)
	rolesCreated.forEach(role => {
		logger.info(`${JSON.stringify(role)}`)
	})
	return rolesCreated
}

async function CreateGroups(rootUser: UserModel, logger: Winston.Logger, lookups: Lookups, groupRepositoryService: GroupRepositoryService): Promise<GroupModel[]> {
	logger.info(`Creating groups`)
	const groupsToCreate: GroupModel[] = []
	const groups = Object.keys(lookups.CasbinGroups).filter(group => group != 'Name' && group != 'Value')
	groups?.forEach((group: string) => {
		try {
			logger.info(`Adding the root user to the ${group} group ...`)
			groupsToCreate.push(
				new GroupModel({
					Name: lookups.CasbinGroups[group].Value,
					DisplayName: lookups.CasbinGroups[group].Name,
					IsSystem: true,
					CreatedById: rootUser.Id,
					UpdatedById: rootUser.Id
				})
			)
		} catch {
			logger.error(`There was an error reading matching casbin domains and Lookups using this Lookup: ${JSON.stringify(lookups)}`)
			throw new Error(`There was an error reading matching casbin domains and Lookups using this Lookup: ${JSON.stringify(lookups)}`)
		}
	})
	const groupsCreated = await groupRepositoryService.createAll(groupsToCreate)
	logger.info(`Finished creating groups`)
	groupsCreated.forEach(group => {
		logger.info(`${JSON.stringify(group)}`)
	})
	return groupsCreated
}

async function AddRootUserToGroups(
	rootUser: UserModel,
	logger: Winston.Logger,
	groups: GroupModel[],
	roles: RoleModel[],
	userGroupRepositoryService: UserGroupRepositoryService,
	userGroupRoleRepositoryService: UserGroupRoleRepositoryService
): Promise<[UserGroupModel[], UserGroupRoleModel[]]> {
	logger.info(`Adding root user to groups`)
	const userGroupToCreate: UserGroupModel[] = []
	groups.forEach(group => {
		userGroupToCreate.push(new UserGroupModel({ UserId: rootUser.Id, GroupId: group.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
	})
	const userGroupCreated = await userGroupRepositoryService.createAll(userGroupToCreate)

	const userGroupRoleToCreate: UserGroupRoleModel[] = []
	userGroupCreated.forEach(userGroup => {
		roles.forEach(role => {
			userGroupRoleToCreate.push(new UserGroupRoleModel({ UserGroupId: userGroup.Id, RoleId: role.Id, CreatedById: rootUser.Id, UpdatedById: rootUser.Id }))
		})
	})
	const userGroupRolesCreated = await userGroupRoleRepositoryService.createAll(userGroupRoleToCreate)
	logger.info(`Finished adding root user to groups`)
	userGroupRolesCreated.forEach(userGroup => {
		logger.info(`${JSON.stringify(userGroup)}`)
	})
	return [userGroupCreated, userGroupRolesCreated]
}

async function CreateProfileForRootUser(
	rootUser: UserModel,
	lookups: Lookups,
	logger: Winston.Logger,
	config: ConfigurationType,
	lookupRepositoryService: LookupRepositoryService,
	lookupCategoryRepositoryService: LookupCategoryRepositoryService,
	userLogonRepositoryService: UserLogonRepositoryService,
	userPasswordRepositoryService: UserPasswordRepositoryService,
	userEmailAddressRepositoryService: UserEmailAddressRepositoryService,
	userDisplaySettingsRepositoryService: UserDisplaySettingsRepositoryService,
	userNameRepositoryService: UserNameRepositoryService,
	userPhoneNumberRepositoryService: UserPhoneNumberRepositoryService
): Promise<UserDisplaySettingsModel> {
	logger.info(`Creating root user profile...`)

	//TODO::Use the Register method of the authentication service
	const options: LocalStrategyOptions = config.authentication?.localOptions!
	const passwordSalt = Buffer.from(crypto.randomBytes(options.pbkdf2Keylen)).toString('hex')
	const passwordHashBuffer = await crypto.pbkdf2Sync(config.rootUser.password, passwordSalt, options.pbkdf2Iterations, options.pbkdf2Keylen, options.pbkdf2Digest)
	const passwordHash = Buffer.from(passwordHashBuffer).toString('hex')
	const authenticationProviderLookupCategory = await lookupCategoryRepositoryService.FindOne({
		where: {
			Value: LookupService.AuthenticationProviderLookupCategoryName.toLowerCase()
		}
	})
	const authenticationProviderLookup = await lookupRepositoryService.FindOne({
		where: { Value: config.authentication?.localOptions![provider], LookupCategoryId: authenticationProviderLookupCategory!.Id }
	})
	const basicTypesLookupCategory = await lookupCategoryRepositoryService.FindOne({
		where: {
			Value: LookupService.BasicTypesLookupCategoryName.toLowerCase()
		}
	})
	const basicTypesLookup = lookups.BasicTypes
	const primaryBasicTypesLookup = await lookupRepositoryService.FindOne({
		where: { Value: basicTypesLookup.Primary.Value, LookupCategoryId: basicTypesLookupCategory!.Id }
	})
	const phoneTypesLookupCategory = await lookupCategoryRepositoryService.FindOne({
		where: {
			Value: LookupService.PhoneTypesLookupCategoryName.toLowerCase()
		}
	})
	const phoneTypesLookup = lookups.PhoneTypes
	const mobilePhoneTypeLookup = await lookupRepositoryService.FindOne({
		where: { Value: phoneTypesLookup.Mobile.Value, LookupCategoryId: phoneTypesLookupCategory!.Id }
	})

	await userLogonRepositoryService.Create({
		UserId: rootUser.Id!,
		ProviderId: authenticationProviderLookup!.Id,
		ProviderUserId: config.rootUser.emailAddress,
		ProviderUserName: config.rootUser.emailAddress,
		CreatedById: rootUser.Id,
		UpdatedById: rootUser.Id
	})

	await userPasswordRepositoryService.Create({
		UserId: rootUser.Id!,
		PasswordStrength: 1,
		PasswordHash: passwordHash,
		PasswordSalt: passwordSalt,
		FailedAttempts: 0,
		CreatedById: rootUser.Id!,
		UpdatedById: rootUser.Id!
	})

	await userNameRepositoryService.create({
		UserId: rootUser.Id!,
		Title: config.rootUser.title,
		FirstName: config.rootUser.firstName,
		LastName: config.rootUser.lastName,
		DisplayName: config.rootUser.displayName,
		CreatedById: rootUser.Id!,
		UpdatedById: rootUser.Id!
	})

	//TODO: Add secondary and tertiary emails
	await userEmailAddressRepositoryService.Create({
		UserId: rootUser.Id!,
		EmailAddress: config.rootUser.emailAddress.toLowerCase(),
		EmailAddressTypeId: primaryBasicTypesLookup!.Id,
		CreatedById: rootUser.Id,
		UpdatedById: rootUser.Id
	})

	await userPhoneNumberRepositoryService.Create({
		UserId: rootUser.Id!,
		PhoneNumber: config.rootUser.phoneNumber,
		PhoneTypeId: mobilePhoneTypeLookup!.Id,
		CreatedById: rootUser.Id,
		UpdatedById: rootUser.Id
	})

	const languageLookupCategory = await lookupCategoryRepositoryService.FindOne({ where: { Value: LookupService.LanguageLookupCategoryName.toLowerCase() } })
	const languageLookup = await lookupRepositoryService.FindOne({ where: { Value: 'en', LookupCategoryId: languageLookupCategory!.Id } })

	const userDisplaySettings = await userDisplaySettingsRepositoryService.Create({
		UserId: rootUser.Id,
		DisableAnimations: false,
		IsOnLowSpeedConnection: false,
		ShowBackgroundVideo: true,
		LanguageId: languageLookup!.Id,
		CreatedById: rootUser.Id,
		UpdatedById: rootUser.Id
	})

	return userDisplaySettings
}

FirstRun(process.argv)
