import * as Winston from 'winston'
import {ConfigurationType} from '../Configuration'
import { NotificationService } from '../services'
import { SuperApplication } from '../SuperApplication'
import { LoggingBindings } from '@loopback/logging'
const debug = require('debug')('decode:Worker:SuperWorker')

/**
 * The super class for all workers.
 */
export abstract class SuperWorker extends SuperApplication {
    public DontExit = true    
    public constructor(
        protected SuperWorkerConfig: ConfigurationType,
        public projectRoot: string
    ) {
        super(SuperWorkerConfig,  __dirname)
		this.ConfigureApplication()
        this.onStart(async () => this.OnStart())
        this.onStop(async () => this.OnStop())
    }

    /**
     * The OnStart function for the task
     * @remarks
     * This should run and then shut down, freeing all resources.
     * Implemented in derived classes
     * */
    public async OnStart(): Promise<void>{
		this.Logger.info(`starting server ${this.name}`)
	}

    /**
     * The OnStop function for the task
     * @remarks
     * This should run and then shut down, freeing all resources.
     * Implemented in derived classes
     * */
    public abstract OnStop(): Promise<void>

    /**
     * Sleep function
     * Not to be used in production*/
    public Sleep(milliseconds: number) {
        if (this.SuperWorkerConfig.env == 'production') {
            this.Logger.error(`Sleeping is not allowed in production`)
        }
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds)
        })
    }
}
