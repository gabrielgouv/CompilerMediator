import { transports, createLogger, format } from 'winston'

export class Logger {

    public static error(message: any) {
        this.logger.error(message)
    }

    public static warn(message: any) {
        this.logger.warn(message)
    }

    public static info(message: any) {
        this.logger.info(message)
    }

    public static verbose(message: any) {
        this.logger.verbose(message)
    }

    public static debug(message: any) {
        this.logger.debug(message)
    }

    public static silly(message: any) {
        this.logger.silly(message)
    }

    private static readonly logger = createLogger({
        format: format.combine(
            format.splat(),
            format.simple(),
        ),
        transports: [
            new transports.Console(),
        ],
    })

}
