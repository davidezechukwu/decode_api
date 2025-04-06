import {once} from 'events'
import express from 'express'
import https from 'https'
import http from 'http'
import {createClient} from 'redis'
import {RedisStore} from 'connect-redis'
import {AddressInfo} from 'net'
import {Api} from './Api'
import {ConfigurationType} from './Configuration'
const bodyParser = require('body-parser')
const path = require('path')
const favicon = require('serve-favicon')
const expressSession = require('express-session')

/**
 * Based on express WebServer which can have with multiple mounts
 */
export class ExpressServer {
    public Application: express.Application
    public Api: Api
    public WebServer?: https.Server | http.Server
    public WebServerUrl: string	

    constructor(public readonly Configuration: ConfigurationType) {
        this.Application = express()
        this.Api = new Api(this.Configuration, this.Application)		
    }

    /**
     * Boot the Api and other express apps
     */
    public async Boot() {		
		this.Api.Logger.debug(`About to boot ${ExpressServer.name}`)
        await this.Api.boot()
		this.Api.Logger.debug(`Finished booting ${ExpressServer.name}`)
    }

    /**
     * Initiate the Api and other express apps
     */
    public async Init() {		
		this.Api.Logger.debug(`About to initialize ${ExpressServer.name}`)
        await this.Api.init()
		this.Api.Logger.debug(`Finished the initialization of ${ExpressServer.name}`)

        //view engine setup
        this.Application.set('views', this.Configuration.expressJS!.viewPath)
        this.Application.set('view engine', this.Configuration.expressJS!.viewEngine)
		
		//IP address detection behind a proxy( such as nginx, which is currently used in prod) 
		this.Application.set('trust proxy', true)

        this.Application.disable('x-powered-by')

        //static handling
        this.Application.use('static', express.static(this.Configuration.rest?.staticPaths![0]!))
        this.Application.use(favicon(path.join(this.Configuration.rest?.staticPaths![0]! + '/images', 'favicon.ico')))

        //session handling
        const redisClientOptions = {
            url: `redis://${this.Configuration.redis?.username}:${this.Configuration.redis?.password}@${this.Configuration.redis?.host}:${this.Configuration.redis?.port}`,
            legacyMode: false
        }

		this.Api.Logger.debug(`About to create the Redis Client`)
        const redisClient = createClient(redisClientOptions)
        try {
            redisClient.on('error', err => {
				this.Api.Logger.debug(`${err.message}`)
                this.Api.Logger.debug(`Redis Client Error: ${err}`)
				this.Api.Logger.error(`Redis Client creation failed, error code: 666`)
                throw `666[$]Redis Error, check redis settings`
            })
            await redisClient.connect()
        } catch (e) {
            const Reason = `Failed to connect to the redis server at ${JSON.stringify(redisClientOptions)}, connection failed with this message({JSON.stringify(e)})`
            const Fix = `If running locally, check that .\_infrastructure\docker\os\windows\set-up-port-forwarding-for-wsl2.ps1 has been executed`
            this.Api.Logger.debug(Reason)
            this.Api.Logger.debug(Fix)
			this.Api.Logger.error(`Redis Client creation failed, error code: 666`)
            throw `666[$]Redis Error, check Redis settings. ${JSON.stringify(e)}`
        }

        if (this.Configuration.env != 'development') {
            if (this.Configuration.expressJS!.expressionSession.sessionCookie.SameSite !== 'strict') {
                this.Configuration.expressJS!.expressionSession!.sessionCookie!.SameSite = 'strict'
                this.Api.Logger.debug('Switching to Strict Mode Same Site Cookie policy')
            }
        } else {
            if (this.Configuration.expressJS?.expressionSession.sessionCookie.SameSite !== 'lax') {
                this.Configuration.expressJS!.expressionSession!.sessionCookie!.SameSite = 'lax'
                this.Api.Logger.debug('Switching to Lax Mode Same Site Cookie policy')
                this.Api.Logger.debug('Strict mode requires client and api to be on the same origin and port, i.e client on site.com and on site.com/api not site.com:3000/api')
            }
        }

        /*see: https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-03#page-20 */
        this.Application.use(
            expressSession({
                name: this.Configuration.expressJS?.expressionSession.cookieName,
                secret: this.Configuration.expressJS?.expressionSession.cookieSecret,
                store: new RedisStore({client: redisClient}),
                saveUninitialized: this.Configuration.expressJS?.expressionSession.saveUninitialized,
                resave: this.Configuration.expressJS?.expressionSession.resave,
                cookie: {
                    domain: this.Configuration.expressJS?.expressionSession.sessionCookie.domain,
                    secure: this.Configuration.expressJS?.expressionSession.sessionCookie.secure,
                    path: this.Configuration.expressJS?.expressionSession.sessionCookie.path,
                    httpOnly: this.Configuration.expressJS?.expressionSession.sessionCookie.httpOnly,
                    maxAge: this.Configuration.expressJS?.expressionSession.sessionCookie.maxAge,
                    sameSite: this.Configuration.expressJS?.expressionSession.sessionCookie.SameSite
                }
            })
        )

        //express body parsing
        this.Application.use(bodyParser.urlencoded({extended: false}))
        this.Application.use(bodyParser.raw())

        //minimal routes
        const config = this.Configuration
        this.Application.get('', (req: any, res: any) => {
            res.redirect(`${req.baseUrl}${config.expressJS?.mountPath!}${config.rest?.basePath!}${config.loopBackExplorerPath}`)
        })
        this.Application.get('/', (req: any, res: any) => {
            res.redirect(`${req.baseUrl}${config.expressJS?.mountPath!}${config.rest?.basePath!}${config.loopBackExplorerPath}`)
        })

        //mount api
        this.Application.use(this.Configuration.expressJS?.mountPath!, this.Api.requestHandler)

		//Configure error handling last 		
		this.Api.ConfigureErrorHandling()
    }

