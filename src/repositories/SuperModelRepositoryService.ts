import { Count, Filter, FilterExcludingWhere, DefaultTransactionalRepository, Where, IsolationLevel, model, Entity, DataObject, Options } from '@loopback/repository';
import { SuperModel } from '../models';
import { ModelIdType, StringUtility } from '@david.ezechukwu/core';
import { CoreDataSource } from '../datasources';


/** Errors thrown by this service. Use the syntax shown below,a s this is what the Sequence Handler expects
 */
export const SuperModelRepositoryServiceErrors = {
	UnableToInferPropertyType: '400[$]The data provided is invalid as a property type could not be inferred. <stripped-out-on-prod>Info({{0}}). Extra Info: {{1}}</stripped-out-on-prod>',
	InvalidParam: '400[$]The data provided is invalid as it contains either an invalid or mismatched parameter(if call was made via REST) or property(if can was made via code). <stripped-out-on-prod>Info({{0}}). Extra Info: {{1}}</stripped-out-on-prod>',
	RequiredParam: '422[$]The data provided is invalid as it lacks a required parameter(if call was made via REST) or property(if can was made via code). <stripped-out-on-prod>Info({{0}}). Extra Info: {{1}}</stripped-out-on-prod>',
	ValidationFailed: '409[$]The data provided is invalid as it failed a validation check. <stripped-out-on-prod>Info({{0}}). Extra Info: {{1}}</stripped-out-on-prod>',
	NoEntityFound: '404[$]There is no record. <stripped-out-on-prod>With Info({{0}}). Extra Info: {{1}}</stripped-out-on-prod>',
	GenericError: '418[$]Something really bad has happened, please review <stripped-out-on-prod>Extra Info: {{0}}</stripped-out-on-prod>',
	/*SQL Server specific codes*/
	SqlServerRequestError: '409[$]Message from SQL Server: Model({{0}}) SQLError({{1}})',
	SqlServerRequestCancelled: '409[$]Operation canceled: Model({{0}}) SQLError({{1}})',
	SqlServerRequestTimedOut: '504[$]Request timeout. Model({{0}}) SQLError({{1}})',
	SqlServerRequestNoConnection: '504[$]No connection is specified for that request. Model({{0}}) SQLError({{1}})',
	SqlServerConnectionError: '504[$]Connection not yet open. Model({{0}}) SQLError({{1}})',
	SqlServerConnectionClosed: '504[$]Connection is closed. Model({{0}}) SQLError({{1}})',
	SqlServerTransactionError: '418[$]Transaction has not begun. Model({{0}}) SQLError({{1}})',
	SqlServerTransactionAbort: '418[$]Transaction was aborted (by user or because of an error). Model({{0}}) SQLError({{1}})'
}


export abstract class SuperModelRepositoryService<TMODEL extends SuperModel, TMODEL_RELATIONS extends object> extends DefaultTransactionalRepository<TMODEL, ModelIdType, TMODEL_RELATIONS> {
	constructor(MODEL: typeof Entity & { prototype: TMODEL }, dataSource: CoreDataSource) {
		super(MODEL, dataSource);
	}

	public async ValidateForCreate(model: any): Promise<[boolean, string[]]> {
		return new Promise<[boolean, string[]]>((resolve, reject) => {
			try {
				const baseValidation: [boolean, string[]] = [true, []];
				if (model.Id) {
					baseValidation[0] = false;
					baseValidation[1].push(`Id is expected to be undefined as it is auto-generated on the data source`);
				}
				if (model.IsDeleted == true) {
					baseValidation[0] = false;
					baseValidation[1].push(`IsDeleted is expected to be undefined as a new object can't be set to IsDeleted on creation`);
				}
				if (model.CreatedOn) {
					baseValidation[0] = false;
					baseValidation[1].push(`CreatedOn is expected to be undefined as it is meant to be set on the data store`);
				}
				if (!model.CreatedById) {
					baseValidation[0] = false;
					baseValidation[1].push(`CreatedById is expected to be valid`);
				}
				if (model.UpdatedOn) {
					baseValidation[0] = false;
					baseValidation[1].push(`UpdatedOn is expected to be undefined as it is meant to be set on the data store`);
				}
				if (!model.UpdatedById) {
					baseValidation[0] = false;
					baseValidation[1].push(`UpdatedById is expected to be valid`);
				}
				if (model.ValidFrom && model.ValidTo && model.ValidFrom.getTime() >= model.ValidTo.getTime() - 21600000) {
					baseValidation[0] = false;
					baseValidation[1].push(`ValidFrom is later or equal to ValidTo using the minimum span which is 6hrs`);
				}
				return resolve(baseValidation);
			} catch (error) {
				return reject(error);
			}
		});
	}

