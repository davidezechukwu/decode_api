import { inject, injectable } from '@loopback/core'
import { Request as ExpressRequest } from 'express'
import { authenticate } from '@loopback/authentication'
import {
	StringUtility,
	IUser,
	ILookup,
	ILookupCategory,
	IUserLogon,
	ILoginRequest,
	IRegisterRequest
} from '@david.ezechukwu/core'
import { LocalStrategyOptions } from '../../Configuration'
import { SuperService, UserService, LookupService } from '../../services'
import {
	UserEmailAddressModel,
	UserLogonModel,
	UserModel,
	UserPasswordModel
} from '../../models'
import {
	UserLogonRepositoryService,
	UserPasswordRepositoryService,
	UserEmailAddressRepositoryService,
	RoleRepositoryService,
	GroupRepositoryService,
	UserGroupRepositoryService,
	UserGroupRoleRepositoryService
} from '../../repositories'
import { Lookups } from '../../_infrastructure/fixtures/localisation/Lookups'
import { SuperBindings } from '../../SuperBindings'
import { LocalisationUtils } from '../../utils'
import { securityId } from '@loopback/security'
import { RequestWithSession } from '@loopback/rest'


const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const crypto = require('crypto')

// #region providers
const localAuthenticationProviderName = lookups.AuthenticationProviders.Local.Value
const facebookAuthenticationProviderName = lookups.AuthenticationProviders.Facebook.Value
const twitterAuthenticationProviderName = lookups.AuthenticationProviders.Twitter.Value
const googleAuthenticationProviderName = lookups.AuthenticationProviders.Google.Value
const linkedInAuthenticationProviderName = lookups.AuthenticationProviders.LinkedIn.Value
const sessionAuthenticationProviderName = lookups.AuthenticationProviders.Session.Value
const jwtAuthenticationProviderName = lookups.AuthenticationProviders.JWT.Value
// #endregion providers

//#region Session object
/**
 * The custom session object which augments the standard express-session object
 * */
declare module 'express-session' {
	/* eslint-disable @typescript-eslint/naming-convention */
	interface SessionData {
		User: UserModel
		PreviousAccessedTime: string
		LastAccessedTime: string
	}
}
// #endregion Session object

export const AuthenticationServiceErrors = {
	IncorrectUsernameOrPassword : '422[$]Incorrect username or password',
	NoLogonfound: '409[$]No logon found',
	NoUserFound: '418[$]No user found',
	ALogonAlreadyExistWithTheSameDetails: '451[$]Another logon already exist with the same details for another user',
}

/**
 * The authentication service
 * */
@injectable({ tags: { key: SuperBindings.AuthenticationServiceBindingKey.key } })
export class AuthenticationService extends SuperService {
	constructor(
		@inject(SuperBindings.LookupServiceBindingKey.key)
		protected LookupService: LookupService,
		@inject(RoleRepositoryService.BINDING_KEY)
		protected RoleRepositoryService: RoleRepositoryService,
		@inject(GroupRepositoryService.BINDING_KEY)
		protected GroupRepositoryService: GroupRepositoryService,
		@inject(SuperBindings.UserServiceBindingKey.key)
		protected UserService: UserService,
		@inject(UserLogonRepositoryService.BINDING_KEY.key)
		protected UserLogonRepositoryService: UserLogonRepositoryService,
		@inject(UserPasswordRepositoryService.BINDING_KEY)
		protected UserPasswordRepositoryService: UserPasswordRepositoryService,
		@inject(UserEmailAddressRepositoryService.BINDING_KEY)
		protected UserEmailAddressRepositoryService: UserEmailAddressRepositoryService,
		@inject(UserGroupRepositoryService.BINDING_KEY)
		protected UserGroupRepositoryService: UserGroupRepositoryService,
		@inject(UserGroupRoleRepositoryService.BINDING_KEY)
		protected UserGroupRoleRepositoryService: UserGroupRoleRepositoryService
	) {
		super()
	}

