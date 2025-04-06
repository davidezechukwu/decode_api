import {UserIdentityService} from '@loopback/authentication'
import {BindingKey, inject, injectable} from '@loopback/core'
import {securityId} from '@loopback/security'
import {Profile as PassportProfile} from 'passport'
import {IUser, TypeUtility} from '@david.ezechukwu/core'
import {
	UserEmailAddressModel, 
	UserLogonModel, 
	UserModel, 
	UserNameModel, 
	UserPhotoModel, 
} from '../../models'
import {
    UserLogonRepositoryService,
    UserEmailAddressRepositoryService,
    UserPhotoRepositoryService,
    UserDisplaySettingsRepositoryService,
    UserRepositoryService,
    UserWebLinkRepositoryService
} from '../../repositories'
import {SuperService, UserService, LookupService, AuthenticationService} from '../'
import {Lookups} from '../../_infrastructure/fixtures/localisation/Lookups'
import {SuperBindings} from '../../SuperBindings'
import {UserNameRepositoryService} from '../../repositories/UserNameRepositoryService'
import { LocalisationUtils } from '../../utils'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()

/**
 * The external authentication service
 * @remarks
 * The ExternalIndentityService contains functions required to link an external profiles from an external source (eg: ldap, oauth2 provider, saml)
 * to a user on the system. The external profile typically would the following information:
 *   name, email-id, uuid, roles, authorizations, scope of accessible resources, expiration time for given access
 */
@injectable({tags: {key: ExternalUserIdentityService.BINDING_KEY.key}})
export class ExternalUserIdentityService extends SuperService implements UserIdentityService<PassportProfile, UserModel> {
    static BINDING_KEY = BindingKey.create<ExternalUserIdentityService>(`services.${ExternalUserIdentityService.name}`)

    constructor(
        @inject(SuperBindings.LookupServiceBindingKey.key)
        protected LookupService: LookupService,
        @inject(UserRepositoryService.BINDING_KEY.key)
        protected UserRepositoryService: UserRepositoryService,
        @inject(UserLogonRepositoryService.BINDING_KEY.key)
        protected UserLogonRepositoryService: UserLogonRepositoryService,
        @inject(UserPhotoRepositoryService.BINDING_KEY.key)
        protected UserPhotoRepositoryService: UserPhotoRepositoryService,
        @inject(UserEmailAddressRepositoryService.BINDING_KEY.key)
        protected UserEmailAddressRepositoryService: UserEmailAddressRepositoryService,
        @inject(UserWebLinkRepositoryService.BINDING_KEY.key)
        protected UserWebLinkRepositoryService: UserWebLinkRepositoryService,
        @inject(UserDisplaySettingsRepositoryService.BINDING_KEY.key)
        protected UserDisplaySettingsRepositoryService: UserDisplaySettingsRepositoryService,
        @inject(UserNameRepositoryService.BINDING_KEY.key)
        protected UserNameRepositoryService: UserNameRepositoryService,
        @inject(SuperBindings.AuthenticationServiceBindingKey.key)
        protected AuthenticationService: AuthenticationService,
        @inject(SuperBindings.UserServiceBindingKey.key)
        protected UserService: UserService
    ) {
        super()
    }

    /**
     * Calls the Loopback's UserIdentityService<PassportProfile, UserModel>.findOrCreateUser'
     * */
    async FindOrCreateUser(/*req: ExpressRequest, */ passportProfile: PassportProfile): Promise<IUser> {
        const user = await this.findOrCreateUser(passportProfile)
        return user
    }