	public async ValidateForUpdate(model: any): Promise<[boolean, string[]]> {
		return new Promise<[boolean, string[]]>((resolve, reject) => {
			try {
				const baseValidation: [boolean, string[]] = [true, []];
				if (!model.Id) {
					baseValidation[0] = false;
					baseValidation[1].push(`Id is expected not to be valid as it is needed to reference the resource on the data source`);
				}
				if (model.IsDeleted == true) {
					baseValidation[0] = false;
					baseValidation[1].push(`IsDeleted is expected to be undefined as a new object can't be set to IsDeleted on creation`);
				}
				if (!model.CreatedOn) {
					baseValidation[0] = false;
					baseValidation[1].push(`CreatedOn is expected to be valid`);
				}
				if (!model.CreatedById) {
					baseValidation[0] = false;
					baseValidation[1].push(`CreatedById is expected to be valid`);
				}
				if (!model.UpdatedOn) {
					baseValidation[0] = false;
					baseValidation[1].push(`UpdatedOn is expected to be valid`);
				}
				if (!model.UpdatedById) {
					baseValidation[0] = false;
					baseValidation[1].push(`UpdatedById is expected to be valid`);
				}
				if (model.ValidFrom && model.ValidTo && model.ValidFrom.getTime() >= model.ValidTo.getTime() - 21600000) {
					baseValidation[0] = false;
					baseValidation[1].push(`ValidFrom is later or equal to ValidTo using the minimum span which is 6hrs`);
				}
				return resolve(baseValidation);
			} catch (error) {
				return reject(error);
			}
		});
	}