	/**
	 * Decorator for specifying that session authentication is required for a controller/controller method
	 * */
	public static RequireSessionAuthentication() {
		return authenticate(sessionAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that local authentication is required for a controller/controller method
	 * */
	public static RequireLocalAuthentication() {
		return authenticate(localAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that facebook OAUTH authentication is required for a controller/controller method
	 * */
	public static RequireFacebookAuthentication() {
		return authenticate(facebookAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that google OAUTH authentication is required for a controller/controller method
	 * */
	public static RequireGoogleAuthentication() {
		return authenticate(googleAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that twitter OAUTH authentication is required for a controller/controller method
	 * */
	public static RequireTwitterAuthentication() {
		return authenticate(twitterAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that linked OAUTH authentication is required for a controller/controller method
	 * */
	public static RequireLinkedInAuthentication() {
		return authenticate(linkedInAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that JWT authentication is required for a controller/controller method
	 * */
	public static RequireJWTAuthentication() {
		return authenticate(jwtAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that OAUTH authentication is required for a controller/controller method
	 * */
	public static RequireOAUTHAuthentication() {
		return authenticate(googleAuthenticationProviderName, facebookAuthenticationProviderName, twitterAuthenticationProviderName, linkedInAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying that session authentication is required for a controller/controller method
	 * */
	public static RequireAuthentication() {
		return authenticate(sessionAuthenticationProviderName, jwtAuthenticationProviderName)
	}

	/**
	 * Decorator for specifying a authentication strategy for a controller/controller method biased on the supplied provider	 
	 * */
	public static RequireAuthenticationUsingProvider(provider: string) {
		return authenticate(provider)
	}

	/**
	 * Set the session object using Loopback
	 * */
	public async SetSessionUsingLoopbackReq(req: RequestWithSession, user: IUser): Promise<void> {
		this.Logger.debug(`Before: req.session.id = ${req.session.id}`)
		return new Promise<void>((resolve, reject) => {
			try {
				req.session.LastAccessedTime = new Date(Date.now()).toUTCString()
				req.session.PreviousAccessedTime = req.session.LastAccessedTime
				req.session.User = user
				req.session.User[securityId] = '' + user.Id
				req.session.save()
				this.Logger.debug(`After: req.session.id = ${req.session.id}`)
				resolve()
			} catch (e) {
				reject(e)
			}
		})
	}

	/**
	 * Set the session object using Express
	 * */
	public async SetSessionUsingExpressReq(req: ExpressRequest, user: IUser | null): Promise<void> {
		this.Logger.debug(`Before: req.session.id = ${req.session.id}`)
		return new Promise<void>((resolve, reject) => {
			try {
				if (!user) {
					this.Logger.debug(`User in SetSessionUsingExpressReq is null`)
					reject(`User in SetSessionUsingExpressReq is null`)
				}
				req.session.LastAccessedTime = new Date(Date.now()).toUTCString()
				req.session.PreviousAccessedTime = req.session.LastAccessedTime
				req.session.User = new UserModel({ ...user })
				req.session.User[securityId] = '' + user!.Id
				req.session.save()
				this.Logger.debug(`After: req.session.id = ${req.session.id}`)
				resolve()
			} catch (e) {
				reject(e)
			}
		})
	}

	/**
	 * Destroy the current session
	 * */
	public async DestroySession(req: ExpressRequest): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				req.session.destroy(function (err) {
					if (err) {
						return reject(err)
					}
					//TODO: persist logout info on database, i.e location, time and date, device
					//TODO: maintain some settings such as animation and language settings
					resolve()
				})
			} catch (e) {
				reject(e)
			}
		})
	}

	/**
	 * Sign out of the current session
	 * */
	public async SignOut(user: Partial<IUser>): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				this.Logger.debug(`Logging out user id(${user.Id})`)
				return resolve()
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Authenticate using local authentication strategy
	 * */
	public async Login(loginRequest: ILoginRequest): Promise<IUser | null> {
		return new Promise<IUser | null>(async (resolve, reject) => {
			try {
				const provider = lookups.AuthenticationProviders.Local.Value
				const userLogon = await this.FindLogon(provider, loginRequest.Username, loginRequest.Username)
				if (!userLogon) {
					return reject(AuthenticationServiceErrors.NoLogonfound)
				}
				const user: IUser = await this.UserService.GetUser({ Id: userLogon?.UserId })
				if (!user) {
					return reject(AuthenticationServiceErrors.NoUserFound)
				}
				const userPassword = await this.UserPasswordRepositoryService.FindOne({ where: { UserId: user!.Id } })
				if ( !userPassword){
					throw `401[$]No Local Logon Password found for user`
				}
				const options: LocalStrategyOptions = this.Configuration.authentication?.localOptions!
				const passwordHashBuffer = await crypto.pbkdf2Sync(loginRequest.Password, userPassword?.PasswordSalt, options.pbkdf2Iterations, options.pbkdf2Keylen, options.pbkdf2Digest)
				const passwordHash = Buffer.from(passwordHashBuffer).toString('hex')
				if (!crypto.timingSafeEqual(StringUtility.HexStringToUint8Array(userPassword?.PasswordHash!), StringUtility.HexStringToUint8Array(passwordHash))) {
					userPassword.FailedAttempts = userPassword.FailedAttempts + 1
					this.UserPasswordRepositoryService.Save(userPassword)
					return reject(AuthenticationServiceErrors.IncorrectUsernameOrPassword)
				}
				userPassword.FailedAttempts = 0
				this.UserPasswordRepositoryService.Save(userPassword)
				return resolve(user)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Create a logon for local authentication strategy
	 * */
	public async Register(registerRequest: IRegisterRequest, languageLookup: ILookup): Promise<IUser | null> {
		return new Promise<IUser | null>(async (resolve, reject) => {
			try {
				if (registerRequest.Password !== registerRequest.PasswordConfirmation) {
					return reject(`418[$]There password and password confirmation do not match`)
				}
				const provider = lookups.AuthenticationProviders.Local.Value
				const _userLogon = await this.FindLogon(provider, registerRequest.Username, registerRequest.Username)
				if (_userLogon) {
					return reject(`409[$]There is already a logon for ${provider} authentication provider. //TODO: Block IP after x attempts`)
				}
				const basicTypesLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.BasicTypesLookupCategoryName)
                const primaryBasicTypeLookup = await this.LookupService.GetLookupByValue(basicTypesLookupCategory, lookups.BasicTypes.Primary.Value)				
				const authenticationProviderLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.AuthenticationProviderLookupCategoryName)
				const authenticationProviderLookup = await this.LookupService.GetLookupByValue(authenticationProviderLookupCategory, provider!)
				const options: LocalStrategyOptions = this.Configuration.authentication?.localOptions!
				const passwordSalt = Buffer.from(crypto.randomBytes(options.pbkdf2Keylen)).toString('hex')
				const passwordHashBuffer = await crypto.pbkdf2Sync(registerRequest.Password, passwordSalt, options.pbkdf2Iterations, options.pbkdf2Keylen, options.pbkdf2Digest)
				const passwordHash = Buffer.from(passwordHashBuffer).toString('hex')
				const userPassword = new UserPasswordModel({ PasswordHash: passwordHash, PasswordSalt: passwordSalt, PasswordStrength: registerRequest.PasswordStrength, FailedAttempts:0 })
				const userLogon = new UserLogonModel({ ProviderId: authenticationProviderLookup.Id, ProviderUserId: registerRequest.Username, ProviderUserName: registerRequest.Username })
				const userEmailAddresses: UserEmailAddressModel[] = [new UserEmailAddressModel({ EmailAddress: registerRequest.Username.toLowerCase(), EmailAddressTypeId: primaryBasicTypeLookup.Id })]
				let user = await this.UserService.CreateUserRecords({ languageLookup, userLogon, userEmailAddresses, userPassword })
				return resolve(user)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Create a logon for a given authentication strategy
	 * */
	public async CreateLogon(user: Partial<IUser>, provider: string, providerUserId: string, providerUserName?: string): Promise<[ILookupCategory, ILookup, IUserLogon]> {
		const _userLogon = await this.FindLogon(provider, providerUserId, providerUserName)
		if (_userLogon) {
			throw AuthenticationServiceErrors.ALogonAlreadyExistWithTheSameDetails
		}

		const authenticationProviderLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.AuthenticationProviderLookupCategoryName)
		const authenticationProviderLookup = await this.LookupService.GetLookupByValue(authenticationProviderLookupCategory, provider!)

		const userLogon = await this.UserLogonRepositoryService.Create({
			ProviderId: authenticationProviderLookup.Id,
			ProviderUserId: providerUserId,
			ProviderUserName: providerUserName,
			UserId: user.Id,
			CreatedById: user.CreatedById,
			UpdatedById: user.UpdatedById
		})
		return [authenticationProviderLookupCategory, authenticationProviderLookup, userLogon]
	}

	/**
	 * Find a logon for a given authentication strategy
	 * */
	public async FindLogon(provider: string, providerUserId: string, providerUserName?: string): Promise<IUserLogon | null> {
		const authenticationProviderLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.AuthenticationProviderLookupCategoryName)
		const authenticationProviderLookup = await this.LookupService.GetLookupByValue(authenticationProviderLookupCategory, provider!)

		let userLogon: IUserLogon | null = await this.UserLogonRepositoryService.FindOne({
			where: {
				ProviderUserId: providerUserId,
				ProviderId: authenticationProviderLookup.Id
			}
		})
		if (!userLogon && providerUserName && providerUserName.trim().length) {
			userLogon = await this.UserLogonRepositoryService.FindOne({
				where: {
					ProviderUserName: providerUserName,
					ProviderId: authenticationProviderLookup.Id
				}
			})
		}
		return userLogon
	}

	/**
	 * Check if an email address has already ben used for an authentication strategy
	 * */
	public async IsEmailAddressRegistered(loginRequest: ILoginRequest): Promise<boolean> {
		const userEmailAddress = await this.UserEmailAddressRepositoryService.FindOne({ where: { EmailAddress: loginRequest.Username.toLowerCase() } })
		return userEmailAddress != null
	}
}