    /**
     * UserIdentityService.findOrCreateUser implementation
     */
    // eslint-disable-next-line
    findOrCreateUser(passportProfile: PassportProfile): Promise<UserModel> {
        return new Promise<UserModel>(async (resolve, reject) => {
            try {
                let exisitingUserLogon = await this.AuthenticationService.FindLogon(passportProfile.provider, passportProfile.id, passportProfile.username)
                if (exisitingUserLogon) {
                    let user = await this.UserRepositoryService.findOne({where: {Id: exisitingUserLogon?.UserId}})
                    user![securityId] = '' + user!.Id
                    return resolve(user!)
                }

				const providersCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('AuthenticationProviders'))
                if (!providersCategory) {
                    return reject(`Was unable to find a '${TypeUtility.NameOf<Lookups>('AuthenticationProviders')}' Lookup Category`)
                }
                const providerLookup = await this.LookupService.GetLookupByValue(providersCategory, passportProfile.provider)
                if (!providerLookup) {
                    return reject(`Was unable to find a Lookup of ${passportProfile.provider} for '${TypeUtility.NameOf<Lookups>('AuthenticationProviders')}' Lookup Category`)
                }                
				const basicTypesLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.BasicTypesLookupCategoryName)
                const tertiaryBasicTypeLookup = await this.LookupService.GetLookupByValue(basicTypesLookupCategory, lookups.BasicTypes.Tertiary.Value)
				const photoTypesLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.PhotoTypesLookupCategoryName)
                const avatarPhotoTypeLookup = await this.LookupService.GetLookupByValue(photoTypesLookupCategory, lookups.PhotoTypes.Avatar.Value)				

                const locale = 'en'
                const languageLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.LanguageLookupCategoryName)
                const languageLookup = await this.LookupService.GetLookupByValue(languageLookupCategory, locale!)
				const userLogon = new UserLogonModel({ProviderId: providerLookup?.Id,ProviderUserId: passportProfile.id, ProviderUserName: passportProfile.username})
				const userName = new UserNameModel({DisplayName: passportProfile.displayName,FirstName: passportProfile.name?.givenName,MiddleName: passportProfile.name?.middleName,LastName: passportProfile.name?.familyName})                
				const userEmailAddresses: UserEmailAddressModel[] = []
				//user is expected to provide/set their primary email if using aouth2 hence the reason emails default to tertiaryBasicTypeLookup
                passportProfile.emails?.forEach(email => {userEmailAddresses.push(new UserEmailAddressModel({EmailAddress: email.value.toLowerCase(),  EmailAddressTypeId: tertiaryBasicTypeLookup.Id}))}) 
				const userPhotos: UserPhotoModel[] = []
                passportProfile.photos?.forEach(photo => {userPhotos.push(new UserPhotoModel({URL: photo.value, PhotoTypeId: avatarPhotoTypeLookup.Id}))})
				let user = await this.UserService.CreateUserRecords({languageLookup, userLogon, userEmailAddresses, userPhotos })				
                return resolve(user!)			
            } catch (e) {
                return reject(e)
            }
        })
    }

    /**
     * Links an external logon such as a facebook or google logon
     * @remarks
     * UserIdentityService.linkExternalProfile implementation
     * FaceBook
     * The response object that's provided to your callback contains a number of fields:
        {
             status: 'connected',
             authResponse: {
                  accessToken: '...',
                  expiresIn:'...',
                  signedRequest:'...',
                  userId:'...'
             }
        }
        status specifies the login status of the person using the app. The status can be one of the following:
        connected - the person is logged into Facebook, and has logged into your app.
        not_authorized - the person is logged into Facebook, but has not logged into your app.
        unknown - the person is not logged into Facebook, so you don't know if they've logged into your app or FB.logout() was called before and therefore, it cannot connect to Facebook.
        authResponse is included if the status is connected and is made up of the following:
        accessToken - contains an access token for the person using the app.
        expiresIn - indicates the UNIX time when the token expires and needs to be renewed.
        signedRequest - a signed parameter that contains information about the person using the app.
        userId - the Id of the person using the app.     
     */
    // eslint-disable-next-line
    public async linkExternalProfile(providerId: string, passportProfile: PassportProfile): Promise<UserModel> {
        const providersCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('AuthenticationProviders'))
        if (!providersCategory) {
            throw `Was unable to find a '${TypeUtility.NameOf<Lookups>('AuthenticationProviders')}' Lookup Category`
        }
        const providerLookup = await this.LookupService.GetLookupByValue(providersCategory, passportProfile.provider)
        if (!providersCategory) {
            throw `Was unable to find a Lookup of ${passportProfile.provider} for '${TypeUtility.NameOf<Lookups>('AuthenticationProviders')}' Lookup Category`
        }

        const userLogon = await this.UserLogonRepositoryService.FindOne({where: {ProviderUserId: passportProfile.id, ProviderId: providerLookup?.Id}})
        const user = await this.UserRepositoryService.FindOne({where: {Id: userLogon?.UserId}})
        return user!
    }
}