	public HandleRepositoryError(e: any): string {
		switch (e.code) {
			case 'CANNOT_INFER_PROPERTY_TYPE':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.UnableToInferPropertyType, JSON.stringify(model), JSON.stringify(e)))
			case 'MISSING_REQUIRED_PARAMETER':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.RequiredParam, JSON.stringify(model), JSON.stringify(e)))
			case 'INVALID_PARAMETER_VALUE':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.InvalidParam, JSON.stringify(model), JSON.stringify(e)))
			case 'VALIDATION_FAILED':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.ValidationFailed, JSON.stringify(model), JSON.stringify(e)))
			case 'ENTITY_NOT_FOUND':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.NoEntityFound, JSON.stringify(model), JSON.stringify(e)))
			/*SQL Server specific codes*/
			case 'EREQUEST':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerRequestError, JSON.stringify(model), JSON.stringify(e)))
			case 'ECANCEL':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerRequestCancelled, JSON.stringify(model), JSON.stringify(e)))
			case 'ETIMEOUT':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerRequestTimedOut, JSON.stringify(model), JSON.stringify(e)))
			case 'ENOCONN':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerRequestNoConnection, JSON.stringify(model), JSON.stringify(e)))
			case 'ENOTOPEN':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerConnectionError, JSON.stringify(model), JSON.stringify(e)))
			case 'ECONNCLOSED':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerConnectionClosed, JSON.stringify(model), JSON.stringify(e)))
			case 'ENOTBEGUN':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerTransactionError, JSON.stringify(model), JSON.stringify(e)))
			case 'EABORT':
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.SqlServerTransactionAbort, JSON.stringify(model), JSON.stringify(e)))			
			default:
				return (StringUtility.StringFormat(SuperModelRepositoryServiceErrors.GenericError, JSON.stringify(e)))
		}
	}


	// eslint-disable-next-line
	public async create(entity: DataObject<TMODEL>, options?: Options): Promise<TMODEL> {
		return this.Create(entity, options);
	}
	// eslint-disable-next-line
	public async createAll(entities: DataObject<TMODEL>[], options?: Options): Promise<TMODEL[]> {
		return this.CreateAll(entities, options);
	}
	// eslint-disable-next-line
	public async save(entity: TMODEL, options?: Options): Promise<TMODEL> {
		return this.Save(entity, options);
	}
	// eslint-disable-next-line
	public async find(filter?: Filter<TMODEL>, options?: Options): Promise<(TMODEL & TMODEL_RELATIONS)[]> {
		return this.Find(filter, options);
	}
	// eslint-disable-next-line
	public async findOne(filter?: Filter<TMODEL>, options?: Options): Promise<(TMODEL & TMODEL_RELATIONS) | null> {
		return this.FindOne(filter, options);
	}
	// eslint-disable-next-line
	public async findById(id: ModelIdType, filter?: FilterExcludingWhere<TMODEL>, options?: Options): Promise<TMODEL & TMODEL_RELATIONS> {
		return this.FindById(id, filter, options);
	}
	// eslint-disable-next-line
	public async update(entity: TMODEL, options?: Options): Promise<void> {
		return this.Update(entity, options);
	}
	// eslint-disable-next-line
	public async updateAll(data: DataObject<TMODEL>, where?: Where<TMODEL>, options?: Options): Promise<Count> {
		return this.UpdateAll(data, where, options);
	}
	// eslint-disable-next-line
	public async updateById(id: ModelIdType, data: DataObject<TMODEL>, options?: Options): Promise<void> {
		return this.UpdateById(id, data, options);
	}
	// eslint-disable-next-line
	public async replaceById(id: ModelIdType, data: DataObject<TMODEL>, options?: Options): Promise<void> {
		return this.ReplaceById(id, data, options);
	}
	// eslint-disable-next-line
	public async delete(entity: TMODEL, options?: Options): Promise<void> {
		return this.Delete(entity, options);
	}
	// eslint-disable-next-line
	public async deleteAll(where?: Where<TMODEL>, options?: Options): Promise<Count> {
		return this.DeleteAll(where, options);
	}
	// eslint-disable-next-line
	public async deleteById(id: ModelIdType, options?: Options): Promise<void> {
		return this.DeleteById(id, options);
	}
	// eslint-disable-next-line
	public async count(where?: Where<TMODEL>, options?: Options): Promise<Count> {
		return this.Count(where);
	}
	// eslint-disable-next-line
	public async exists(id: ModelIdType, options?: Options): Promise<boolean> {
		return this.Exists(id, options);
	}

	public async Create(model: DataObject<TMODEL>, options?: Options): Promise<TMODEL> {
		return new Promise<TMODEL>(async (resolve, reject) => {
			try {
				const validationErrors = await this.ValidateForCreate(model);
				if (!validationErrors[0]) {
					return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.InvalidParam, JSON.stringify(model), JSON.stringify(validationErrors[1].join('. ').trim())))
				}
				let data = await super.create(model, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async CreateAll(models: DataObject<TMODEL>[], options?: Options): Promise<TMODEL[]> {
		return new Promise<TMODEL[]>(async (resolve, reject) => {
			try {
				let data = await super.createAll(models, options);
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async Save(model: TMODEL, options?: Options): Promise<TMODEL> {
		return new Promise<TMODEL>(async (resolve, reject) => {
			try {
				let data = await super.save(model, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async Find(filter?: Filter<TMODEL>, options?: Options): Promise<(TMODEL & TMODEL_RELATIONS)[]> {
		return new Promise<(TMODEL & TMODEL_RELATIONS)[]>(async (resolve, reject) => {
			try {
				let data = await super.find(filter, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async FindOne(filter?: Filter<TMODEL>, options?: Options): Promise<(TMODEL & TMODEL_RELATIONS) | null> {
		return new Promise<(TMODEL & TMODEL_RELATIONS) | null>(async (resolve, reject) => {
			try {
				let data = await super.findOne(filter, options);
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async FindById(id: ModelIdType, filter?: FilterExcludingWhere<TMODEL>, options?: Options): Promise<TMODEL & TMODEL_RELATIONS> {
		return new Promise<TMODEL & TMODEL_RELATIONS>(async (resolve, reject) => {
			try {
				let data = await super.findById(id, filter, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async Update(model: TMODEL, options?: Options): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const validationErrors = await this.ValidateForUpdate(model);
				if (!validationErrors[0]) {
					return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.InvalidParam, JSON.stringify(model), JSON.stringify(validationErrors[1].join('. ').trim())))
				}
				await super.update(model, options);
				return resolve();
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}


	public async UpdateAll(model: DataObject<TMODEL>, where?: Where<TMODEL>, options?: Options): Promise<Count> {
		return new Promise<Count>(async (resolve, reject) => {
			try {
				let data = await super.updateAll(model, where, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async UpdateById(id: ModelIdType, model: DataObject<TMODEL>, options?: Options): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const validationErrors = await this.ValidateForUpdate(model);
				if (!validationErrors[0]) {
					return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.InvalidParam, JSON.stringify(model), JSON.stringify(validationErrors[1].join('. ').trim())))
				}
				const soughtModel = await this.FindById(model.Id! as ModelIdType);
				if (!soughtModel) {
					return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.NoEntityFound, id.toString(), JSON.stringify(model)))
				}

				let data = await super.updateById(id, model, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async ReplaceById(id: ModelIdType, model: DataObject<TMODEL>, options?: Options): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const validationErrors = await this.ValidateForUpdate(model);
				if (!validationErrors[0]) {
					return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.InvalidParam, JSON.stringify(model), JSON.stringify(validationErrors[1].join('. ').trim())))
				}
				let data = await super.replaceById(id, model, options)
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		})
	}

	public async Delete(model: TMODEL, options?: Options): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				await super.delete(model, options);
				return resolve();
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		});
	}

	public async DeleteAll(where?: Where<TMODEL>, options?: Options): Promise<Count> {
		return new Promise<Count>(async (resolve, reject) => {
			try {
				let data = await super.deleteAll(where, options);
				return resolve(data)
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		});
	}

	public async DeleteById(id: ModelIdType, options?: Options): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				await super.deleteById(id);
				return resolve();
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		});
	}

	public async Count(where?: Where<TMODEL>): Promise<Count> {
		return new Promise<Count>(async (resolve, reject) => {
			try {
				let data = await super.count(where);
				return resolve(data);
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		});
	}

	public async Exists(id: ModelIdType, options?: Options): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			try {
				let data = await super.exists(id, options)
				return resolve(data)
			} catch (e) {
				return reject(this.HandleRepositoryError(e))				
			}
		});
	}

	public async PatchOrCreateAll(models: DataObject<TMODEL>[], where?: Where<TMODEL>): Promise<Count> {
		return new Promise<Count>(async (resolve, reject) => {
			const newModels: DataObject<TMODEL>[] = models.filter(model => !model.Id);
			const modelsToUpdate: DataObject<TMODEL>[] = models.filter(model => model.Id);
			const validationErrors: [boolean, string[]] = [true, []];
			newModels.forEach(async (newModel: DataObject<TMODEL>) => {
				const validationErrorsForNewUser = await this.ValidateForCreate(newModel);
				validationErrors[1].concat(validationErrorsForNewUser[1]);
			});
			modelsToUpdate.forEach(async modelToUpdate => {
				const validationErrorsForNewUser = await this.ValidateForUpdate(modelToUpdate);
				validationErrors[1].concat(validationErrorsForNewUser[1]);
			});
			if (!validationErrors[0]) {
				return reject(StringUtility.StringFormat(SuperModelRepositoryServiceErrors.ValidationFailed, JSON.stringify(models), JSON.stringify((validationErrors[1].join('. ').trim()))))
			}
			const allActions = [];
			if (this.dataSource.settings.SupportsTransaction) {
				const transaction = await this.beginTransaction(IsolationLevel.SERIALIZABLE);
				try {
					allActions.push(this.createAll(newModels, { transaction: transaction }));
					modelsToUpdate.forEach(model => allActions.push(this.UpdateById(model.Id! as ModelIdType, model, { transaction: transaction })));
					await Promise.all(allActions);
					transaction.commit();
				} catch (e: any) {
					if (transaction.isActive()) {
						transaction.rollback();
					}
					return reject(this.HandleRepositoryError(e))				
				}
			} else {
				try {
					const allUpdates = [];
					allUpdates.push(this.CreateAll(newModels));
					modelsToUpdate.forEach(model => {
						allUpdates.push(this.ReplaceById(model.Id! as ModelIdType, model));
					});
					await Promise.all(allUpdates);
				} catch (e: any) {
					return reject(this.HandleRepositoryError(e))				
				}
			}
			return resolve({ count: models.length });
		});
	}
}