    /**
     * Start the Api and other express apps
     */
    public async Start() {		
		this.Api.Logger.debug(`About to start ${ExpressServer.name}`)        		
        await this.Api.start()
		this.Api.Logger.debug(`Finished the starting ${ExpressServer.name}`)
        const port = this.Configuration.rest!.port!
        const host = this.Configuration.rest!.host!
        if (this.Configuration.rest?.protocol == 'http') {
            this.WebServer = http.createServer({}, this.Application).listen(port, host)
        } else {
            this.WebServer = https
                .createServer(
                    {
                        key: this.Configuration.rest!.sslPrivatekey,
                        cert: this.Configuration.rest!.sslCertificate,
                        ca: this.Configuration.rest!.sslCACertificate
                    },
                    this.Application
                )
                .listen(port, host)
        }

        await once(this.WebServer, 'listening')
		this.Api.Logger.debug(`${ExpressServer.name} is listening`)
        const addressInfo = <AddressInfo>this.WebServer.address()
        this.WebServerUrl = `${this.Configuration.rest?.protocol}://${addressInfo.address}:${addressInfo.port}`
        return this.WebServer
    }

    /**
     * Stop the Api and other express apps
     */
    public async Stop() {		
		this.Api.Logger.debug(`${ExpressServer.name} is being stopped, ${!this.WebServer ? 'this.WebServer(Node.js HTTP/HTTPS server) is null' : 'this.WebServer(Node.js HTTP/HTTPS server) is not null'}`)
        if (!this.WebServer) return
		this.Api.Logger.debug(`${ExpressServer.name} is being stopped gracefully`)
        await this.Api.stop()
		this.Api.Logger.debug(`${ExpressServer.name} is has been stopped gracefully`)
        this.WebServer.close()
		this.Api.Logger.debug(`this.WebServer(Node.js HTTP/HTTPS server)  is being stopped gracefully`)
        await once(this.WebServer, 'close')
		this.Api.Logger.debug(`this.WebServer(Node.js HTTP/HTTPS server)  is has been stopped gracefully`)
        this.WebServer = undefined
    }

    /**
     * Data Migration
     */
    public async Migrate() {}
}
